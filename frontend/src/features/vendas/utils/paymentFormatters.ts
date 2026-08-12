import { type PagamentoResumo, type TipoPagamento } from '../types/vendas.types'

const paymentTypeLabels: Record<TipoPagamento, string> = {
  A_VISTA: 'À vista',
  PRAZO: 'Prazo',
  PARCELADO: 'Parcelado',
}

export function formatPaymentType(pagamento?: PagamentoResumo | null) {
  if (!pagamento?.tipoPagamento) {
    return '-'
  }

  return paymentTypeLabels[pagamento.tipoPagamento] ?? pagamento.tipoPagamento
}

export function formatPaymentInstallment(pagamento?: PagamentoResumo | null) {
  if (
    !pagamento ||
    pagamento.tipoPagamento === 'A_VISTA' ||
    pagamento.parcelaAtual === null ||
    pagamento.parcelaAtual === undefined ||
    pagamento.totalParcelas === null ||
    pagamento.totalParcelas === undefined
  ) {
    return '-'
  }

  return `${pagamento.parcelaAtual}/${pagamento.totalParcelas}`
}

export function getPaymentTypeClass(pagamento?: PagamentoResumo | null) {
  switch (pagamento?.tipoPagamento) {
    case 'A_VISTA':
      return 'is-cash'
    case 'PRAZO':
      return 'is-term'
    case 'PARCELADO':
      return 'is-installments'
    default:
      return 'is-unknown'
  }
}
