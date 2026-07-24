import { type FinancialPoint } from '../types/dashboard.types'

type FinancialChartProps = {
  data: FinancialPoint[]
}

export function FinancialChart({ data }: FinancialChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((point) => [point.revenue, point.expense]),
  )

  return (
    <section className="dashboard-card financial-card">
      <div className="section-heading">
        <div>
          <h2>Evolucao financeira</h2>
          <p>Receitas e custos dos ultimos 6 meses</p>
        </div>
        <span className="period-pill">2026</span>
      </div>

      <div className="chart-area" aria-label="Grafico financeiro mockado">
        {data.map((point) => (
          <div className="chart-column" key={point.month}>
            <div className="bars">
              <span
                className="bar revenue"
                style={{ height: `${(point.revenue / maxValue) * 100}%` }}
                title={`Receita: ${point.revenue} mil`}
              />
              <span
                className="bar expense"
                style={{ height: `${(point.expense / maxValue) * 100}%` }}
                title={`Custo: ${point.expense} mil`}
              />
            </div>
            <span>{point.month}</span>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend revenue" />
          Receita
        </span>
        <span>
          <i className="legend expense" />
          Custos
        </span>
      </div>
    </section>
  )
}
