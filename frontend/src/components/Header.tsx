import { Bell, LogOut, Search, UserRound } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'

export function Header() {
  const { logout, user } = useAuth()

  return (
    <header className="topbar">
      <div>
        <span className="topbar-eyebrow">Fazenda Santa Clara</span>
        <h1>Ola, {user?.nome ?? 'produtor'}</h1>
      </div>

      <div className="topbar-actions">
        <label className="topbar-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Buscar no sistema" />
        </label>

        <button className="icon-button" type="button" aria-label="Notificacoes">
          <Bell size={18} aria-hidden="true" />
        </button>

        <div className="user-chip">
          <UserRound size={18} aria-hidden="true" />
          <span>{user?.nome ?? 'Usuario'}</span>
        </div>

        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={16} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}
