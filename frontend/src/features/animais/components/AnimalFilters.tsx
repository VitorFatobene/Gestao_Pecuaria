import { Filter, Grid2X2, List, Search, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { buscarPastosDropdown } from '../services/animalService'
import { type AnimalFilterParams, type AnimalViewMode, type PastoDropdown } from '../types/animal.types'

type AnimalFiltersProps = {
  filters: AnimalFilterParams
  racas: string[]
  viewMode: AnimalViewMode
  onFilter: (filters: AnimalFilterParams) => void
  onClear: () => void
  onViewModeChange: (mode: AnimalViewMode) => void
}

export function AnimalFilters({
  filters,
  racas,
  viewMode,
  onFilter,
  onClear,
  onViewModeChange,
}: AnimalFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AnimalFilterParams>(filters)
  const [pastos, setPastos] = useState<PastoDropdown[]>([])
  const [isLoadingPastos, setIsLoadingPastos] = useState(false)

  useEffect(() => {
    async function loadPastos() {
      try {
        setIsLoadingPastos(true)
        const data = await buscarPastosDropdown()
        setPastos(data)
      } catch {
        setPastos([])
      } finally {
        setIsLoadingPastos(false)
      }
    }

    loadPastos()
  }, [])

  function updateFilter<K extends keyof AnimalFilterParams>(field: K, value: AnimalFilterParams[K]) {
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
    <form className="animais-filters-card" onSubmit={handleSubmit}>
      <div className="animais-filters-heading">
        <div>
          <span>Filtros</span>
          <h2>Consulta do rebanho</h2>
        </div>
        <div className="animal-view-toggle" aria-label="Alternar visualização">
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

      <div className="animais-filter-fields">
        <label className="animais-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={localFilters.busca ?? ''}
            onChange={(event) => updateFilter('busca', event.target.value)}
            placeholder="Buscar por código ou raça"
          />
        </label>

        <select
          value={localFilters.pastoId ?? ''}
          onChange={(event) =>
            updateFilter('pastoId', event.target.value ? Number(event.target.value) : undefined)
          }
          aria-label="Filtrar por pasto"
          disabled={isLoadingPastos}
        >
          <option value="">{isLoadingPastos ? 'Carregando pastos...' : 'Todos os pastos'}</option>
          {pastos.map((pasto) => (
            <option key={pasto.id} value={pasto.id}>
              {pasto.nome}
            </option>
          ))}
        </select>

        <select
          value={localFilters.status ?? ''}
          onChange={(event) => updateFilter('status', event.target.value || undefined)}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
          <option value="VENDIDO">Vendido</option>
        </select>

        <select
          value={localFilters.raca ?? ''}
          onChange={(event) => updateFilter('raca', event.target.value || undefined)}
          aria-label="Filtrar por raça"
        >
          <option value="">Todas as raças</option>
          {racas.map((raca) => (
            <option key={raca} value={raca}>
              {raca}
            </option>
          ))}
        </select>

        <div className="animais-filter-buttons">
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
