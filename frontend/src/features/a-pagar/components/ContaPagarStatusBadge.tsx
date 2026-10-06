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
}

type ParcelaStatusBadgeProps = {
  status: StatusParcelaContaPagar
}

export function ContaPagarStatusBadge({ status }: ContaPagarStatusBadgeProps) {
  return (
    <span className={`conta-pagar-status ${getAccountStatusClass(status)}`}>
      {formatAccountStatus(status)}
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
