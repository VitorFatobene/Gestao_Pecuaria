import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { type SummaryCardData } from '../types/dashboard.types'

type SummaryCardProps = {
  item: SummaryCardData
}

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight,
}

export function SummaryCard({ item }: SummaryCardProps) {
  const Icon = item.icon
  const TrendIcon = trendIcon[item.trend]

  return (
    <article className="summary-card">
      <div className="summary-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <span>{item.title}</span>
        <strong>{item.value}</strong>
        <p className={`summary-trend trend-${item.trend}`}>
          <TrendIcon size={15} aria-hidden="true" />
          {item.description}
        </p>
      </div>
    </article>
  )
}
