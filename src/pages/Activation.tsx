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
      <div className="max-w-sm mx-auto px-4 py-24">
        <h1 className="text-2xl font-bold mb-2 text-center">Activar tu Cuenta</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Ingresa el código de 6 dígitos enviado a tu correo.
        </p>
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
              className="w-12 h-14 text-center text-xl border-2 rounded"
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
        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}
        <button
          className="w-full bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 disabled:opacity-50"
          onClick={handleValidateCode}
          disabled={code.some((d) => !d) || validating}
        >
          {validating ? 'Validando...' : 'Activar'}
        </button>
        <p className="text-sm text-gray-500 text-center mt-4">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="underline" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
            Iniciar Sesión
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold mb-2 text-center">Crear tu Cuenta</h1>
      <p className="text-sm text-gray-500 text-center mb-8">
        Configura tus credenciales para acceder a tus galerías.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleRegister}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Correo</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 mt-1">Este es el correo que usaremos para tu cuenta.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={activating}
        >
          {activating ? 'Creando cuenta...' : 'Completar Registro'}
        </button>
      </form>
    </div>
  )
}
