import { Link } from 'react-router-dom'
import { useClientGalleries } from '../../hooks/useGalleries'

export default function ClientDashboard() {
  const { data: galleries, isLoading } = useClientGalleries()

  if (isLoading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Mis Galerías</h1>
      {!galleries || galleries.length === 0 ? (
        <p className="text-gray-600">No tienes galerías asignadas aún.</p>
      ) : (
        <div className="grid gap-4">
          {galleries.map((g) => (
            <Link
              key={g.id}
              to={`/client/galleries/${g.id}`}
              className="border rounded-lg p-4 hover:border-gray-400 transition-colors block"
            >
              <h2 className="font-semibold">{g.name}</h2>
              {g.description && (
                <p className="text-sm text-gray-500 mt-1">{g.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
