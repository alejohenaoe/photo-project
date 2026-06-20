import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-bold">Photo Co. Admin</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-400 hover:text-white">Ver Sitio</Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">Cerrar Sesión</button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 border-r bg-gray-50 p-4 hidden md:block">
          <nav className="flex flex-col gap-1">
            <Link to="/admin" className={`px-3 py-2 rounded text-sm ${isActive('/admin') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}>Panel</Link>
            <Link to="/admin/clients" className={`px-3 py-2 rounded text-sm ${isActive('/admin/clients') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}>Clientes</Link>
            <Link to="/admin/galleries" className={`px-3 py-2 rounded text-sm ${isActive('/admin/galleries') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}>Galerías</Link>
            <Link to="/admin/quotes" className={`px-3 py-2 rounded text-sm ${isActive('/admin/quotes') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}>Cotizaciones</Link>
            <Link to="/admin/logs" className={`px-3 py-2 rounded text-sm ${isActive('/admin/logs') ? 'bg-gray-900 text-white' : 'hover:bg-gray-200'}`}>Descargas</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
