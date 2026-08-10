import { type SaleStatus, type Venda } from '../types/vendas.types'

export function getSaleStatus(venda: Venda): SaleStatus {
  return venda.status ?? 'CONCLUIDA'
}

export function formatSaleStatus(status: SaleStatus) {
  const labels: Record<SaleStatus, string> = {
    CONCLUIDA: 'Concluida',
    PENDENTE: 'Pendente',
    CANCELADA: 'Cancelada',
  }

  return labels[status]
}

export function formatSaleId(id: number) {
  return `VEN-${String(id).padStart(6, '0')}`
}

export function getSaleStatusClass(status: SaleStatus) {
  const classes: Record<SaleStatus, string> = {
    CONCLUIDA: 'is-concluded',
    PENDENTE: 'is-pending',
    CANCELADA: 'is-canceled',
  }

  return classes[status]
}
