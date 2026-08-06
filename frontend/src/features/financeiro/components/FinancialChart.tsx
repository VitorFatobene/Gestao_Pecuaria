import { type FinanceiroResumo } from '../types/financeiro.types'

type FinancialChartProps = {
  resumo: FinanceiroResumo
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function FinancialChart({ resumo }: FinancialChartProps) {
  const lucroKind = resumo.lucroTotal < 0 ? 'loss' : 'profit'
  const data = [
    { label: 'Gasto', value: resumo.totalGasto, kind: 'expense' },
    { label: 'Ganho', value: resumo.ganhoTotal, kind: 'revenue' },
    { label: resumo.lucroTotal < 0 ? 'Prejuizo' : 'Lucro', value: Math.abs(resumo.lucroTotal), kind: lucroKind },
  ]
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  return (
    <section className="financeiro-panel financial-chart-panel">
      <div className="section-heading">
        <div>
          <h2>Comparativo financeiro</h2>
          <p>Gasto, ganho e resultado liquido</p>
        </div>
        <span className="period-pill">Atual</span>
      </div>

      <div className="financeiro-chart" aria-label="Grafico comparativo financeiro">
        {data.map((point) => (
          <div className="financeiro-chart-column" key={point.label}>
            <div className="financeiro-chart-bar-track">
              <span
                className={`financeiro-chart-bar ${point.kind}`}
                style={{ height: `${(point.value / maxValue) * 100}%` }}
                title={`${point.label}: ${currencyFormatter.format(point.value)}`}
              />
            </div>
            <strong>{currencyFormatter.format(point.value)}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend expense" />
          Total Gasto
        </span>
        <span>
          <i className="legend revenue" />
          Ganho Total
        </span>
        <span>
          <i className={`legend ${lucroKind}`} />
          Resultado
        </span>
      </div>
    </section>
  )
}
