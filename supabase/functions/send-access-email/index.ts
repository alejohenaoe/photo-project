const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'NEFTIK PHOTO <onboarding@resend.dev>'
    const { email, code, clientName } = await req.json()

    if (!email || !code) {
      return new Response(JSON.stringify({ error: 'email and code are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
      subject: 'Tu código de acceso',
      html: `
          <h2>¡Bienvenido${clientName ? `, ${clientName}` : ''}!</h2>
          <p>Tu código de acceso para ver y descargar tus fotos es:</p>
          <h1 style="letter-spacing: 8px; font-size: 32px;">${code}</h1>
          <p>Ingresa este código en nuestro portal de clientes para activar tu cuenta.</p>
          <p>Este código expira en 7 días.</p>
        `,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ sent: true }), {
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
