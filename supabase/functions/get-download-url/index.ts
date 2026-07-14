const R2_ACCESS_KEY = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!
const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')!
const R2_BUCKET_O = Deno.env.get('R2_BUCKET_ORIGINALS')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function hex(b: ArrayBuffer): string {
  return Array.from(new Uint8Array(b)).map(v => v.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))
}

async function getSignatureKey(key: string, dateStamp: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp)
  const kRegion = await hmacSha256(kDate, 'auto')
  const kService = await hmacSha256(kRegion, 's3')
  return hmacSha256(kService, 'aws4_request')
}

async function generatePresignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const bucket = R2_BUCKET_O
  const endpoint = `https://${host}/${bucket}/${key}`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const credential = `${R2_ACCESS_KEY}/${dateStamp}/auto/s3/aws4_request`

  const canonicalQuery =
    `X-Amz-Algorithm=AWS4-HMAC-SHA256` +
    `&X-Amz-Credential=${encodeURIComponent(credential)}` +
    `&X-Amz-Date=${amzDate}` +
    `&X-Amz-Expires=${expiresIn}` +
    `&X-Amz-SignedHeaders=host`

  const canonicalHeaders = `host:${host}\n`
  const signedHeaders = 'host'

  const canonicalRequest =
    'GET\n' +
    `/${bucket}/${key}\n` +
    `${canonicalQuery}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    'UNSIGNED-PAYLOAD'

  const hashedCanonicalRequest = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))

  const stringToSign =
    'AWS4-HMAC-SHA256\n' +
    `${amzDate}\n` +
    `${dateStamp}/auto/s3/aws4_request\n` +
    `${hashedCanonicalRequest}`

  const signingKey = await getSignatureKey(R2_SECRET_KEY, dateStamp)
  const signature = hex(await hmacSha256(signingKey, stringToSign))

  return `${endpoint}?${canonicalQuery}&X-Amz-Signature=${signature}`
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const { createClient } = await import('npm:@supabase/supabase-js@2.49.0')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'client') {
      return new Response(JSON.stringify({ error: 'Only clients can download photos' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: clientProfile } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!clientProfile) {
      return new Response(JSON.stringify({ error: 'Client profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const clientId = clientProfile.id
    const { photoId } = await req.json()

    if (!photoId) {
      return new Response(JSON.stringify({ error: 'photoId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get photo + gallery to check permissions
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id, storage_path, filename, gallery_id')
      .eq('id', photoId)
      .is('deleted_at', null)
      .single()

    if (photoError || !photo) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check the gallery belongs to this client and has download capacity
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('client_id, download_limit, download_count')
      .eq('id', photo.gallery_id)
      .single()

    if (galleryError || !gallery) {
      return new Response(JSON.stringify({ error: 'Gallery not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (gallery.client_id !== clientId) {
      return new Response(JSON.stringify({ error: 'This gallery is not assigned to you' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (gallery.download_limit > 0 && gallery.download_count >= gallery.download_limit) {
      return new Response(JSON.stringify({ error: 'Download limit reached for this gallery' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const signedUrl = await generatePresignedGetUrl(photo.storage_path)

    // Increment download count and log
    const { error: updateError } = await supabase
      .from('galleries')
      .update({ download_count: gallery.download_count + 1 })
      .eq('id', photo.gallery_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('download_logs').insert({
      photo_id: photoId,
      client_id: clientId,
    })

    return new Response(JSON.stringify({ url: signedUrl, filename: photo.filename }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

Deno.serve(handler)
