import { Plus, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImage from '../../../assets/hero.png'

export function DashboardHero() {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-content">
        <span>Visao geral da fazenda</span>
        <h1>Controle inteligente da sua pecuaria</h1>
        <p>Acompanhe animais, pastos, vendas e resultados financeiros em um unico lugar.</p>

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

      <div className="dashboard-hero-media" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
    </section>
  )
}
