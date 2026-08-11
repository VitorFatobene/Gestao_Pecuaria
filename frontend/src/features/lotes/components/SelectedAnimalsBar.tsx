import { PackagePlus, X } from 'lucide-react'
import { type Animal } from '../../animais/types/animal.types'

type SelectedAnimalsBarProps = {
  animais: Animal[]
  onCancel: () => void
  onCreateLote: () => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function SelectedAnimalsBar({ animais, onCancel, onCreateLote }: SelectedAnimalsBarProps) {
  const totalWeight = animais.reduce((sum, animal) => sum + Number(animal.pesoKg || 0), 0)

  if (animais.length === 0) {
    return null
  }

  return (
    <section className="selected-animals-bar" aria-label="Animais selecionados para lote">
      <div className="selected-animals-summary">
        <strong>{animais.length} animais selecionados</strong>
        <span>
          Quantidade: {animais.length} {animais.length === 1 ? 'animal' : 'animais'}
        </span>
        <span>Peso total: {numberFormatter.format(totalWeight)} kg</span>
      </div>

      <div className="selected-animals-actions">
        <button type="button" className="secondary-action" onClick={onCancel}>
          <X size={16} aria-hidden="true" />
          Cancelar selecao
        </button>
        <button type="button" className="primary-action" onClick={onCreateLote}>
          <PackagePlus size={16} aria-hidden="true" />
          Criar lote
        </button>
      </div>
    </section>
  )
}
