import { Link } from 'react-router-dom'
import { useGalleries, useArchiveGallery } from '../../../hooks/useGalleries'

export default function GalleryList() {
  const { data: galleries, isLoading } = useGalleries()
  const archive = useArchiveGallery()

  if (isLoading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Galerías</h1>
        <Link
          to="/admin/galleries/new"
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          Nueva Galería
        </Link>
      </div>
      {galleries?.length === 0 ? (
        <p className="text-gray-500">No hay galerías aún.</p>
      ) : (
        <div className="grid gap-4">
          {galleries?.map((g) => (
            <div key={g.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <Link to={`/admin/galleries/${g.id}`} className="font-semibold hover:underline">
                  {g.name}
                </Link>
                {g.description && (
                  <p className="text-sm text-gray-500 mt-1">{g.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(g.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/galleries/${g.id}/upload`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Subir
                </Link>
                <Link
                  to={`/admin/galleries/${g.id}/edit`}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => { if (confirm('¿Archivar esta galería?')) archive.mutate(g.id) }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Archivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
