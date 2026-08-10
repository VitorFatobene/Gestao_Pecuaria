import { Banknote, CircleDollarSign, ReceiptText, Scale } from 'lucide-react'
import { type SalesSummary } from '../types/vendas.types'

type SalesSummaryCardsProps = {
  summary: SalesSummary
  isLoading: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function SalesSummaryCards({ summary, isLoading }: SalesSummaryCardsProps) {
  return (
    <section className="sales-summary-grid" aria-label="Indicadores de vendas">
      <SummaryCard
        icon={ReceiptText}
        title="Vendas do mes"
        value={numberFormatter.format(summary.vendasMes)}
        isLoading={isLoading}
      />
      <SummaryCard
        icon={CircleDollarSign}
        title="Faturamento"
        value={currencyFormatter.format(summary.faturamento)}
        isLoading={isLoading}
      />
      <SummaryCard
        icon={Banknote}
        title="Ticket medio"
        value={currencyFormatter.format(summary.ticketMedio)}
        isLoading={isLoading}
      />
      <SummaryCard
        icon={Scale}
        title="Animais vendidos"
        value={numberFormatter.format(summary.animaisVendidos)}
        isLoading={isLoading}
      />
    </section>
  )
}

type SummaryCardProps = {
  icon: typeof ReceiptText
  title: string
  value: string
  isLoading: boolean
}

function SummaryCard({ icon: Icon, title, value, isLoading }: SummaryCardProps) {
  return (
    <article className="sales-summary-card">
      <div>
        <span>{title}</span>
        {isLoading ? <i className="skeleton-line skeleton-value" /> : <strong>{value}</strong>}
      </div>
      <div className="sales-summary-icon">
        <Icon size={21} aria-hidden="true" />
      </div>
    </article>
  )
}
