import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthGuard({ expectedRole }: { expectedRole?: 'photographer' | 'client' }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-sm text-gray-500">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (expectedRole && role !== expectedRole) {
    if (role === 'photographer') return <Navigate to="/admin" replace />
    if (role === 'client') return <Navigate to="/client" replace />
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
