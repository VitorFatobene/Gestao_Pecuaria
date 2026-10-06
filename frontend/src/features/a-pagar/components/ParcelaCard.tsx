import { CalendarDays, CheckCircle2 } from 'lucide-react'
import { type ParcelaContaPagar } from '../types/contaPagar.types'
import {
  formatCurrency,
  formatDate,
  formatDueDistance,
  formatInstallmentLabel,
  formatPaymentMethod,
} from '../utils/contaPagarFormatters'
import { ParcelaStatusBadge } from './ContaPagarStatusBadge'

type ParcelaCardProps = {
  parcela: ParcelaContaPagar
  totalParcelas: number
  onPay: (parcela: ParcelaContaPagar) => void
}

export function ParcelaCard({ parcela, totalParcelas, onPay }: ParcelaCardProps) {
  const canPay = parcela.status !== 'PAGA' && parcela.status !== 'CANCELADA'

  return (
    <article className="parcela-card">
      <div className="parcela-card-header">
        <div>
          <span>Parcela</span>
          <strong>{formatInstallmentLabel(parcela, totalParcelas)}</strong>
        </div>
        <ParcelaStatusBadge status={parcela.status} />
      </div>

      <strong className="parcela-card-value">{formatCurrency(parcela.valor)}</strong>

      <dl className="parcela-card-facts">
        <div>
          <dt>
            <CalendarDays size={14} aria-hidden="true" />
            Vencimento
          </dt>
          <dd>{formatDate(parcela.dataVencimento)}</dd>
          <small>{formatDueDistance(parcela)}</small>
        </div>
        <div>
          <dt>Pagamento</dt>
          <dd>{formatDate(parcela.dataPagamento)}</dd>
        </div>
        <div>
          <dt>Forma</dt>
          <dd>{formatPaymentMethod(parcela.formaPagamento)}</dd>
        </div>
      </dl>

      {canPay && (
        <button type="button" className="primary-action parcela-card-action" onClick={() => onPay(parcela)}>
          <CheckCircle2 size={16} aria-hidden="true" />
          Marcar como paga
        </button>
      )}
    </article>
  )
}
