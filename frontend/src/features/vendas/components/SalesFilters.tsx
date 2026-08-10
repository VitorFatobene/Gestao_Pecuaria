import { Filter, Search, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { type SalesFilterParams, type SaleStatus, type Venda } from '../types/vendas.types'

type SalesFiltersProps = {
  filters: SalesFilterParams
  animais: Venda[]
  isLoading: boolean
  onFilter: (filters: SalesFilterParams) => void
  onClear: () => void
}

const statusOptions: Array<{ value: SaleStatus; label: string }> = [
  { value: 'CONCLUIDA', label: 'Concluida' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export function SalesFilters({ filters, animais, isLoading, onFilter, onClear }: SalesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SalesFilterParams>(filters)
  const [error, setError] = useState<string | null>(null)

  const animalOptions = Array.from(
    new Map(animais.map((venda) => [venda.animalId, venda])).values(),
  ).sort((a, b) => String(a.codigoAnimal).localeCompare(String(b.codigoAnimal), 'pt-BR'))

  function updateField<K extends keyof SalesFilterParams>(field: K, value: SalesFilterParams[K]) {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if ((localFilters.inicio && !localFilters.fim) || (!localFilters.inicio && localFilters.fim)) {
      setError('Informe a data inicial e a data final.')
      return
    }

    if (localFilters.inicio && localFilters.fim && localFilters.inicio > localFilters.fim) {
      setError('A data inicial nao pode ser maior que a data final.')
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
    <section className="sales-filters-card">
      <div className="sales-filters-heading">
        <div>
          <span>Filtros comerciais</span>
          <h2>Refine a carteira de vendas</h2>
        </div>
      </div>

      <form className="sales-filter-fields" onSubmit={handleSubmit}>
        <label>
          <span>Data inicial</span>
          <input
            type="date"
            value={localFilters.inicio ?? ''}
            onChange={(event) => updateField('inicio', event.target.value || undefined)}
          />
        </label>

        <label>
          <span>Data final</span>
          <input
            type="date"
            value={localFilters.fim ?? ''}
            onChange={(event) => updateField('fim', event.target.value || undefined)}
          />
        </label>

        <label>
          <span>Animal</span>
          <select
            value={localFilters.animalId ?? ''}
            onChange={(event) => updateField('animalId', event.target.value ? Number(event.target.value) : undefined)}
          >
            <option value="">Todos os animais</option>
            {animalOptions.map((venda) => (
              <option value={venda.animalId} key={venda.animalId}>
                {venda.codigoAnimal} {venda.racaAnimal ? `- ${venda.racaAnimal}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status</span>
          <select
            value={localFilters.status ?? ''}
            onChange={(event) => updateField('status', (event.target.value || undefined) as SaleStatus | undefined)}
          >
            <option value="">Todos os status</option>
            {statusOptions.map((status) => (
              <option value={status.value} key={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="sales-search">
          <span>Busca</span>
          <div>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Comprador, animal ou ID"
              value={localFilters.busca ?? ''}
              onChange={(event) => updateField('busca', event.target.value || undefined)}
            />
          </div>
        </label>

        <div className="sales-filter-buttons">
          <button type="submit" className="primary-action" disabled={isLoading}>
            <Filter size={16} aria-hidden="true" />
            Filtrar
          </button>
          <button type="button" className="secondary-action" onClick={handleClear} disabled={isLoading}>
            <X size={16} aria-hidden="true" />
            Limpar
          </button>
        </div>

        {error && <small className="sales-filter-error">{error}</small>}
      </form>
    </section>
  )
}
