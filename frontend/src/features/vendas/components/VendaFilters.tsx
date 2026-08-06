import { Search, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { type FiltroVenda } from '../types/venda.types'

type VendaFiltersProps = {
  filters: FiltroVenda
  isLoading: boolean
  onFilter: (filters: Required<FiltroVenda>) => void
  onClear: () => void
}

export function VendaFilters({ filters, isLoading, onFilter, onClear }: VendaFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FiltroVenda>(filters)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  function updateField<K extends keyof FiltroVenda>(field: K, value: FiltroVenda[K]) {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!localFilters.inicio || !localFilters.fim) {
      setError('Informe a data inicial e a data final.')
      return
    }

    setError(null)
    onFilter({ inicio: localFilters.inicio, fim: localFilters.fim })
  }

  function handleClear() {
    setError(null)
    setLocalFilters({})
    onClear()
  }

  return (
    <form className="vendas-filters" onSubmit={handleSubmit}>
      <div className="vendas-filter-fields">
        <label className="date-filter">
          <span>Data Inicial</span>
          <input
            id="data-inicio"
            type="date"
            value={localFilters.inicio ?? ''}
            onChange={(event) => updateField('inicio', event.target.value || undefined)}
          />
        </label>

        <label className="date-filter">
          <span>Data Final</span>
          <input
            id="data-fim"
            type="date"
            value={localFilters.fim ?? ''}
            onChange={(event) => updateField('fim', event.target.value || undefined)}
          />
        </label>
      </div>

      <div className="vendas-filter-buttons">
        <button type="submit" className="primary-action" disabled={isLoading}>
          <Search size={16} aria-hidden="true" />
          Filtrar
        </button>
        <button type="button" className="secondary-action" onClick={handleClear} disabled={isLoading}>
          <X size={16} aria-hidden="true" />
          Limpar Filtros
        </button>
      </div>

      {error && <small className="vendas-filter-error">{error}</small>}
    </form>
  )
}
