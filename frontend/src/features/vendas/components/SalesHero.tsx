import { Plus } from 'lucide-react'
import { type CSSProperties } from 'react'
import heroBackground from '../../../assets/images/vendas-hero.jpg'

type SalesHeroProps = {
  onCreateSale: () => void
}

type SalesHeroStyle = CSSProperties & {
  '--sales-hero-image': string
}

export function SalesHero({ onCreateSale }: SalesHeroProps) {
  return (
    <section className="sales-hero" style={{ '--sales-hero-image': `url(${heroBackground})` } as SalesHeroStyle}>
      <div className="sales-hero-content">
        <span>Comercial</span>
        <h1>Gestao de vendas</h1>
        <p>
          Acompanhe suas vendas, faturamento e desempenho comercial. Tenha controle total sobre cada negociacao da
          fazenda.
        </p>
        <button type="button" className="sales-hero-action" onClick={onCreateSale}>
          <Plus size={18} aria-hidden="true" />
          <span>Registrar venda</span>
        </button>
      </div>
    </section>
  )
}
