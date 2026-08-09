import { Filter, Grid2X2, List, Search, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { type PastoFilterParams, type PastoStatusFilter, type PastoTipoFilter, type PastoViewMode } from '../types/pastos.types'

type PastureFiltersProps = {
  filters: PastoFilterParams
  tiposPastagem: string[]
  viewMode: PastoViewMode
  onFilter: (filters: PastoFilterParams) => void
  onClear: () => void
  onViewModeChange: (mode: PastoViewMode) => void
}

export function PastureFilters({
  filters,
  tiposPastagem,
  viewMode,
  onFilter,
  onClear,
  onViewModeChange,
}: PastureFiltersProps) {
  const [localFilters, setLocalFilters] = useState<PastoFilterParams>(filters)

  function updateFilter<K extends keyof PastoFilterParams>(field: K, value: PastoFilterParams[K]) {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onFilter(localFilters)
  }

  function handleClear() {
    setLocalFilters({})
    onClear()
  }

  return (
    <form className="pasture-filters-card" onSubmit={handleSubmit}>
      <div className="pasture-filters-heading">
        <div>
          <span>Filtros</span>
          <h2>Consulta de areas</h2>
        </div>
        <div className="animal-view-toggle" aria-label="Alternar visualizacao">
          <button
            type="button"
            className={viewMode === 'cards' ? 'is-selected' : ''}
            onClick={() => onViewModeChange('cards')}
            aria-label="Visualizar em cards"
            title="Cards"
          >
            <Grid2X2 size={17} aria-hidden="true" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={viewMode === 'table' ? 'is-selected' : ''}
            onClick={() => onViewModeChange('table')}
            aria-label="Visualizar em tabela"
            title="Tabela"
          >
            <List size={18} aria-hidden="true" />
            <span>Tabela</span>
          </button>
        </div>
      </div>

      <div className="pasture-filter-fields">
        <label className="pasture-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={localFilters.busca ?? ''}
            onChange={(event) => updateFilter('busca', event.target.value)}
            placeholder="Buscar por nome do pasto"
          />
        </label>

        <select
          value={localFilters.status ?? 'todos'}
          onChange={(event) => updateFilter('status', event.target.value as PastoStatusFilter)}
          aria-label="Filtrar por status"
        >
          <option value="todos">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>

        <select
          value={localFilters.tipoPastagem ?? 'todos'}
          onChange={(event) => updateFilter('tipoPastagem', event.target.value as PastoTipoFilter)}
          aria-label="Filtrar por tipo de pastagem"
        >
          <option value="todos">Todos os tipos</option>
          {tiposPastagem.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <div className="pasture-filter-buttons">
          <button type="submit" className="primary-action">
            <Filter size={16} aria-hidden="true" />
            Filtrar
          </button>
          <button type="button" className="secondary-action" onClick={handleClear}>
            <X size={16} aria-hidden="true" />
            Limpar
          </button>
        </div>
      </div>
    </form>
  )
}
