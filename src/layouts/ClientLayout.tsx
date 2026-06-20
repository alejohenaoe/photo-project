import { Outlet, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/client" className="font-bold">Photo Co.</Link>
          <div className="flex gap-4 text-sm">
            <Link to="/client/profile" className="text-gray-400 hover:text-white">Perfil</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">Cerrar Sesión</button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
