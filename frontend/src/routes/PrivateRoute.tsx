import { type PropsWithChildren } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export function PrivateRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="route-loading">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ?? <Outlet />
}
