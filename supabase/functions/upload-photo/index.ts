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

async function uploadToR2(bucket: string, key: string, body: Uint8Array, contentType: string): Promise<void> {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const endpoint = `https://${host}/${bucket}/${key}`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const payloadHash = hex(await crypto.subtle.digest('SHA-256', body))
  const credential = `${R2_ACCESS_KEY}/${dateStamp}/auto/s3/aws4_request`
  const canonicalUri = `/${bucket}/${key}`

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256'

  const canonicalRequest =
    'PUT\n' +
    `${canonicalUri}\n` +
    '\n' +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`

  const hashedCanonicalRequest = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))

  const stringToSign =
    'AWS4-HMAC-SHA256\n' +
    `${amzDate}\n` +
    `${dateStamp}/auto/s3/aws4_request\n` +
    `${hashedCanonicalRequest}`

  const signingKey = await getSignatureKey(R2_SECRET_KEY, dateStamp)
  const signature = hex(await hmacSha256(signingKey, stringToSign))

  const authHeader = `AWS4-HMAC-SHA256 Credential=${credential},SignedHeaders=${signedHeaders},Signature=${signature}`

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 upload failed: ${res.status} ${text}`)
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const { createClient } = await import('npm:@supabase/supabase-js@2.49.0')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const form = await req.formData()
    const galleryId = form.get('galleryId') as string
    const file = form.get('file') as File
    const preview = form.get('preview') as File | null

    if (!galleryId || !file) {
      return new Response(JSON.stringify({ error: 'galleryId and file are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const photoId = crypto.randomUUID()
    const ext = file.name.split('.').pop() || 'jpg'
    const storageKey = `${galleryId}/${photoId}.${ext}`
    const previewKey = `${galleryId}/${photoId}-preview.${ext}`

    const fileBytes = new Uint8Array(await file.arrayBuffer())
    const previewBytes = preview
      ? new Uint8Array(await preview.arrayBuffer())
      : fileBytes
    const previewMime = preview?.type || file.type || 'image/jpeg'

    await Promise.all([
      uploadToR2(R2_BUCKET_O, storageKey, fileBytes, file.type || 'image/jpeg'),
      uploadToR2(R2_BUCKET_P, previewKey, previewBytes, previewMime),
    ])

    const { error: dbError } = await supabase.from('photos').insert({
      id: photoId,
      gallery_id: galleryId,
      filename: file.name,
      storage_path: storageKey,
      preview_path: previewKey,
      size: fileBytes.length,
      mime_type: file.type || 'image/jpeg',
    })

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ photoId, filename: file.name }), {
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
