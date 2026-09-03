import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CadastroAnimal } from '../features/animais/pages/CadastroAnimal'
import { DetalhesAnimal } from '../features/animais/pages/DetalhesAnimal'
import { ListaAnimais } from '../features/animais/pages/ListaAnimais'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { FinanceiroPage } from '../features/financeiro/pages/FinanceiroPage'
import { LotesPage } from '../features/lotes/LotesPage'
import { MovimentacoesPage } from '../features/movimentacoes/pages/MovimentacoesPage'
import { PastosListPage } from '../features/pastos/pages/PastosListPage'
import { PerfilPage } from '../features/perfil/pages/PerfilPage'
import { DetalhesVenda } from '../features/vendas/pages/DetalhesVenda'
import { ListaVendas } from '../features/vendas/pages/ListaVendas'
import { NovaVenda } from '../features/vendas/pages/NovaVenda'
import { NovaVendaLote } from '../features/vendas/pages/NovaVendaLote'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { PrivateRoute } from './PrivateRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/animais" element={<ListaAnimais />} />
            <Route path="/animais/novo" element={<CadastroAnimal />} />
            <Route path="/animais/:id" element={<DetalhesAnimal />} />
            <Route path="/animais/:id/editar" element={<CadastroAnimal />} />
            <Route path="/pastos" element={<PastosListPage />} />
            <Route path="/movimentacoes" element={<MovimentacoesPage />} />
            <Route path="/lotes" element={<LotesPage />} />
            <Route path="/vendas" element={<ListaVendas />} />
            <Route path="/vendas/nova" element={<NovaVenda />} />
            <Route path="/vendas/lote/nova" element={<NovaVendaLote />} />
            <Route path="/vendas/:id" element={<DetalhesVenda />} />
            <Route path="/financeiro" element={<FinanceiroPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
