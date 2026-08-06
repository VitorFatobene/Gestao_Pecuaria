import { Search, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { buscarPastosDropdown } from '../services/animalService'
import { type AnimalFilterParams, type PastoDropdown } from '../types/animal.types'

type AnimalFiltersProps = {
  filters: AnimalFilterParams
  onFilter: (filters: AnimalFilterParams) => void
  onClear: () => void
}

export function AnimalFilters({ filters, onFilter, onClear }: AnimalFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AnimalFilterParams>(filters)
  const [pastos, setPastos] = useState<PastoDropdown[]>([])
  const [isLoadingPastos, setIsLoadingPastos] = useState(false)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

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
    <form className="animais-filters" onSubmit={handleSubmit}>
      <div className="animais-filter-fields">
        <label className="animais-search">
          <Search size={17} aria-hidden="true" />
          <input
            value={localFilters.codigo ?? ''}
            onChange={(event) => updateFilter('codigo', event.target.value)}
            placeholder="Buscar por codigo"
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

        <label className="date-filter">
          <span>Inicio</span>
          <input
            type="date"
            value={localFilters.dataInicio ?? ''}
            onChange={(event) => updateFilter('dataInicio', event.target.value || undefined)}
          />
        </label>

        <label className="date-filter">
          <span>Fim</span>
          <input
            type="date"
            value={localFilters.dataFim ?? ''}
            onChange={(event) => updateFilter('dataFim', event.target.value || undefined)}
          />
        </label>
      </div>

      <div className="animais-filter-buttons">
        <button type="submit" className="primary-action">
          Filtrar
        </button>
        <button type="button" className="secondary-action" onClick={handleClear}>
          <X size={16} aria-hidden="true" />
          Limpar Filtros
        </button>
      </div>
    </form>
  )
}
