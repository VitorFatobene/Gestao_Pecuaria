import { type PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'

export function PrivateRoute({ children }: PropsWithChildren) {
  return children ?? <Outlet />
}
