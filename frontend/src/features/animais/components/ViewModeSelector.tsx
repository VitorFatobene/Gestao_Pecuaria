import { Grid2X2, List } from 'lucide-react'
import { type AnimalViewMode } from '../types/animal.types'

type ViewModeSelectorProps = {
  value: AnimalViewMode
  onChange: (mode: AnimalViewMode) => void
}

export function ViewModeSelector({ value, onChange }: ViewModeSelectorProps) {
  return (
    <div className="view-toggle" aria-label="Alternar visualizacao">
      <button
        type="button"
        className={value === 'cards' ? 'is-selected' : ''}
        onClick={() => onChange('cards')}
        aria-label="Visualizar cards"
        title="Cards"
      >
        <Grid2X2 size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={value === 'table' ? 'is-selected' : ''}
        onClick={() => onChange('table')}
        aria-label="Visualizar tabela"
        title="Tabela"
      >
        <List size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

