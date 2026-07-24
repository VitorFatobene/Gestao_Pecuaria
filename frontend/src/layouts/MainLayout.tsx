import { Link, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Animais', path: '/animais' },
  { label: 'Pastos', path: '/pastos' },
  { label: 'Vendas', path: '/vendas' },
  { label: 'Financeiro', path: '/financeiro' },
]

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-title">Gestao Pecuaria</p>
        <nav className="app-nav" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
