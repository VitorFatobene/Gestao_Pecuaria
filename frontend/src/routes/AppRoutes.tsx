import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { AnimaisPage } from '../features/animais/pages/AnimaisPage'
import { FinanceiroPage } from '../features/financeiro/pages/FinanceiroPage'
import { PastosPage } from '../features/pastos/pages/PastosPage'
import { VendasPage } from '../features/vendas/pages/VendasPage'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { PrivateRoute } from './PrivateRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/animais" replace />} />
            <Route path="/animais" element={<AnimaisPage />} />
            <Route path="/pastos" element={<PastosPage />} />
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
