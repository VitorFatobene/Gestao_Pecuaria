import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { type SummaryCardData } from '../dashboard.types'

type SummaryCardProps = {
  item: SummaryCardData
  isLoading?: boolean
}

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight,
}

export function SummaryCard({ item, isLoading = false }: SummaryCardProps) {
  const Icon = item.icon
  const TrendIcon = trendIcon[item.trend]

  return (
    <article className={`summary-card ${isLoading ? 'is-loading' : ''}`}>
      <div className="summary-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <span>{item.title}</span>
        {isLoading ? <i className="skeleton-line skeleton-value" /> : <strong>{item.value}</strong>}
        <p className={`summary-trend trend-${item.trend}`}>
          <TrendIcon size={15} aria-hidden="true" />
          {isLoading ? <i className="skeleton-line skeleton-text" /> : item.indicator}
        </p>
      </div>
    </article>
  )
}
