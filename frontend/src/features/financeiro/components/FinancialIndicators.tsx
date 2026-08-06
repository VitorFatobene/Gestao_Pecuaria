import { BadgePercent, Calculator, Receipt } from 'lucide-react'
import { type FinanceiroResumo } from '../types/financeiro.types'

type FinancialIndicatorsProps = {
  resumo: FinanceiroResumo
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export function FinancialIndicators({ resumo }: FinancialIndicatorsProps) {
  const margemLucro = resumo.totalGasto > 0 ? (resumo.lucroTotal / resumo.totalGasto) * 100 : 0
  const ticketMedio = resumo.totalVendasRealizadas > 0 ? resumo.ganhoTotal / resumo.totalVendasRealizadas : 0
  const custoMedioAnimal =
    resumo.totalAnimaisCadastrados > 0 ? resumo.totalGasto / resumo.totalAnimaisCadastrados : 0

  return (
    <section className="financeiro-panel">
      <div className="section-heading">
        <div>
          <h2>Indicadores calculados</h2>
          <p>KPIs derivados do resumo financeiro atual</p>
        </div>
      </div>

      <div className="financeiro-indicators-grid">
        <IndicatorCard
          icon={BadgePercent}
          label="Margem de Lucro"
          value={`${percentFormatter.format(margemLucro)}%`}
          description="Lucro sobre o total gasto"
        />
        <IndicatorCard
          icon={Receipt}
          label="Ticket Medio por Venda"
          value={currencyFormatter.format(ticketMedio)}
          description="Ganho medio por venda realizada"
        />
        <IndicatorCard
          icon={Calculator}
          label="Custo Medio por Animal"
          value={currencyFormatter.format(custoMedioAnimal)}
          description="Custo medio por animal cadastrado"
        />
      </div>
    </section>
  )
}

type IndicatorCardProps = {
  icon: typeof BadgePercent
  label: string
  value: string
  description: string
}

function IndicatorCard({ icon: Icon, label, value, description }: IndicatorCardProps) {
  return (
    <article className="financeiro-indicator-card">
      <div className="financeiro-indicator-icon">
        <Icon size={19} aria-hidden="true" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    </article>
  )
}
