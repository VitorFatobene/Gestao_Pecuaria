import { Bell, LogOut, Search, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div>
        <span className="topbar-eyebrow">{user?.nomeFazenda ?? 'Gestão Pecuária'}</span>
        <h1>Olá, {user?.nome ?? 'produtor'}</h1>
      </div>

      <div className="topbar-actions">
        <label className="topbar-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Buscar no sistema" />
        </label>

        <button className="icon-button" type="button" aria-label="Notificações">
          <Bell size={18} aria-hidden="true" />
        </button>

        <button className="user-chip" type="button" onClick={() => navigate('/perfil')}>
          <UserRound size={18} aria-hidden="true" />
          <span>{user?.nome ?? 'Usuario'}</span>
        </button>

        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={16} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}
