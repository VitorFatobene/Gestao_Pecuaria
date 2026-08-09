import { AlertTriangle, Gauge, LandPlot, Sprout } from 'lucide-react'
import { type PastoResumo } from '../types/pastos.types'

type PastureSummaryCardsProps = {
  pastos: PastoResumo[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

export function PastureSummaryCards({ pastos }: PastureSummaryCardsProps) {
  const pastosAtivos = pastos.filter((pasto) => pasto.ativo)
  const areaTotal = pastosAtivos.reduce((total, pasto) => total + pasto.areaHectares, 0)
  const capacidadeTotal = pastosAtivos.reduce((total, pasto) => total + pasto.capacidade, 0)
  const animaisAlocados = pastosAtivos.reduce((total, pasto) => total + pasto.quantidadeAnimais, 0)
  const ocupacaoMedia = capacidadeTotal > 0 ? (animaisAlocados / capacidadeTotal) * 100 : 0
  const pastosEmAtencao = pastosAtivos.filter((pasto) => pasto.quantidadeAnimais > pasto.capacidade).length

  return (
    <section className="pasture-summary-grid" aria-label="Indicadores dos pastos">
      <SummaryCard icon={Sprout} title="Pastos ativos" value={numberFormatter.format(pastosAtivos.length)} />
      <SummaryCard icon={LandPlot} title="Area total" value={`${numberFormatter.format(areaTotal)} ha`} />
      <SummaryCard icon={Gauge} title="Ocupacao media" value={`${percentFormatter.format(ocupacaoMedia)}%`} />
      <SummaryCard icon={AlertTriangle} title="Pastos em atencao" value={numberFormatter.format(pastosEmAtencao)} />
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
