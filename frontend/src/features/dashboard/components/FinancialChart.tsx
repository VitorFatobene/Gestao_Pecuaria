import { type FinancialPoint } from '../types/dashboard.types'

type FinancialChartProps = {
  data: FinancialPoint[]
}

export function FinancialChart({ data }: FinancialChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  return (
    <section className="dashboard-card financial-card">
      <div className="section-heading">
        <div>
          <h2>Indicadores financeiros</h2>
          <p>Valores consolidados retornados pela API</p>
        </div>
        <span className="period-pill">Atual</span>
      </div>

      <div className="chart-area compact-chart" aria-label="Grafico financeiro do dashboard">
        {data.map((point) => (
          <div className="chart-column" key={point.label}>
            <div className="bars">
              <span
                className={`bar ${point.kind}`}
                style={{ height: `${(point.value / maxValue) * 100}%` }}
                title={`${point.label}: ${point.value}`}
              />
            </div>
            <span>{point.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend profit" />
          Lucro
        </span>
        <span>
          <i className="legend reference" />
          Cotacao
        </span>
      </div>
    </section>
  )
}
