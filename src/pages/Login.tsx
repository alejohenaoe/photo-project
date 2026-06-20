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

  if (authLoading) return <div className="flex items-center justify-center min-h-screen text-sm text-gray-500">Cargando...</div>

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {role === 'photographer' ? 'Admin' : 'Cliente'}
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Contraseña</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800">
          Iniciar Sesión
        </button>
        <p className="text-sm text-gray-500 text-center">
          ¿No tienes cuenta?{' '}
          <a href="/activate" className="underline cursor-pointer" onClick={(e) => { e.preventDefault(); navigate('/activate') }}>
            Activar con Código
          </a>
        </p>
      </form>
    </div>
  )
}
