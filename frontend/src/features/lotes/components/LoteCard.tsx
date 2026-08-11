import { CalendarDays, Eye, Pencil, Power, Scale, Users } from 'lucide-react'
import { type Lote } from '../types/lote.types'

type LoteCardProps = {
  lote: Lote
  onView: (lote: Lote) => void
  onEdit: (lote: Lote) => void
  onCancel: (lote: Lote) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function LoteCard({ lote, onView, onEdit, onCancel }: LoteCardProps) {
  const canChange = lote.status === 'ABERTO'

  return (
    <article className="lote-card">
      <div className="lote-card-header">
        <div>
          <span>Lote</span>
          <h2>{lote.nome}</h2>
        </div>
        <span className={`lote-status is-${lote.status.toLowerCase()}`}>{formatStatus(lote.status)}</span>
      </div>

      <dl className="lote-card-metrics">
        <div>
          <dt>
            <Users size={15} aria-hidden="true" />
            Animais
          </dt>
          <dd>{numberFormatter.format(lote.quantidadeAnimais)}</dd>
        </div>
        <div>
          <dt>
            <Scale size={15} aria-hidden="true" />
            Peso total
          </dt>
          <dd>{numberFormatter.format(lote.pesoTotalKg)} kg</dd>
        </div>
        <div>
          <dt>
            <CalendarDays size={15} aria-hidden="true" />
            Criado em
          </dt>
          <dd>{lote.criadoEm ? dateFormatter.format(new Date(lote.criadoEm)) : '-'}</dd>
        </div>
      </dl>

      <div className="lote-card-actions">
        <button type="button" className="secondary-action" onClick={() => onView(lote)}>
          <Eye size={16} aria-hidden="true" />
          Visualizar
        </button>
        <button type="button" className="secondary-action" onClick={() => onEdit(lote)} disabled={!canChange}>
          <Pencil size={16} aria-hidden="true" />
          Editar
        </button>
        <button type="button" className="danger-action" onClick={() => onCancel(lote)} disabled={!canChange}>
          <Power size={16} aria-hidden="true" />
          Cancelar lote
        </button>
      </div>
    </article>
  )
}

function formatStatus(status: Lote['status']) {
  const labels: Record<Lote['status'], string> = {
    ABERTO: 'ABERTO',
    VENDIDO: 'VENDIDO',
    CANCELADO: 'CANCELADO',
  }

  return labels[status]
}
