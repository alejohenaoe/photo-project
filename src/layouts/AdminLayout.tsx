import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { path: '/admin', label: 'Panel', icon: '▣' },
  { path: '/admin/contacts', label: 'Mensajes', icon: '✉' },
  { path: '/admin/clients', label: 'Clientes', icon: '◉' },
  { path: '/admin/galleries', label: 'Galerías', icon: '◻' },
  { path: '/admin/quotes', label: 'Cotizaciones', icon: '◈' },
  { path: '/admin/logs', label: 'Descargas', icon: '≡' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="border-b border-dark-700 bg-dark-900">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-1"
              aria-label="Menú"
            >
              <span className={`block w-5 h-[2px] bg-text-dark-primary transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
              <span className={`block w-5 h-[2px] bg-text-dark-primary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[2px] bg-text-dark-primary transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
            </button>
            <Link to="/admin" className="text-text-dark-primary font-medium text-sm tracking-wide">
              <span className="text-gold-500">✦</span> NEFTIK PHOTO <span className="text-text-dark-muted">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-text-dark-muted hover:text-text-dark-secondary transition-colors hidden sm:inline">Ver Sitio</Link>
            <button onClick={handleLogout} className="text-text-dark-muted hover:text-text-dark-secondary transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop sidebar */}
        <aside className="w-56 border-r border-dark-700 bg-dark-800 p-4 hidden md:flex flex-col gap-1 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(item.path)
                  ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                  : 'text-text-dark-muted hover:text-text-dark-secondary hover:bg-dark-700 border border-transparent'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-50 flex justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-xs transition-colors ${
                isActive(item.path) ? 'text-gold-500' : 'text-text-dark-muted'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile slide-in sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-dark-900/60" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative w-64 bg-dark-800 border-r border-dark-700 p-4 flex flex-col gap-1 animate-slide-in-left">
              <div className="text-text-dark-primary font-medium text-sm mb-4 px-3">
                <span className="text-gold-500">✦</span> Navegación
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive(item.path)
                      ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20'
                      : 'text-text-dark-muted hover:text-text-dark-secondary hover:bg-dark-700 border border-transparent'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-dark-700 mt-4 pt-4 px-3">
                <Link to="/" className="block text-sm text-text-dark-muted hover:text-text-dark-secondary transition-colors">Ver Sitio</Link>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
