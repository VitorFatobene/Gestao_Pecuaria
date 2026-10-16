import { Sprout } from 'lucide-react'
import { type PastoResumo } from '../types/pastos.types'

type PastureSummaryCardsProps = {
  pastos: PastoResumo[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
export function PastureSummaryCards({ pastos }: PastureSummaryCardsProps) {
  const pastosAtivos = pastos.filter((pasto) => pasto.ativo)

  return (
    <section className="pasture-summary-grid" aria-label="Indicadores dos pastos">
      <SummaryCard icon={Sprout} title="Pastos ativos" value={numberFormatter.format(pastosAtivos.length)} />
    </section>
  )
}

type SummaryCardProps = {
  icon: typeof Sprout
  title: string
  value: string
}

function SummaryCard({ icon: Icon, title, value }: SummaryCardProps) {
  return (
    <article className="pasture-summary-card">
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div className="pasture-summary-icon">
        <Icon size={21} aria-hidden="true" />
      </div>
    </article>
  )
}
