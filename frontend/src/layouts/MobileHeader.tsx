import { Bell, Menu, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

type MobileHeaderProps = {
  onOpenMenu: () => void
}

export function MobileHeader({ onOpenMenu }: MobileHeaderProps) {
  const { user } = useAuth()
  const navigate = useNavigate()

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
        <strong>Gestão Pecuária</strong>
        <span>{user?.nomeFazenda ?? 'Controle agro'}</span>
      </div>

      <div className="mobile-header-actions">
        <button
          type="button"
          className="mobile-header-button"
          aria-label="Notificações"
        >
          <Bell size={19} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="mobile-avatar"
          aria-label="Abrir meu perfil"
          onClick={() => navigate('/perfil')}
        >
          <UserRound size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
