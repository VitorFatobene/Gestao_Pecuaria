import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  type CategoriaContaPagar,
  type ContaPagarFilters as ContaPagarFiltersType,
  type StatusContaPagar,
} from '../types/contaPagar.types'

type ContaPagarFiltersProps = {
  filters: ContaPagarFiltersType
  isLoading: boolean
  onFilter: (filters: ContaPagarFiltersType) => void
  onClear: () => void
}

const statusOptions: Array<{ value: StatusContaPagar; label: string }> = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PARCIALMENTE_PAGA', label: 'Parcialmente paga' },
  { value: 'PAGA', label: 'Paga' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const categoryOptions: Array<{ value: CategoriaContaPagar; label: string }> = [
  { value: 'ANIMAL', label: 'Animal' },
  { value: 'RACAO', label: 'Ração' },
  { value: 'SUPLEMENTOS_PASTO', label: 'Suplementos de pasto' },
]

export function ContaPagarFilters({ filters, isLoading, onFilter, onClear }: ContaPagarFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ContaPagarFiltersType>(filters)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  function updateField<K extends keyof ContaPagarFiltersType>(field: K, value: ContaPagarFiltersType[K]) {
    setLocalFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function submitFilters(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()

    if (localFilters.inicio && localFilters.fim && localFilters.inicio > localFilters.fim) {
      setError('A data inicial não pode ser maior que a data final.')
      return
    }

    setError(null)
    onFilter(normalizeFilters(localFilters))
    setIsSheetOpen(false)
  }

  function handleClear() {
    setError(null)
    setLocalFilters({})
    onClear()
    setIsSheetOpen(false)
  }

  const fields = (
    <>
      <label>
        <span>Status</span>
        <select
          value={localFilters.status ?? ''}
          onChange={(event) => updateField('status', (event.target.value || undefined) as StatusContaPagar | undefined)}
        >
          <option value="">Todos</option>
          {statusOptions.map((status) => (
            <option value={status.value} key={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Categoria</span>
        <select
          value={localFilters.categoria ?? ''}
          onChange={(event) =>
            updateField('categoria', (event.target.value || undefined) as CategoriaContaPagar | undefined)
          }
        >
          <option value="">Todas</option>
          {categoryOptions.map((category) => (
            <option value={category.value} key={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="conta-pagar-search">
        <span>Fornecedor</span>
        <div>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Nome do fornecedor"
            value={localFilters.fornecedor ?? ''}
            onChange={(event) => updateField('fornecedor', event.target.value || undefined)}
          />
        </div>
      </label>

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
    </>
  )

  return (
    <section className="conta-pagar-filters-card">
      <div className="conta-pagar-filters-heading">
        <div>
          <span>Filtros</span>
          <h2>Refine vencimentos e fornecedores</h2>
        </div>
        <button
          type="button"
          className="secondary-action conta-pagar-mobile-filter"
          onClick={() => setIsSheetOpen(true)}
          disabled={isLoading}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtrar
        </button>
      </div>

      <form className="conta-pagar-filter-fields" onSubmit={submitFilters}>
        {fields}

        <div className="conta-pagar-filter-buttons">
          <button type="submit" className="primary-action" disabled={isLoading}>
            <Filter size={16} aria-hidden="true" />
            Filtrar
          </button>
          <button type="button" className="secondary-action" onClick={handleClear} disabled={isLoading}>
            <X size={16} aria-hidden="true" />
            Limpar
          </button>
        </div>

        {error && <small className="conta-pagar-filter-error">{error}</small>}
      </form>

      {isSheetOpen && (
        <ContaPagarFilterSheet
          error={error}
          isLoading={isLoading}
          onClose={() => setIsSheetOpen(false)}
          onClear={handleClear}
          onSubmit={submitFilters}
        >
          {fields}
        </ContaPagarFilterSheet>
      )}
    </section>
  )
}

type ContaPagarFilterSheetProps = {
  children: React.ReactNode
  error: string | null
  isLoading: boolean
  onClose: () => void
  onClear: () => void
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void
}

function ContaPagarFilterSheet({ children, error, isLoading, onClose, onClear, onSubmit }: ContaPagarFilterSheetProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div className="conta-pagar-sheet-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="conta-pagar-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conta-pagar-filter-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-sheet-header">
          <div>
            <span>Filtros</span>
            <h2 id="conta-pagar-filter-title">Filtrar contas</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar filtros">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="conta-pagar-sheet-fields" onSubmit={onSubmit}>
          {children}
          {error && <small className="conta-pagar-filter-error">{error}</small>}

          <div className="conta-pagar-sheet-actions">
            <button type="button" className="secondary-action" onClick={onClear} disabled={isLoading}>
              Limpar
            </button>
            <button type="submit" className="primary-action" disabled={isLoading}>
              Aplicar filtros
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

function normalizeFilters(filters: ContaPagarFiltersType): ContaPagarFiltersType {
  return {
    status: filters.status,
    categoria: filters.categoria,
    fornecedor: filters.fornecedor?.trim() || undefined,
    inicio: filters.inicio,
    fim: filters.fim,
  }
}
