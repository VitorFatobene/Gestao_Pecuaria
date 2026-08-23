import { CalendarDays, Filter, PawPrint, Sprout, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { type Animal } from '../../animais/types/animal.types'
import { type Pasto } from '../../pastos/types/pastos.types'
import { type MovimentacaoFilters as MovimentacaoFiltersType } from '../types/movimentacoes.types'

type MovimentacaoFiltersProps = {
  filters: MovimentacaoFiltersType
  animais: Animal[]
  pastos: Pasto[]
  isLoading: boolean
  onFilter: (filters: MovimentacaoFiltersType) => void
  onClear: () => void
}

export function MovimentacaoFilters({
  filters,
  animais,
  pastos,
  isLoading,
  onFilter,
  onClear,
}: MovimentacaoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<MovimentacaoFiltersType>(filters)
  const [error, setError] = useState<string | null>(null)

  const animalOptions = [...animais].sort((a, b) => a.codigoAnimal.localeCompare(b.codigoAnimal, 'pt-BR'))
  const pastoOptions = [...pastos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  function updateField<K extends keyof MovimentacaoFiltersType>(field: K, value: MovimentacaoFiltersType[K]) {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (localFilters.inicio && localFilters.fim && localFilters.inicio > localFilters.fim) {
      setError('A data inicial não pode ser maior que a data final.')
      return
    }

    setError(null)
    onFilter(localFilters)
  }

  function handleClear() {
    setError(null)
    setLocalFilters({})
    onClear()
  }

  return (
    <section className="movimentacoes-filters-card">
      <div className="movimentacoes-filters-heading">
        <div>
          <span>Filtros de manejo</span>
          <h2>Histórico entre pastos</h2>
        </div>
      </div>

      <form className="movimentacoes-filter-fields" onSubmit={handleSubmit}>
        <label>
          <span>Animal</span>
          <div className="movimentacoes-select-field">
            <PawPrint size={17} aria-hidden="true" />
            <select
              value={localFilters.animalId ?? ''}
              onChange={(event) => updateField('animalId', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Todos os animais</option>
              {animalOptions.map((animal) => (
                <option value={animal.id} key={animal.id}>
                  {animal.codigoAnimal} - {animal.raca}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label>
          <span>Pasto</span>
          <div className="movimentacoes-select-field">
            <Sprout size={17} aria-hidden="true" />
            <select
              value={localFilters.pastoId ?? ''}
              onChange={(event) => updateField('pastoId', event.target.value ? Number(event.target.value) : undefined)}
            >
              <option value="">Todos os pastos</option>
              {pastoOptions.map((pasto) => (
                <option value={pasto.id} key={pasto.id}>
                  {pasto.nome}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label>
          <span>Data inicial</span>
          <div className="movimentacoes-date-field">
            <CalendarDays size={17} aria-hidden="true" />
            <input
              type="date"
              value={localFilters.inicio ?? ''}
              onChange={(event) => updateField('inicio', event.target.value || undefined)}
            />
          </div>
        </label>

        <label>
          <span>Data final</span>
          <div className="movimentacoes-date-field">
            <CalendarDays size={17} aria-hidden="true" />
            <input
              type="date"
              value={localFilters.fim ?? ''}
              onChange={(event) => updateField('fim', event.target.value || undefined)}
            />
          </div>
        </label>

        <div className="movimentacoes-filter-buttons">
          <button type="submit" className="primary-action" disabled={isLoading}>
            <Filter size={16} aria-hidden="true" />
            Filtrar
          </button>
          <button type="button" className="secondary-action" onClick={handleClear} disabled={isLoading}>
            <X size={16} aria-hidden="true" />
            Limpar
          </button>
        </div>

        {error && <small className="movimentacoes-filter-error">{error}</small>}
      </form>
    </section>
  )
}
