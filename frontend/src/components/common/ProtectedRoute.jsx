import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ requiredRole }) {
  const { user, token } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/auth" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
