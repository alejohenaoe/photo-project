import { Link } from 'react-router-dom'
import { useClients } from '../../../hooks/useGalleries'

export default function ClientList() {
  const { data: clients, isLoading } = useClients()

  if (isLoading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link
          to="/admin/clients/new"
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          Nuevo Cliente
        </Link>
      </div>
      {clients?.length === 0 ? (
        <p className="text-gray-500">No hay clientes aún.</p>
      ) : (
        <div className="grid gap-4">
          {clients?.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <Link to={`/admin/clients/${c.id}`} className="font-semibold hover:underline">
                  {c.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{c.email}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-gray-400">{c.phone || '—'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {c.profile_id && (
                    <span className="text-xs text-blue-600">Cuenta activada</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/clients/${c.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
