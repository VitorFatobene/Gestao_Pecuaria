import { type SaleStatus } from '../types/vendas.types'
import { formatSaleStatus, getSaleStatusClass } from '../utils/salesFormatters'

type SaleStatusBadgeProps = {
  status: SaleStatus
}

export function SaleStatusBadge({ status }: SaleStatusBadgeProps) {
  return <span className={`sale-status ${getSaleStatusClass(status)}`}>{formatSaleStatus(status)}</span>
}
