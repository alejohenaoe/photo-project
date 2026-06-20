import { Outlet, Link } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">Photo Co.</Link>
          <nav className="flex gap-6 text-sm">
            <Link to="/services">Servicios</Link>
            <Link to="/portfolio">Portafolio</Link>
            <Link to="/about">Nosotros</Link>
            <Link to="/contact">Contacto</Link>
            <Link to="/quote-request" className="font-semibold">Solicitar Cotización</Link>
            <Link to="/login">Iniciar Sesión</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Photo Co. Todos los derechos reservados.
      </footer>
    </div>
  )
}
