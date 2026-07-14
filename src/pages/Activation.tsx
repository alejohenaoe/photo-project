import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL.replace(/\/rest\/v1.*$/, '').replace(/\/$/, '')
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

export default function Activation() {
  const [step, setStep] = useState<'code' | 'register'>('code')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [validating, setValidating] = useState(false)
  const [activating, setActivating] = useState(false)
  const navigate = useNavigate()

  function handleCodeInput(index: number, value: string) {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`)
      next?.focus()
    }
  }

  async function handleValidateCode() {
    setError('')
    setValidating(true)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/validate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.join('') }),
      })

      const data = await res.json()

      if (!data.valid) {
        setError(data.error || 'Código inválido')
        setValidating(false)
        return
      }

      setEmail(data.client?.email || '')
      setStep('register')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setValidating(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setActivating(true)
    try {
      const res = await fetch(`${FUNCTIONS_URL}/validate-and-activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.join(''), email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Activación fallida')
        setActivating(false)
        return
      }

      navigate('/login')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setActivating(false)
  }

  if (step === 'code') {
    return (
      <div className="min-h-screen flex bg-bg-base">
        {/* Left: branding image (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            src="https://picsum.photos/seed/photo-studio-activate/1200/900"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900/80 via-dark-900/60 to-dark-900/80" />
          <div className="relative z-10 flex flex-col items-start justify-end p-12 w-full">
            <span className="font-display text-4xl text-gold-500 mb-3">NEFTIK PHOTO</span>
            <p className="text-text-dark-secondary text-lg max-w-sm leading-relaxed">
              Activa tu cuenta para acceder a tus fotos.
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
              <h1 className="font-display text-3xl text-text-primary mb-2">Activar tu Cuenta</h1>
              <p className="text-text-secondary text-sm">
                Ingresa el código de 6 dígitos enviado a tu correo.
              </p>
            </div>

            <div className="bg-surface border border-border-light rounded-xl p-6">
              <div
                className="flex justify-center gap-2 mb-6"
                onPaste={(e) => {
                  const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                  if (paste.length === 6) {
                    e.preventDefault()
                    setCode(paste.split(''))
                    document.getElementById('code-5')?.focus()
                  }
                }}
              >
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono bg-bg-base border border-border-medium rounded-lg text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && i > 0) {
                        const prev = document.getElementById(`code-${i - 1}`)
                        prev?.focus()
                      }
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && <p className="text-sm text-error text-center mb-4">{error}</p>}

              <button
                className="w-full bg-gold-500 text-dark-900 px-6 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                onClick={handleValidateCode}
                disabled={code.some((d) => !d) || validating}
              >
                {validating ? 'Validando...' : 'Activar'}
              </button>

              <p className="text-sm text-text-muted text-center mt-4">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-gold-600 hover:text-gold-500 transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
                  Iniciar Sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-bg-base">
      {/* Left: branding image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/photo-studio-register/1200/900"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900/80 via-dark-900/60 to-dark-900/80" />
        <div className="relative z-10 flex flex-col items-start justify-end p-12 w-full">
          <span className="font-display text-4xl text-gold-500 mb-3">NEFTIK PHOTO</span>
          <p className="text-text-dark-secondary text-lg max-w-sm leading-relaxed">
            Configura tu cuenta y accede a tus galerías.
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
            <h1 className="font-display text-3xl text-text-primary mb-2">Crear tu Cuenta</h1>
            <p className="text-text-secondary text-sm">
              Configura tus credenciales para acceder a tus galerías.
            </p>
          </div>

          <div className="bg-surface border border-border-light rounded-xl p-6">
            <form className="space-y-4" onSubmit={handleRegister}>
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
                <p className="text-xs text-text-muted mt-1">Este es el correo que usaremos para tu cuenta.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-medium">Contraseña</label>
                <input
                  className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <button
                type="submit"
                className="w-full bg-gold-500 text-dark-900 px-6 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                disabled={activating}
              >
                {activating ? 'Creando cuenta...' : 'Completar Registro'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
