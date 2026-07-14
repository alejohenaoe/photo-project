import { useState } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL.replace(/\/rest\/v1.*$/, '').replace(/\/$/, '')
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${FUNCTIONS_URL}/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje')
    }
    setSending(false)
  }

  return (
    <div className="bg-bg-base">
      <section className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-6">Contacto</h1>
        <div className="w-16 h-0.5 bg-gold-500 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              ¿Tienes un restaurante o negocio de alimentos? Nos encantaría trabajar contigo.
              Escríbenos para agendar una sesión o solicitar una cotización.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:NEFTIKPHOTO@gmail.com"
                className="flex items-center gap-4 p-4 bg-surface border border-border-light rounded-xl hover:border-gold-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-lg">
                  ✉
                </div>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="text-text-primary font-medium">NEFTIKPHOTO@gmail.com</p>
                </div>
              </a>

              <a
                href="https://wa.me/19736100707"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface border border-border-light rounded-xl hover:border-gold-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-lg">
                  ☎
                </div>
                <div>
                  <p className="text-sm text-text-muted">WhatsApp</p>
                  <p className="text-text-primary font-medium">+1 973 610 0707</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/NEFTIK_PHOTO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface border border-border-light rounded-xl hover:border-gold-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-lg">
                  📷
                </div>
                <div>
                  <p className="text-sm text-text-muted">Instagram</p>
                  <p className="text-text-primary font-medium">@NEFTIK_PHOTO</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-surface border border-border-light rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-lg">
                  📍
                </div>
                <div>
                  <p className="text-sm text-text-muted">Ubicación</p>
                  <p className="text-text-primary font-medium">Morris County, New Jersey</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border-light rounded-xl p-6 sm:p-8">
            <h2 className="font-display text-xl text-text-primary mb-6">Envíanos un mensaje</h2>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-success-bg flex items-center justify-center mb-4">
                  <span className="text-success text-2xl">✓</span>
                </div>
                <p className="text-text-primary font-medium text-lg mb-1">¡Mensaje enviado!</p>
                <p className="text-text-secondary text-sm">Te responderemos pronto.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-medium">Nombre</label>
                  <input
                    className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-medium">Email</label>
                  <input
                    className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-text-secondary font-medium">Mensaje</label>
                  <textarea
                    className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none"
                    rows={4}
                    placeholder="Cuéntanos sobre tu restaurante..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-error">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gold-500 text-dark-900 px-6 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
