import { type CondicaoPagamento, type StatusPagamento } from '../types/venda.types'

export type PaymentPreviewItem = {
  label: string
  valor: number
  dataVencimento: string
  status: StatusPagamento
}

export function buildPaymentPreview(valorTotal: number, dataVenda: string, condition: CondicaoPagamento): PaymentPreviewItem[] {
  if (valorTotal <= 0 || !dataVenda) {
    return []
  }

  if (condition.tipoPagamento === 'A_VISTA') {
    return [{ label: 'Parcela 1', valor: roundMoney(valorTotal), dataVencimento: dataVenda, status: 'PAGO' }]
  }

  if (condition.tipoPagamento === 'PRAZO') {
    if (!condition.diasCarencia || condition.diasCarencia <= 0) {
      return []
    }

    return [
      {
        label: 'Parcela 1',
        valor: roundMoney(valorTotal),
        dataVencimento: addDays(dataVenda, condition.diasCarencia),
        status: 'PENDENTE',
      },
    ]
  }

  const quantidadeParcelas = condition.quantidadeParcelas ?? 0
  const intervaloDias = condition.intervaloDias ?? 0
  const entrada = condition.entrada ?? 0

  if (entrada < 0 || entrada > valorTotal || quantidadeParcelas <= 0 || intervaloDias <= 0) {
    return []
  }

  const items: PaymentPreviewItem[] = []
  if (entrada > 0) {
    items.push({ label: 'Entrada', valor: roundMoney(entrada), dataVencimento: dataVenda, status: 'PAGO' })
  }

  const parcelas = distributeMoney(valorTotal - entrada, quantidadeParcelas)
  parcelas.forEach((valor, index) => {
    items.push({
      label: `Parcela ${index + 1}`,
      valor,
      dataVencimento: addDays(dataVenda, intervaloDias * (index + 1)),
      status: 'PENDENTE',
    })
  })

  return items
}

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00Z`)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate.toISOString().slice(0, 10)
}

function distributeMoney(total: number, quantity: number) {
  const totalCents = Math.round(total * 100)
  const baseCents = Math.floor(totalCents / quantity)
  const remainder = totalCents - baseCents * quantity

  return Array.from({ length: quantity }).map((_, index) => (baseCents + (index < remainder ? 1 : 0)) / 100)
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}
