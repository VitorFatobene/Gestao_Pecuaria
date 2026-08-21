import {
  BarChart3,
  Beef,
  CircleDollarSign,
  History,
  LayoutDashboard,
  Layers3,
  Map,
  ShoppingCart,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Animais', path: '/animais', icon: Beef },
  { label: 'Pastos', path: '/pastos', icon: Map },
  { label: 'Movimentações', path: '/movimentacoes', icon: History },
  { label: 'Lotes', path: '/lotes', icon: Layers3 },
  { label: 'Vendas', path: '/vendas', icon: ShoppingCart },
  { label: 'Financeiro', path: '/financeiro', icon: CircleDollarSign },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <BarChart3 size={22} aria-hidden="true" />
        </div>
        <div>
          <strong>Gestao Pecuaria</strong>
          <span>Controle agro</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegacao principal">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              end={item.path === '/'}
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link is-active' : 'sidebar-link'
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
