const R2_ACCESS_KEY = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!
const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')!
const R2_BUCKET_O = Deno.env.get('R2_BUCKET_ORIGINALS')!
const R2_BUCKET_P = Deno.env.get('R2_BUCKET_PREVIEWS')!

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

async function generatePresignedPutUrl(bucket: string, key: string): Promise<string> {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const endpoint = `https://${host}/${bucket}/${key}`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const expiresIn = 3600

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
    'PUT\n' +
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

    const { galleryId, filename, contentType } = await req.json()

    if (!galleryId || !filename) {
      return new Response(JSON.stringify({ error: 'galleryId and filename required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const photoId = crypto.randomUUID()
    const ext = filename.split('.').pop() || 'jpg'
    const storageKey = `${galleryId}/${photoId}.${ext}`
    const previewKey = `${galleryId}/${photoId}-preview.${ext}`
    const mime = contentType || 'image/jpeg'

    const [originalUrl, previewUrl] = await Promise.all([
      generatePresignedPutUrl(R2_BUCKET_O, storageKey),
      generatePresignedPutUrl(R2_BUCKET_P, previewKey),
    ])

    const { error: dbError } = await supabase.from('photos').insert({
      id: photoId,
      gallery_id: galleryId,
      filename,
      storage_path: storageKey,
      preview_path: previewKey,
      mime_type: mime,
    })

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ photoId, originalUrl, previewUrl, storageKey, previewKey }), {
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
