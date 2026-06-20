import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <section className="py-24 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Fotografía Profesional para tu Negocio</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Bodas · Restaurantes · Eventos · Comercial · Producto
        </p>
        <Link
          to="/quote-request"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded hover:bg-gray-800"
        >
          Solicitar Cotización →
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-8">Servicios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Bodas', 'Eventos', 'Restaurante & Café', 'Producto'].map((s) => (
            <div key={s} className="border rounded-lg p-6 text-center text-sm">
              <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
                [Foto]
              </div>
              {s}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-8">Portafolio</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
              [Foto {i + 1}]
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
