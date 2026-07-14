import { Link } from 'react-router-dom'
import { useClients } from '../../../hooks/useGalleries'

export default function ClientList() {
  const { data: clients, isLoading } = useClients()

  if (isLoading) return <p className="text-text-muted">Cargando...</p>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
        <Link
          to="/admin/clients/new"
          className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {clients?.length === 0 ? (
        <p className="text-text-muted">No hay clientes aún.</p>
      ) : (
        <div className="grid gap-4">
          {clients?.map((c) => (
            <div
              key={c.id}
              className="bg-surface border border-border-light rounded-xl p-5 flex items-center justify-between hover:border-gold-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-light flex items-center justify-center text-text-secondary text-sm font-medium">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link to={`/admin/clients/${c.id}`} className="text-text-primary font-medium hover:text-gold-600 transition-colors">
                    {c.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-text-muted">{c.email}</span>
                    <span className="text-xs text-text-muted">{c.phone || '—'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.is_active
                        ? 'bg-success-bg text-success border border-success/20'
                        : 'bg-bg-elevated text-text-muted border border-border-light'
                    }`}>
                      {c.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    {c.profile_id && (
                      <span className="text-xs text-gold-600 font-medium">Cuenta activada</span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to={`/admin/clients/${c.id}`}
                className="text-sm text-text-muted hover:text-gold-600 transition-colors"
              >
                Ver →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
