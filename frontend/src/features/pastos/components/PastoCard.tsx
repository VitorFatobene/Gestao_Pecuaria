import { Edit3, Power, PowerOff } from 'lucide-react'
import { type Pasto } from '../types/pastos.types'

type PastoCardProps = {
  pasto: Pasto
  onEdit: (pasto: Pasto) => void
  onToggleStatus: (pasto: Pasto) => void
  isUpdating: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function PastoCard({ pasto, onEdit, onToggleStatus, isUpdating }: PastoCardProps) {
  const ToggleIcon = pasto.ativo ? PowerOff : Power

  return (
    <article className="pasto-card">
      <div className="pasto-card-header">
        <div>
          <h2>{pasto.nome}</h2>
          <p>{numberFormatter.format(pasto.areaHectares)} ha</p>
        </div>
        <span className={`pasto-status ${pasto.ativo ? 'is-active' : 'is-inactive'}`}>
          {pasto.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <p className="pasto-description">{pasto.descricao || 'Sem descricao informada.'}</p>

      <div className="pasto-card-actions">
        <button type="button" className="secondary-action" onClick={() => onEdit(pasto)}>
          <Edit3 size={16} aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          className={pasto.ativo ? 'danger-action' : 'primary-action'}
          disabled={isUpdating}
          onClick={() => onToggleStatus(pasto)}
        >
          <ToggleIcon size={16} aria-hidden="true" />
          {pasto.ativo ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </article>
  )
}
