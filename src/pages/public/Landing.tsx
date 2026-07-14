import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from '../../hooks/useInView'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL.replace(/\/rest\/v1.*$/, '').replace(/\/$/, '')
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

const heroImages = [
  '/imagenes/pexels-jonathanborba-29068731.jpg',
  '/imagenes/pexels-allanglezg-31843934.jpg',
  '/imagenes/pexels-anat-landa-2162599192-38446237.jpg',
]

const rotatingPhrases = [
  { text: 'Platos que enamoran' },
  { text: 'Menús que venden' },
  { text: 'Restaurantes que destacan' },
  { text: 'Sabores capturados' },
]

const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(i * 9.7 + 3.1) % 100}%`,
  top: `${(i * 14.3 + 7.7) % 100}%`,
  size: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
  delay: `${i * 1.5}s`,
  duration: `${7 + (i % 5) * 2}s`,
}))

const services = [
  { title: 'Menú & Platos', image: 'https://picsum.photos/seed/food-menu/800/600' },
  { title: 'Restaurantes', image: 'https://picsum.photos/seed/food-space/800/600' },
  { title: 'Redes Sociales', image: 'https://picsum.photos/seed/food-social/800/600' },
  { title: 'Ingredientes', image: 'https://picsum.photos/seed/food-ingredients/800/600' },
]

const portfolio = [
  { id: 1, image: 'https://picsum.photos/seed/food-proj1/800/600', title: 'Restaurante La Mesa' },
  { id: 2, image: 'https://picsum.photos/seed/food-proj2/800/600', title: 'Café Artesanal' },
  { id: 3, image: 'https://picsum.photos/seed/food-proj3/800/600', title: 'Bistró Parisienne' },
  { id: 4, image: 'https://picsum.photos/seed/food-proj4/800/600', title: 'Taquería El Sol' },
  { id: 5, image: 'https://picsum.photos/seed/food-proj5/800/600', title: 'Sushi Garden' },
  { id: 6, image: 'https://picsum.photos/seed/food-proj6/800/600', title: 'Pizzería Napolitana' },
]

function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Landing() {
  const [bgIndex, setBgIndex] = useState(0)
  const [prevBgIndex, setPrevBgIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)

  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState('')

  const heroRef = useRef<HTMLDivElement>(null)
  const bgIndexRef = useRef(0)

  useEffect(() => { setMounted(true) }, [])

  /* Background slideshow */
  useEffect(() => {
    const interval = setInterval(() => {
      const prev = bgIndexRef.current
      const next = (prev + 1) % heroImages.length
      setPrevBgIndex(prev)
      bgIndexRef.current = next
      setBgIndex(next)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (prevBgIndex === null) return
    const timer = setTimeout(() => setPrevBgIndex(null), 1200)
    return () => clearTimeout(timer)
  }, [prevBgIndex])

  /* Rotating phrases */
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % rotatingPhrases.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setContactSending(true)
    setContactError('')
    try {
      const res = await fetch(`${FUNCTIONS_URL}/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      setContactSent(true)
      setContactName('')
      setContactEmail('')
      setContactMessage('')
    } catch (err) {
      setContactError(err instanceof Error ? err.message : 'Error al enviar mensaje')
    }
    setContactSending(false)
  }

  const bgTransition = mounted ? 'transition-opacity duration-1000 ease-in-out' : ''

  return (
    <div>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-dark-900"
      >
        {/* Crossfading hero images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover ${bgTransition}`}
              style={{ opacity: i === bgIndex ? 1 : i === prevBgIndex ? 0 : 0 }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/40 via-dark-900/70 to-dark-900 z-10" />

        {/* Floating particles */}
        <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
          {particles.map(p => (
            <div
              key={p.id}
              className="float-particle absolute rounded-full bg-gold-500/40"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                '--delay': p.delay,
                '--duration': p.duration,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-20 w-full px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 lg:gap-12">
            {/* Left: text */}
            <div className="text-left w-full sm:w-1/2">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl text-text-dark-primary leading-tight">
                <span className="block animate-fade-in-down">Fotografía Gastronómica</span>
                <span className="block mt-2 animate-text-reveal animate-delay-200">
                  para Restaurantes
                </span>
              </h1>

              {/* Rotating phrase */}
              <div className="mt-6 h-12 sm:h-14 md:h-16 relative overflow-hidden">
                {rotatingPhrases.map((p, i) => (
                  <p
                    key={i}
                    className={`absolute inset-x-0 font-display text-2xl sm:text-3xl md:text-4xl shimmer transition-all duration-500 ease-in-out ${
                      i === phraseIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {p.text}
                  </p>
                ))}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col gap-6 animate-fade-in-up animate-delay-700 shrink-0 w-full sm:w-1/2">
              {/* Cotización */}
              <div className="text-center">
                <p className="text-white text-sm mb-3">Solicita una cotización</p>
                <Link
                  to="/quote-request"
                  className="bg-gold-500 text-dark-900 px-8 py-3.5 rounded font-medium hover:bg-gold-400 transition-all hover:shadow-xl hover:shadow-gold-500/25 active:scale-[0.98] inline-block"
                >
                  Cotización →
                </Link>
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-dark-600 mx-auto" />

              {/* Login */}
              <div className="text-center">
                <p className="text-white text-sm mb-3">¿Ya eres cliente?</p>
                <Link
                  to="/login"
                  className="border border-dark-600 text-text-dark-primary px-8 py-3.5 rounded hover:border-gold-500 hover:text-gold-500 transition-all inline-block"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-fade-in-up animate-delay-1000">
          <div className="w-5 h-8 border-2 border-gold-500/50 rounded-full flex justify-center relative overflow-hidden">
            <div className="w-1 h-2 bg-gold-500 rounded-full mt-1.5 animate-scroll-wheel" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold-500/70 animate-pulse">
            Scroll
          </span>
        </div>
      </section>

      {/* Services */}
      <section className="bg-bg-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <AnimatedSection>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500 mb-3 text-center">
              Servicios
            </h2>
            <p className="font-display text-3xl sm:text-4xl text-text-primary text-center mb-16">
              Lo que ofrecemos
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 100}>
                <div className="group relative bg-surface border border-border-light rounded-xl overflow-hidden hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-500">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-text-primary font-medium text-lg">{s.title}</h3>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-bg-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <AnimatedSection>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500 mb-3 text-center">
              Portafolio
            </h2>
            <p className="font-display text-3xl sm:text-4xl text-text-primary text-center mb-16">
              Trabajos recientes
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {portfolio.map((item, idx) => (
              <AnimatedSection key={item.id} delay={idx * 80}>
                <div className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-surface border border-border-light cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />

                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-elevated py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border-light">

            {/* Left: CTA text (dark bg) */}
            <div className="bg-dark-900 p-10 sm:p-14 flex flex-col justify-center">
              <p className="font-display text-3xl sm:text-4xl text-text-dark-primary mb-4">
                ¿Listo para transformar tu menú?
              </p>
              <p className="text-text-dark-secondary mb-8 max-w-md leading-relaxed">
                Cuéntanos sobre tu restaurante y te enviaremos una cotización personalizada en 24 horas.
              </p>
              <Link
                to="/quote-request"
                className="inline-block bg-gold-500 text-dark-900 px-8 py-3.5 rounded font-medium hover:bg-gold-400 transition-all hover:shadow-xl hover:shadow-gold-500/25 active:scale-[0.98] self-start"
              >
                Solicitar Cotización →
              </Link>
            </div>

            {/* Right: contact form (light bg) */}
            <div className="bg-surface p-10 sm:p-14">
              <p className="text-text-secondary text-sm mb-1">O escríbenos directo</p>
              <h3 className="font-display text-2xl text-text-primary mb-6">Envíanos un mensaje</h3>

              {contactSent ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center mb-4">
                    <span className="text-success text-xl">✓</span>
                  </div>
                  <p className="text-text-primary font-medium mb-1">¡Mensaje enviado!</p>
                  <p className="text-text-secondary text-sm">Te responderemos pronto.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium">Nombre</label>
                    <input
                      className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      placeholder="Tu nombre"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium">Email</label>
                    <input
                      className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      type="email"
                      placeholder="tu@correo.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-text-secondary font-medium">Mensaje</label>
                    <textarea
                      className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none"
                      rows={3}
                      placeholder="Cuéntanos sobre tu restaurante..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    />
                  </div>
                  {contactError && <p className="text-sm text-error">{contactError}</p>}
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="w-full bg-gold-500 text-dark-900 px-6 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactSending ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
