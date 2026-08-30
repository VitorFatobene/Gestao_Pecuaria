import {
  BarChart3,
  Beef,
  CircleDollarSign,
  History,
  Layers3,
  LayoutDashboard,
  LogOut,
  Map,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Animais', path: '/animais', icon: Beef },
  { label: 'Pastos', path: '/pastos', icon: Map },
  { label: 'Movimentações', path: '/movimentacoes', icon: History },
  { label: 'Lotes', path: '/lotes', icon: Layers3 },
  { label: 'Vendas', path: '/vendas', icon: ShoppingCart },
  { label: 'Financeiro', path: '/financeiro', icon: CircleDollarSign },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { logout, user } = useAuth()
  const location = useLocation()
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname
      onClose()
    }
  }, [location.pathname, onClose])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  function handleLogout() {
    onClose()
    logout()
  }

  return (
    <div className={isOpen ? 'mobile-menu is-open' : 'mobile-menu'} aria-hidden={!isOpen}>
      <button
        type="button"
        className="mobile-menu-backdrop"
        aria-label="Fechar menu"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <aside className="mobile-menu-drawer" aria-label="Menu mobile">
        <div className="mobile-menu-header">
          <div className="sidebar-brand mobile-menu-brand">
            <div className="brand-mark">
              <BarChart3 size={22} aria-hidden="true" />
            </div>
            <div>
              <strong>Gestão Pecuária</strong>
              <span>Estancia Dona Rose</span>
            </div>
          </div>

          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mobile-menu-user">
          <span>Usuario logado</span>
          <strong>{user?.nome ?? 'Produtor'}</strong>
        </div>

        <nav className="mobile-menu-nav" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => {
                  const isDashboardActive = item.path === '/dashboard' && location.pathname === '/'
                  return isActive || isDashboardActive
                    ? 'mobile-menu-link is-active'
                    : 'mobile-menu-link'
                }}
                onClick={onClose}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mobile-menu-footer">
          <button type="button" className="mobile-menu-logout" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
