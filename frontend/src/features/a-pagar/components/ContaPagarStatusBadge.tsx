import {
  formatAccountStatus,
  formatInstallmentStatus,
  getAccountStatusClass,
  getInstallmentStatusClass,
} from '../utils/contaPagarFormatters'
import {
  type StatusContaPagar,
  type StatusParcelaContaPagar,
} from '../types/contaPagar.types'

type ContaPagarStatusBadgeProps = {
  status: StatusContaPagar
  compact?: boolean
}

type ParcelaStatusBadgeProps = {
  status: StatusParcelaContaPagar
}

const compactAccountStatusLabels: Record<StatusContaPagar, string> = {
  PENDENTE: 'Pendente',
  PARCIALMENTE_PAGA: 'Parcial',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada',
}

export function ContaPagarStatusBadge({ status, compact = false }: ContaPagarStatusBadgeProps) {
  return (
    <span className={`conta-pagar-status ${getAccountStatusClass(status)}`}>
      {compact ? compactAccountStatusLabels[status] : formatAccountStatus(status)}
    </span>
  )
}

export function ParcelaStatusBadge({ status }: ParcelaStatusBadgeProps) {
  return (
    <span className={`conta-pagar-status ${getInstallmentStatusClass(status)}`}>
      {formatInstallmentStatus(status)}
    </span>
  )
}
