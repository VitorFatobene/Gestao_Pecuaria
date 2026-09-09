import { ArrowLeft, Boxes, Plus } from 'lucide-react'
import heroBackground from '../../../assets/images/vendas-hero-custom.jpg'
import { PageHero } from '../../../components/PageHero'

type SalesHeroProps = {
  onCreateSale?: () => void
  onCreateLoteSale?: () => void
  onBack?: () => void
  variant?: 'list' | 'lote'
}

export function SalesHero({ onCreateSale, onCreateLoteSale, onBack, variant = 'list' }: SalesHeroProps) {
  const isLoteSale = variant === 'lote'

  return (
    <PageHero
      label="Comercial"
      title={isLoteSale ? 'Venda de lote' : 'Gestão de vendas'}
      description={
        isLoteSale
          ? 'Registre a venda de um lote de animais e defina a condição de pagamento da negociação.'
          : 'Acompanhe negociações, lotes vendidos, faturamento e condições de pagamento.'
      }
      image={heroBackground}
      action={
        isLoteSale ? (
          <button type="button" className="page-hero-action is-secondary" onClick={onBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Voltar para vendas</span>
          </button>
        ) : (
          <>
            <button type="button" className="page-hero-action" onClick={onCreateLoteSale}>
              <Boxes size={18} aria-hidden="true" />
              <span>Vender lote</span>
            </button>
            <button type="button" className="page-hero-action is-secondary" onClick={onCreateSale}>
              <Plus size={18} aria-hidden="true" />
              <span>Registrar venda</span>
            </button>
          </>
        )
      }
    />
  )
}
