import { Bell, Menu, UserRound } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'

type MobileHeaderProps = {
  onOpenMenu: () => void
}

export function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="mobile-header">
      <button
        type="button"
        className="mobile-header-button"
        aria-label="Abrir menu"
        onClick={onOpenMenu}
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      <div className="mobile-header-brand">
        <strong>Gestao Pecuaria</strong>
        <span>Estancia Dona Rose</span>
      </div>

      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-header-button"
          aria-label="Notificacoes"
        >
          <Bell size={19} aria-hidden="true" />
        </button>
        <div className="mobile-avatar" aria-label={user?.nome ?? 'Usuario'}>
          <UserRound size={18} aria-hidden="true" />
        </div>
      </div>
    </header>
  )
}
