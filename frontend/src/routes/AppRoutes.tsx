import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CadastroAnimal } from '../features/animais/pages/CadastroAnimal'
import { DetalhesAnimal } from '../features/animais/pages/DetalhesAnimal'
import { ListaAnimais } from '../features/animais/pages/ListaAnimais'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { Dashboard } from '../features/dashboard/pages/Dashboard'
import { FinanceiroPage } from '../features/financeiro/pages/FinanceiroPage'
import { PastosListPage } from '../features/pastos/pages/PastosListPage'
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/animais" element={<ListaAnimais />} />
            <Route path="/animais/novo" element={<CadastroAnimal />} />
            <Route path="/animais/:id" element={<DetalhesAnimal />} />
            <Route path="/animais/:id/editar" element={<CadastroAnimal />} />
            <Route path="/pastos" element={<PastosListPage />} />
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
