import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, role, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && role) {
      navigate(role === 'photographer' ? '/admin' : '/client', { replace: true })
    }
  }, [user, role, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-bg-base">
      {/* Left: branding image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/photo-studio-login/1200/900"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/80 via-dark-900/60 to-dark-900/80" />
        <div className="relative z-10 flex flex-col items-start justify-end p-12 w-full">
            <span className="font-display text-4xl text-gold-500 mb-3">NEFTIK PHOTO</span>
          <p className="text-text-dark-secondary text-lg max-w-sm leading-relaxed">
            Accede a tus fotos gastronómicas cuando las necesites.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <a href="/" className="text-sm text-text-secondary hover:text-gold-500 transition-colors mb-8 inline-block">
            ← Volver al Inicio
          </a>
          <div className="mb-10">
            <h1 className="font-display text-3xl text-text-primary mb-2">
              {role === 'photographer' ? 'Admin' : 'Cliente'}
            </h1>
            <p className="text-text-secondary text-sm">Inicia sesión para continuar</p>
          </div>

          <div className="bg-surface border border-border-light rounded-xl p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-medium">Correo</label>
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
                <label className="text-sm text-text-secondary font-medium">Contraseña</label>
                <input
                  className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button
                type="submit"
                className="w-full bg-gold-500 text-dark-900 px-6 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
              >
                Iniciar Sesión
              </button>
            </form>

            <p className="text-sm text-text-muted text-center pt-4 mt-4 border-t border-border-light">
              ¿No tienes cuenta?{' '}
              <a
                href="/activate"
                className="text-gold-600 hover:text-gold-500 transition-colors font-medium"
                onClick={(e) => { e.preventDefault(); navigate('/activate') }}
              >
                Activar con Código
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
