import { Activity, CircleDollarSign, ReceiptText, Scale, TrendingUp } from 'lucide-react'
import { type PeriodSummaryData } from '../types/vendas.types'

type PeriodSummaryProps = {
  summary: PeriodSummaryData
  isLoading: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function PeriodSummary({ summary, isLoading }: PeriodSummaryProps) {
  return (
    <section className="sales-panel period-summary-card">
      <div className="section-heading">
        <div>
          <h2>Resumo do periodo</h2>
          <p>Indicadores calculados sobre as vendas exibidas.</p>
        </div>
      </div>

      <div className="period-summary-list">
        <SummaryItem icon={ReceiptText} label="Total de vendas" value={numberFormatter.format(summary.totalVendas)} isLoading={isLoading} />
        <SummaryItem
          icon={CircleDollarSign}
          label="Faturamento total"
          value={currencyFormatter.format(summary.faturamentoTotal)}
          isLoading={isLoading}
        />
        <SummaryItem icon={Activity} label="Animais vendidos" value={numberFormatter.format(summary.animaisVendidos)} isLoading={isLoading} />
        <SummaryItem
          icon={Scale}
          label="Peso total vendido"
          value={`${numberFormatter.format(summary.pesoTotalVendido)} kg`}
          isLoading={isLoading}
        />
        <SummaryItem
          icon={TrendingUp}
          label="Conversao"
          value={`${percentFormatter.format(summary.conversao)}%`}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}

type SummaryItemProps = {
  icon: typeof ReceiptText
  label: string
  value: string
  isLoading: boolean
}

function SummaryItem({ icon: Icon, label, value, isLoading }: SummaryItemProps) {
  return (
    <article className="period-summary-item">
      <div className="period-summary-icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <span>{label}</span>
        {isLoading ? <i className="skeleton-line skeleton-text" /> : <strong>{value}</strong>}
      </div>
    </article>
  )
}
