import { type PagamentoResumo } from '../types/vendas.types'
import { formatPaymentType, getPaymentTypeClass } from '../utils/paymentFormatters'

type PaymentTypeBadgeProps = {
  pagamento?: PagamentoResumo | null
}

export function PaymentTypeBadge({ pagamento }: PaymentTypeBadgeProps) {
  return <span className={`payment-type-badge ${getPaymentTypeClass(pagamento)}`}>{formatPaymentType(pagamento)}</span>
}
