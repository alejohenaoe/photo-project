const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const { createClient } = await import('npm:@supabase/supabase-js@2.49.0')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { code } = await req.json()

    if (!code) {
      return new Response(JSON.stringify({ error: 'code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const hashed = await hashCode(code)

    const { data: accessCode, error: lookupError } = await supabase
      .from('access_codes')
      .select('id, client_id, expires_at')
      .eq('code_hash', hashed)
      .eq('is_active', true)
      .single()

    if (lookupError || !accessCode) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid code' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: 'Code has expired' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: client } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', accessCode.client_id)
      .single()

    return new Response(JSON.stringify({ valid: true, client }), {
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
