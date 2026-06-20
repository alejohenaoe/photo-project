const R2_ACCESS_KEY = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!
const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')!
const R2_BUCKET_O = Deno.env.get('R2_BUCKET_ORIGINALS')!
const R2_BUCKET_P = Deno.env.get('R2_BUCKET_PREVIEWS')!

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

async function setBucketCors(bucket: string): Promise<void> {
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const endpoint = `https://${host}/${bucket}?cors`
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)

  const corsXml = `<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedMethod>OPTIONS</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>`

  const bodyBytes = new TextEncoder().encode(corsXml)
  const payloadHash = hex(await crypto.subtle.digest('SHA-256', bodyBytes))

  const credential = `${R2_ACCESS_KEY}/${dateStamp}/auto/s3/aws4_request`
  const canonicalUri = `/${bucket}`
  const canonicalQuery = 'cors='

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\n`
  const signedHeaders = 'host;x-amz-content-sha256'

  const canonicalRequest =
    'PUT\n' +
    `${canonicalUri}\n` +
    `${canonicalQuery}\n` +
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

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${credential},SignedHeaders=${signedHeaders},Signature=${signature}`

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      'Content-Type': 'application/xml',
    },
    body: corsXml,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to set CORS on ${bucket}: ${res.status} ${body}`)
  }

  console.log(`CORS configured on ${bucket}`)
}

async function handler(req: Request): Promise<Response> {
  try {
    await Promise.all([setBucketCors(R2_BUCKET_O), setBucketCors(R2_BUCKET_P)])
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

Deno.serve(handler)
