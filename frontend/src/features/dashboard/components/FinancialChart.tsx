import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type FinancialPoint } from '../dashboard.types'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

type FinancialChartProps = {
  data: FinancialPoint[]
}

export function FinancialChart({ data }: FinancialChartProps) {
  return (
    <section className="dashboard-card financial-card">
      <div className="section-heading">
        <div>
          <h2>Desempenho financeiro</h2>
          <p>Receitas x despesas</p>
        </div>
      </div>

      <div className="dashboard-chart" aria-label="Grafico de receitas e despesas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2E7A57" stopOpacity={0.24} />
                <stop offset="95%" stopColor="#2E7A57" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
            <XAxis axisLine={false} dataKey="mes" tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => `${Number(value) / 1000}k`}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={46}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#D1D5DB', strokeWidth: 1 }} />
            <Legend iconType="circle" wrapperStyle={{ color: '#374151', fontSize: 13, paddingTop: 12 }} />
            <Area
              dataKey="receitas"
              fill="url(#revenueGradient)"
              name="Receitas"
              stroke="#2E7A57"
              strokeWidth={3}
              type="monotone"
            />
            <Area
              dataKey="despesas"
              fill="url(#expenseGradient)"
              name="Despesas"
              stroke="#DC2626"
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
        {data.length === 0 && <div className="chart-empty-state">Sem dados financeiros no periodo.</div>}
      </div>
    </section>
  )
}

type ChartTooltipEntry = {
  color?: string
  name?: string
  value?: number
}

type ChartTooltipProps = {
  active?: boolean
  payload?: ChartTooltipEntry[]
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {currencyFormatter.format(entry.value ?? 0)}
        </span>
      ))}
    </div>
  )
}
