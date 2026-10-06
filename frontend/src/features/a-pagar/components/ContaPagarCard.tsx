import { CalendarDays, Eye, Store } from 'lucide-react'
import { type ContaPagar } from '../types/contaPagar.types'
import {
  formatCategory,
  formatCurrency,
  formatDate,
  formatDueDistance,
  formatInstallmentLabel,
  getNextInstallment,
} from '../utils/contaPagarFormatters'
import { ContaPagarStatusBadge } from './ContaPagarStatusBadge'

type ContaPagarCardProps = {
  conta: ContaPagar
  onViewDetails: (conta: ContaPagar) => void
}

export function ContaPagarCard({ conta, onViewDetails }: ContaPagarCardProps) {
  const nextInstallment = getNextInstallment(conta)

  return (
    <article className="conta-pagar-card">
      <div className="conta-pagar-card-header">
        <div>
          <span>{formatCategory(conta.categoria)}</span>
          <h2>{conta.descricao}</h2>
        </div>
        <ContaPagarStatusBadge status={conta.status} />
      </div>

      <div className="conta-pagar-card-supplier">
        <Store size={16} aria-hidden="true" />
        <span>{conta.fornecedor}</span>
      </div>

      <dl className="conta-pagar-card-facts">
        <div>
          <dt>Restante</dt>
          <dd>{formatCurrency(conta.valorRestante)}</dd>
        </div>
        <div>
          <dt>
            <CalendarDays size={14} aria-hidden="true" />
            Próximo vencimento
          </dt>
          <dd>{formatDate(nextInstallment?.dataVencimento)}</dd>
          <small>{formatDueDistance(nextInstallment)}</small>
        </div>
        <div>
          <dt>Parcela atual</dt>
          <dd>{formatInstallmentLabel(nextInstallment, conta.quantidadeParcelas)}</dd>
        </div>
      </dl>

      <button type="button" className="secondary-action conta-pagar-card-action" onClick={() => onViewDetails(conta)}>
        <Eye size={16} aria-hidden="true" />
        Ver detalhes
      </button>
    </article>
  )
}
