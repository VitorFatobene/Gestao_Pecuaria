import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { type SalesChartPoint } from '../types/vendas.types'

type SalesChartProps = {
  data: SalesChartPoint[]
  isLoading: boolean
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function SalesChart({ data, isLoading }: SalesChartProps) {
  return (
    <section className="sales-panel">
      <div className="section-heading">
        <div>
          <h2>Evolucao de faturamento</h2>
          <p>Ultimos 6 meses com vendas registradas no periodo analisado.</p>
        </div>
      </div>

      <div className="sales-chart">
        {isLoading ? (
          <div className="sales-chart-skeleton">
            {Array.from({ length: 6 }).map((_, index) => (
              <i className="skeleton-line" key={index} />
            ))}
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7A57" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2E7A57" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f0" vertical={false} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={76}
                  tickFormatter={(value) => currencyFormatter.format(Number(value)).replace(/\s/g, '')}
                />
                <Tooltip content={(props) => <SalesTooltip {...props} />} />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#1F5E43"
                  strokeWidth={3}
                  fill="url(#salesRevenueGradient)"
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#2E7A57' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            {data.every((item) => item.faturamento === 0) && (
              <div className="chart-empty-state">Sem faturamento registrado nos ultimos 6 meses.</div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function SalesTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>{currencyFormatter.format(Number(payload[0].value ?? 0))}</span>
    </div>
  )
}
