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

    const { data: permission } = await supabase
      .from('photo_permissions')
      .select('id')
      .eq('photo_id', photoId)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .maybeSingle()

    if (!permission) {
      return new Response(JSON.stringify({ error: 'You do not have permission to download this photo' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: photo } = await supabase
      .from('photos')
      .select('storage_path, filename')
      .eq('id', photoId)
      .single()

    if (!photo) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const signedUrl = await generatePresignedGetUrl(photo.storage_path)

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
