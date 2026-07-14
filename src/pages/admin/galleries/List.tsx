import { Link } from 'react-router-dom'
import { useGalleries, useArchiveGallery, useClients } from '../../../hooks/useGalleries'

export default function GalleryList() {
  const { data: galleries, isLoading } = useGalleries()
  const { data: clients } = useClients()
  const archive = useArchiveGallery()

  if (isLoading) return <p className="text-text-muted">Cargando...</p>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Galerías</h1>
        <Link
          to="/admin/galleries/new"
          className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20"
        >
          + Nueva Galería
        </Link>
      </div>
      {galleries?.length === 0 ? (
        <p className="text-text-muted">No hay galerías aún.</p>
      ) : (
        <div className="grid gap-4">
          {galleries?.map((g) => {
            const client = clients?.find(c => c.id === g.client_id)
            const exhausted = g.download_limit > 0 && g.download_count >= g.download_limit
            return (
              <div key={g.id} className="bg-surface border border-border-light rounded-xl p-5 flex items-center justify-between hover:border-gold-500/30 transition-all">
                <div>
                  <Link to={`/admin/galleries/${g.id}`} className="font-medium text-text-primary hover:text-gold-600 transition-colors">
                    {g.name}
                  </Link>
                  {g.description && (
                    <p className="text-sm text-text-muted mt-1">{g.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <p className="text-xs text-text-muted">
                      {new Date(g.created_at).toLocaleDateString()}
                    </p>
                    {client && (
                      <p className="text-xs text-gold-600">
                        Cliente: {client.name}
                      </p>
                    )}
                    {exhausted && (
                      <span className="text-xs bg-gold-500/10 text-gold-600 border border-gold-500/30 px-1.5 py-0.5 rounded">Completado</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/admin/galleries/${g.id}/upload`}
                    className="text-sm text-text-muted hover:text-gold-600 transition-colors"
                  >
                    Subir
                  </Link>
                  <Link
                    to={`/admin/galleries/${g.id}/edit`}
                    className="text-sm text-text-muted hover:text-gold-600 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => { if (confirm('¿Archivar esta galería?')) archive.mutate(g.id) }}
                    className="text-sm text-error hover:text-error transition-colors"
                  >
                    Archivar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
