import { Beef, Edit3, Eye, LandPlot, PowerOff, Repeat2 } from 'lucide-react'
import { type PastoResumo } from '../types/pastos.types'

type PastureCardProps = {
  pasto: PastoResumo
  onDetails: (pasto: PastoResumo) => void
  onEdit: (pasto: PastoResumo) => void
  onDeactivate: (pasto: PastoResumo) => void
  isUpdating: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

export function PastureCard({ pasto, onDetails, onEdit, onDeactivate, isUpdating }: PastureCardProps) {
  const occupationWidth = Math.min(pasto.ocupacaoPercentual, 100)

  return (
    <article className="pasture-card" onClick={() => onDetails(pasto)}>
      <div className="pasture-card-header">
        <div>
          <span>{pasto.tipoPastagem}</span>
          <h2>{pasto.nome}</h2>
        </div>
        <StatusBadge status={pasto.statusOcupacao} />
      </div>

      <dl className="pasture-card-facts">
        <div>
          <dt>Area</dt>
          <dd>{numberFormatter.format(pasto.areaHectares)} ha</dd>
        </div>
        <div>
          <dt>Capacidade</dt>
          <dd>{numberFormatter.format(pasto.capacidade)} animais</dd>
        </div>
        <div>
          <dt>Alocados</dt>
          <dd>{numberFormatter.format(pasto.quantidadeAnimais)} animais</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{pasto.ativo ? 'Ativo' : 'Inativo'}</dd>
        </div>
      </dl>

      <div className="pasture-occupancy">
        <div className="pasture-occupancy-meta">
          <span>Ocupacao</span>
          <strong>{percentFormatter.format(pasto.ocupacaoPercentual)}%</strong>
        </div>
        <div className="pasture-progress" aria-hidden="true">
          <span className={`is-${pasto.statusOcupacao.toLowerCase()}`} style={{ width: `${occupationWidth}%` }} />
        </div>
      </div>

      <div className="pasture-card-footer">
        <span>
          <LandPlot size={14} aria-hidden="true" />
          {numberFormatter.format(pasto.areaHectares)} hectares
        </span>
        <span>
          <Beef size={14} aria-hidden="true" />
          {numberFormatter.format(pasto.quantidadeAnimais)} alocados
        </span>
      </div>

      <div className="pasture-card-actions" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="secondary-action" onClick={() => onDetails(pasto)}>
          <Eye size={16} aria-hidden="true" />
          Detalhes
        </button>
        <button type="button" className="secondary-action" onClick={() => onEdit(pasto)}>
          <Edit3 size={16} aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          className="danger-action"
          disabled={isUpdating || !pasto.ativo}
          onClick={() => onDeactivate(pasto)}
        >
          <PowerOff size={16} aria-hidden="true" />
          Desativar
        </button>
        <button type="button" className="secondary-action" disabled title="Interface preparada para movimentacao">
          <Repeat2 size={16} aria-hidden="true" />
          Mover animal
        </button>
      </div>
    </article>
  )
}

type StatusBadgeProps = {
  status: PastoResumo['statusOcupacao']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const labels: Record<PastoResumo['statusOcupacao'], string> = {
    NORMAL: 'Normal',
    ATENCAO: 'Atencao',
    LOTADO: 'Lotado',
  }

  return <span className={`pasture-status is-${status.toLowerCase()}`}>{labels[status]}</span>
}
