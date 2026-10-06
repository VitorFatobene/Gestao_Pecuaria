import {
  type CategoriaContaPagar,
  type ContaPagar,
  type FormaPagamento,
  type ParcelaContaPagar,
  type StatusContaPagar,
  type StatusParcelaContaPagar,
  type TipoPagamentoContaPagar,
} from '../types/contaPagar.types'

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

const categoryLabels: Record<CategoriaContaPagar, string> = {
  ANIMAL: 'Animal',
  RACAO: 'Ração',
  SUPLEMENTOS_PASTO: 'Suplementos de pasto',
}

const paymentTypeLabels: Record<TipoPagamentoContaPagar, string> = {
  A_VISTA: 'À vista',
  PRAZO: 'Prazo',
  PARCELADO: 'Parcelado',
}

const accountStatusLabels: Record<StatusContaPagar, string> = {
  PENDENTE: 'Pendente',
  PARCIALMENTE_PAGA: 'Parcialmente paga',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada',
}

const installmentStatusLabels: Record<StatusParcelaContaPagar, string> = {
  PENDENTE: 'Pendente',
  PAGA: 'Paga',
  ATRASADA: 'Atrasada',
  CANCELADA: 'Cancelada',
}

const paymentMethodLabels: Record<FormaPagamento, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
  OUTROS: 'Outros',
}

export function formatCurrency(value?: number | null) {
  return currencyFormatter.format(value ?? 0)
}

export function formatDate(date?: string | null) {
  if (!date) {
    return '-'
  }

  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

export function formatCategory(category: CategoriaContaPagar) {
  return categoryLabels[category] ?? category
}

export function formatPaymentType(type: TipoPagamentoContaPagar) {
  return paymentTypeLabels[type] ?? type
}

export function formatAccountStatus(status: StatusContaPagar) {
  return accountStatusLabels[status] ?? status
}

export function formatInstallmentStatus(status: StatusParcelaContaPagar) {
  return installmentStatusLabels[status] ?? status
}

export function formatPaymentMethod(method?: FormaPagamento | null) {
  if (!method) {
    return '-'
  }

  return paymentMethodLabels[method] ?? method
}

export function getAccountStatusClass(status: StatusContaPagar) {
  const classes: Record<StatusContaPagar, string> = {
    PENDENTE: 'is-pending',
    PARCIALMENTE_PAGA: 'is-partial',
    PAGA: 'is-paid',
    CANCELADA: 'is-canceled',
  }

  return classes[status]
}

export function getInstallmentStatusClass(status: StatusParcelaContaPagar) {
  const classes: Record<StatusParcelaContaPagar, string> = {
    PENDENTE: 'is-pending',
    PAGA: 'is-paid',
    ATRASADA: 'is-overdue',
    CANCELADA: 'is-canceled',
  }

  return classes[status]
}

export function getNextInstallment(conta: ContaPagar) {
  const pending = conta.parcelas
    .filter((parcela) => parcela.status !== 'PAGA' && parcela.status !== 'CANCELADA')
    .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento))

  return pending[0] ?? null
}

export function formatInstallmentLabel(parcela?: ParcelaContaPagar | null, totalParcelas?: number) {
  if (!parcela) {
    return '-'
  }

  return `${parcela.numeroParcela}/${totalParcelas ?? parcela.numeroParcela}`
}

export function formatDueDistance(parcela?: ParcelaContaPagar | null) {
  if (!parcela || parcela.diasParaVencimento === null || parcela.diasParaVencimento === undefined) {
    return '-'
  }

  if (parcela.diasParaVencimento < 0) {
    const days = Math.abs(parcela.diasParaVencimento)
    return days === 1 ? 'Vencida há 1 dia' : `Vencida há ${days} dias`
  }

  if (parcela.diasParaVencimento === 0) {
    return 'Vence hoje'
  }

  return parcela.diasParaVencimento === 1
    ? 'Vence em 1 dia'
    : `Vence em ${parcela.diasParaVencimento} dias`
}
