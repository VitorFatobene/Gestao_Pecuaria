import { ArrowLeft, Boxes, Plus } from 'lucide-react'
import { type CSSProperties } from 'react'
import heroBackground from '../../../assets/images/vendas-hero.jpg'

type SalesHeroProps = {
  onCreateSale?: () => void
  onCreateLoteSale?: () => void
  onBack?: () => void
  variant?: 'list' | 'lote'
}

type SalesHeroStyle = CSSProperties & {
  '--sales-hero-image': string
}

export function SalesHero({ onCreateSale, onCreateLoteSale, onBack, variant = 'list' }: SalesHeroProps) {
  const isLoteSale = variant === 'lote'

  return (
    <section className="sales-hero" style={{ '--sales-hero-image': `url(${heroBackground})` } as SalesHeroStyle}>
      <div className="sales-hero-content">
        <span>Comercial</span>
        <h1>{isLoteSale ? 'Venda de lote' : 'Gestao de vendas'}</h1>
        <p>
          {isLoteSale
            ? 'Registre a venda de um lote de animais e defina a condicao de pagamento da negociacao.'
            : 'Acompanhe suas vendas, faturamento e desempenho comercial. Tenha controle total sobre cada negociacao da fazenda.'}
        </p>
        <div className="sales-hero-actions">
          {isLoteSale ? (
            <button type="button" className="sales-hero-action is-secondary" onClick={onBack}>
              <ArrowLeft size={18} aria-hidden="true" />
              <span>Voltar para vendas</span>
            </button>
          ) : (
            <>
              <button type="button" className="sales-hero-action" onClick={onCreateLoteSale}>
                <Boxes size={18} aria-hidden="true" />
                <span>Vender lote</span>
              </button>
              <button type="button" className="sales-hero-action is-secondary" onClick={onCreateSale}>
                <Plus size={18} aria-hidden="true" />
                <span>Registrar venda</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
