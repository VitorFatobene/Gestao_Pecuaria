import { type CSSProperties } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroBackground from '../../../assets/images/dashboard-hero-farm.jpg'

type DashboardHeroStyle = CSSProperties & {
  '--dashboard-hero-image': string
}

export function DashboardHero() {
  return (
    <section
      className="dashboard-hero"
      style={{ '--dashboard-hero-image': `url(${heroBackground})` } as DashboardHeroStyle}
    >
      <div className="dashboard-hero-content">
        <span>Visão geral da fazenda</span>
        <h1>Controle diário da sua pecuária</h1>
        <p>Acompanhe rebanho, pastos, vendas e financeiro sem perder o ritmo da rotina no campo.</p>

        <div className="dashboard-hero-actions">
          <Link className="dashboard-hero-primary" to="/animais/novo">
            <Plus size={18} aria-hidden="true" />
            <span>Cadastrar animal</span>
          </Link>
          <Link className="dashboard-hero-secondary" to="/vendas/nova">
            <ShoppingCart size={18} aria-hidden="true" />
            <span>Registrar venda</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
