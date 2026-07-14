import { Link } from 'react-router-dom'
import { useClientGalleries } from '../../hooks/useGalleries'

export default function ClientDashboard() {
  const { data: galleries, isLoading } = useClientGalleries()

  if (isLoading) return <p className="text-text-muted px-4">Cargando...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Mis Galerías</h1>
      {!galleries || galleries.length === 0 ? (
        <p className="text-text-muted">No tienes galerías asignadas aún.</p>
      ) : (
        <div className="grid gap-4">
          {galleries.map((g) => {
            const exhausted = g.download_limit > 0 && g.download_count >= g.download_limit
            return (
              <Link
                key={g.id}
                to={`/client/galleries/${g.id}`}
                className="bg-surface border border-border-light rounded-xl p-5 hover:border-gold-500/30 transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-text-primary group-hover:text-gold-600 transition-colors">{g.name}</h2>
                    {g.description && (
                      <p className="text-sm text-text-muted mt-1">{g.description}</p>
                    )}
                  </div>
                  {exhausted && (
                    <span className="text-xs bg-gold-500/10 text-gold-600 border border-gold-500/30 px-2 py-0.5 rounded-full">Completada</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  {g.download_limit > 0
                    ? `${g.download_count} / ${g.download_limit} descargas`
                    : `${g.download_count} descargas`}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
