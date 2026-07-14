import { Outlet, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientLayout() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="border-b border-dark-700 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/client" className="text-text-dark-primary font-medium text-sm tracking-wide">
            <span className="text-gold-500">✦</span> NEFTIK PHOTO
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/client/profile" className="text-text-dark-muted hover:text-text-dark-secondary transition-colors">Perfil</Link>
            <button onClick={handleLogout} className="text-text-dark-muted hover:text-text-dark-secondary transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-dark-900 border-t border-dark-700 py-4 text-center text-xs text-text-dark-muted">
        &copy; {new Date().getFullYear()} NEFTIK PHOTO
      </footer>
    </div>
  )
}
