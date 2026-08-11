import { type SaleStatus, type Venda } from '../types/vendas.types'

export function getSaleStatus(venda: Venda): SaleStatus {
  return venda.status ?? 'CONCLUIDA'
}

export function formatSaleStatus(status: SaleStatus) {
  const labels: Record<SaleStatus, string> = {
    CONCLUIDA: 'Concluida',
    PENDENTE: 'Pendente',
    CANCELADA: 'Cancelada',
    AGUARDANDO_PAGAMENTO: 'Aguardando',
    PAGA: 'Paga',
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
    AGUARDANDO_PAGAMENTO: 'is-pending',
    PAGA: 'is-concluded',
  }

  return classes[status]
}
