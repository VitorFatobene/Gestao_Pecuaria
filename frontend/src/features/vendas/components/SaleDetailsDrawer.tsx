import { CalendarDays, CircleDollarSign, MapPin, ReceiptText, Scale, Tag, X } from 'lucide-react'
import { type Venda } from '../types/vendas.types'
import { formatSaleId, formatSaleStatus, getSaleStatus } from '../utils/salesFormatters'
import { formatPaymentInstallment, formatPaymentType } from '../utils/paymentFormatters'
import { SaleStatusBadge } from './SaleStatusBadge'

type SaleDetailsDrawerProps = {
  venda: Venda
  onClose: () => void
  onOpenPage: (venda: Venda) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function SaleDetailsDrawer({ venda, onClose, onOpenPage }: SaleDetailsDrawerProps) {
  const valorCompra = (venda.valorCompraAnimal ?? 0) + (venda.valorFreteAnimal ?? 0)
  const hasPurchaseValue = venda.valorCompraAnimal !== null && venda.valorCompraAnimal !== undefined
  const lucroEstimado = hasPurchaseValue ? venda.valorVenda - valorCompra : null

  return (
    <div className="sale-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="sale-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sale-drawer-header">
          <div>
            <span>Detalhes da venda</span>
            <h2 id="sale-drawer-title">{formatSaleId(venda.id)}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="sale-details-modal-body">
          <div className="sale-drawer-summary">
            <div>
              <strong>{currencyFormatter.format(venda.valorVenda)}</strong>
              <span>{venda.nomeComprador}</span>
            </div>
            <SaleStatusBadge status={getSaleStatus(venda)} />
          </div>

          <section className="sale-drawer-section">
            <div className="sale-section-title">
              <ReceiptText size={18} aria-hidden="true" />
              <strong>Dados da venda</strong>
            </div>
            <div className="sale-drawer-info">
              <DrawerInfo label="ID" value={formatSaleId(venda.id)} />
              <DrawerInfo label="Data" value={formatDate(venda.dataVenda)} />
              <DrawerInfo label="Comprador" value={venda.nomeComprador} />
              <DrawerInfo label="Tipo" value={formatPaymentType(venda.pagamento)} />
              <DrawerInfo label="Parcela" value={formatPaymentInstallment(venda.pagamento)} />
              <DrawerInfo label="Status" value={formatSaleStatus(getSaleStatus(venda))} />
            </div>
          </section>

          <section className="sale-drawer-section">
            <div className="sale-section-title">
              <Tag size={18} aria-hidden="true" />
              <strong>Dados do animal</strong>
            </div>
            <div className="sale-drawer-info">
              <DrawerInfo label="Nome" value={`Animal ${venda.codigoAnimal}`} />
              <DrawerInfo label="Raca" value={venda.racaAnimal ?? 'Nao informada'} />
              <DrawerInfo label="Peso" value={`${numberFormatter.format(venda.pesoKgVenda)} kg`} />
              <DrawerInfo label="Pasto" value={venda.nomePastoAnimal ?? 'Sem pasto atual'} />
            </div>
          </section>

          <section className="sale-drawer-finance">
            <DrawerMetric
              icon={CircleDollarSign}
              label="Valor da venda"
              value={currencyFormatter.format(venda.valorVenda)}
            />
            <DrawerMetric
              icon={CalendarDays}
              label="Valor de compra"
              value={hasPurchaseValue ? currencyFormatter.format(valorCompra) : 'Nao informado'}
            />
            <DrawerMetric
              icon={Scale}
              label="Lucro estimado"
              value={lucroEstimado === null ? 'Nao informado' : currencyFormatter.format(lucroEstimado)}
              tone={lucroEstimado !== null && lucroEstimado < 0 ? 'negative' : 'positive'}
            />
            <DrawerMetric icon={MapPin} label="Pasto atual" value={venda.nomePastoAnimal ?? 'Sem pasto atual'} />
          </section>
        </div>

        <div className="sale-drawer-actions">
          <button type="button" className="primary-action" onClick={() => onOpenPage(venda)}>
            Abrir detalhes completos
          </button>
        </div>
      </section>
    </div>
  )
}

type DrawerInfoProps = {
  label: string
  value: string
}

function DrawerInfo({ label, value }: DrawerInfoProps) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type DrawerMetricProps = DrawerInfoProps & {
  icon: typeof CalendarDays
  tone?: 'positive' | 'negative'
}

function DrawerMetric({ icon: Icon, label, value, tone }: DrawerMetricProps) {
  return (
    <article className={tone ? `is-${tone}` : undefined}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}
