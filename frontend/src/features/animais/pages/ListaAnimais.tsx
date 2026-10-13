import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { CreateLoteModal } from '../../lotes/components/CreateLoteModal'
import { SelectedAnimalsBar } from '../../lotes/components/SelectedAnimalsBar'
import { adicionarAnimaisAoLote, criarLote } from '../../lotes/services/loteService'
import { type CreateLoteRequest } from '../../lotes/types/lote.types'
import { AnimalCard } from '../components/AnimalCard'
import { AnimalDetailsDrawer } from '../components/AnimalDetailsDrawer'
import { AnimalFilters } from '../components/AnimalFilters'
import { AnimalHero } from '../components/AnimalHero'
import { AnimalTable } from '../components/AnimalTable'
import { ChangePastureModal } from '../components/ChangePastureModal'
import {
  alterarPastoAnimal,
  buscarAnimalPorId,
  listarAnimaisPaginados,
  listarRacasAnimais,
} from '../services/animalService'
import {
  type Animal,
  type AnimalFilterParams,
  type AnimalViewMode,
} from '../types/animal.types'

const ANIMAIS_PAGE_SIZE = 20

export function ListaAnimais() {
  const navigate = useNavigate()
  const [animais, setAnimais] = useState<Animal[]>([])
  const [racas, setRacas] = useState<string[]>([])
  const [filters, setFilters] = useState<AnimalFilterParams>({})
  const [viewMode, setViewMode] = useState<AnimalViewMode>('table')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPasture, setIsChangingPasture] = useState(false)
  const [isCreatingLote, setIsCreatingLote] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [animalToChangePasture, setAnimalToChangePasture] = useState<Animal | null>(null)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())
  const [isCreateLoteModalOpen, setIsCreateLoteModalOpen] = useState(false)

  const selectedAnimais = useMemo(
    () => animais.filter((animal) => selectedAnimalIds.has(animal.id)),
    [animais, selectedAnimalIds],
  )

  const applyAnimalPage = useCallback((data: Awaited<ReturnType<typeof listarAnimaisPaginados>>) => {
    setAnimais(data.content)
    setCurrentPage(data.page)
    setTotalPages(data.totalPages)
    setTotalElements(data.totalElements)
    setSelectedAnimalIds((current) => filterAvailableSelectedAnimalIds(current, data.content))
  }, [])

  const loadAnimais = useCallback(async (
    nextPage: number,
    nextFilters: AnimalFilterParams,
    showSuccessPopup = false,
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listarAnimaisPaginados({
        ...nextFilters,
        page: nextPage,
        size: ANIMAIS_PAGE_SIZE,
      })

      if (data.totalPages > 0 && data.content.length === 0 && nextPage >= data.totalPages) {
        const fallbackData = await listarAnimaisPaginados({
          ...nextFilters,
          page: data.totalPages - 1,
          size: ANIMAIS_PAGE_SIZE,
        })
        applyAnimalPage(fallbackData)
      } else {
        applyAnimalPage(data)
      }

      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Não foi possível carregar os animais.')
    } finally {
      setIsLoading(false)
    }
  }, [applyAnimalPage])

  const loadRacas = useCallback(async () => {
    try {
      const data = await listarRacasAnimais()
      setRacas(data)
    } catch {
      setRacas([])
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadAnimais(0, {}), loadRacas()])
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadAnimais, loadRacas])

  async function handleFilter(nextFilters: AnimalFilterParams) {
    setFeedback(null)
    setFilters(nextFilters)
    setCurrentPage(0)
    await loadAnimais(0, nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    setCurrentPage(0)
    await loadAnimais(0, {})
  }

  async function handleRefresh() {
    await Promise.all([loadAnimais(currentPage, filters, true), loadRacas()])
  }

  async function handlePageChange(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === currentPage || isLoading) {
      return
    }

    setFeedback(null)
    await loadAnimais(nextPage, filters)
  }

  function handleCreateLoteAction() {
    setIsSelectionMode(true)

    if (selectedAnimais.length === 0) {
      setFeedback('Selecione os animais disponiveis para criar um lote.')
      return
    }

    setIsCreateLoteModalOpen(true)
  }

  function handleToggleAnimalSelection(animal: Animal) {
    const disabledReason = getSelectionDisabledReason(animal)

    if (disabledReason) {
      setFeedback(disabledReason)
      return
    }

    setFeedback(null)
    setIsSelectionMode(true)
    setSelectedAnimalIds((current) => {
      const nextSelectedIds = new Set(current)

      if (nextSelectedIds.has(animal.id)) {
        nextSelectedIds.delete(animal.id)
      } else {
        nextSelectedIds.add(animal.id)
      }

      return nextSelectedIds
    })
  }

  function handleCancelSelection() {
    setSelectedAnimalIds(new Set())
    setIsCreateLoteModalOpen(false)
    setIsSelectionMode(false)
  }

  async function handleCreateLote(data: CreateLoteRequest) {
    try {
      setIsCreatingLote(true)
      setError(null)
      const lote = await criarLote(data)
      await adicionarAnimaisAoLote(lote.id, {
        animalIds: selectedAnimais.map((animal) => animal.id),
      })
      setIsCreateLoteModalOpen(false)
      setSelectedAnimalIds(new Set())
      setIsSelectionMode(false)
      await loadAnimais(currentPage, filters)
      setFeedback('Lote criado com sucesso.')
    } catch {
      setError('Não foi possível criar o lote.')
    } finally {
      setIsCreatingLote(false)
    }
  }

  async function handleChangePasture(pastoId: number) {
    if (!animalToChangePasture) {
      return
    }

    try {
      setIsChangingPasture(true)
      setError(null)
      const updatedAnimal = await alterarPastoAnimal(animalToChangePasture.id, pastoId)
      setSelectedAnimal((current) => (current?.id === updatedAnimal.id ? updatedAnimal : current))
      setAnimalToChangePasture(null)
      await loadAnimais(currentPage, filters)
      setFeedback('Pasto alterado com sucesso.')
    } catch {
      setError('Não foi possível alterar o pasto do animal.')
    } finally {
      setIsChangingPasture(false)
    }
  }

  async function handleAnimalUpdated(animalId: number) {
    try {
      const updatedAnimal = await buscarAnimalPorId(animalId)
      setAnimais((current) => current.map((animal) => (animal.id === updatedAnimal.id ? updatedAnimal : animal)))
      setSelectedAnimal((current) => (current?.id === updatedAnimal.id ? updatedAnimal : current))
      setFeedback('Pesagem registrada com sucesso.')
    } catch {
      setError('Pesagem registrada, mas não foi possível atualizar os dados do animal.')
    }
  }

  return (
    <div className={`animais-page ${isSelectionMode ? 'is-selection-mode' : ''}`}>
      <AnimalHero
        onCreateAnimal={() => navigate('/animais/novo')}
        onRegisterPurchase={() => navigate('/compras/nova')}
        onCreateLote={handleCreateLoteAction}
      />

      <AnimalFilters
        filters={filters}
        racas={racas}
        viewMode={viewMode}
        onFilter={handleFilter}
        onClear={handleClearFilters}
        onViewModeChange={setViewMode}
      />

      <div className="animais-list-header">
        <div>
          <span>{totalElements}</span>
          <p>{totalElements === 1 ? 'animal encontrado' : 'animais encontrados'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="animais-error" role="alert">
          {error}
        </div>
      )}

      <SelectedAnimalsBar
        animais={selectedAnimais}
        onCancel={handleCancelSelection}
        onCreateLote={() => setIsCreateLoteModalOpen(true)}
      />

      {isLoading ? (
        <section className="animais-grid" aria-label="Carregando animais">
          {Array.from({ length: 6 }).map((_, index) => (
            <article className="animal-card animal-card-skeleton" key={index}>
              <div className="animal-card-image" />
              <div className="animal-card-body">
                <i className="skeleton-line skeleton-title" />
                <i className="skeleton-line skeleton-row" />
                <i className="skeleton-line skeleton-row" />
              </div>
            </article>
          ))}
        </section>
      ) : animais.length === 0 ? (
        <section className="animais-empty">
          <h2>Nenhum animal encontrado.</h2>
          <p>Cadastre um novo animal ou ajuste os filtros aplicados.</p>
        </section>
      ) : viewMode === 'cards' ? (
        <section className="animais-grid" aria-label="Lista de animais em cards">
          {animais.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              isSelected={selectedAnimalIds.has(animal.id)}
              selectionDisabledReason={getSelectionDisabledReason(animal)}
              onViewDetails={setSelectedAnimal}
              onChangePasture={setAnimalToChangePasture}
              onToggleSelection={handleToggleAnimalSelection}
            />
          ))}
        </section>
      ) : (
        <AnimalTable
          animais={animais}
          selectedAnimalIds={selectedAnimalIds}
          getSelectionDisabledReason={getSelectionDisabledReason}
          onViewDetails={setSelectedAnimal}
          onChangePasture={setAnimalToChangePasture}
          onToggleSelection={handleToggleAnimalSelection}
        />
      )}

      {!isLoading && totalPages > 1 && (
        <AnimalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={ANIMAIS_PAGE_SIZE}
          isLoading={isLoading}
          onPageChange={handlePageChange}
        />
      )}

      {selectedAnimal && (
        <AnimalDetailsDrawer
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onOpenFullDetails={(animal) => navigate(`/animais/${animal.id}`)}
          onChangePasture={(animal) => setAnimalToChangePasture(animal)}
          onAnimalUpdated={handleAnimalUpdated}
        />
      )}

      {animalToChangePasture && (
        <ChangePastureModal
          animal={animalToChangePasture}
          isSaving={isChangingPasture}
          onClose={() => setAnimalToChangePasture(null)}
          onConfirm={handleChangePasture}
        />
      )}

      {isCreateLoteModalOpen && (
        <CreateLoteModal
          animais={selectedAnimais}
          isSaving={isCreatingLote}
          onClose={() => setIsCreateLoteModalOpen(false)}
          onConfirm={handleCreateLote}
        />
      )}
    </div>
  )
}

type AnimalPaginationProps = {
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
}

function AnimalPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  isLoading,
  onPageChange,
}: AnimalPaginationProps) {
  const firstItem = currentPage * pageSize + 1
  const lastItem = Math.min((currentPage + 1) * pageSize, totalElements)

  return (
    <nav className="animais-pagination" aria-label="Paginação de animais">
      <button
        type="button"
        className="secondary-action"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isLoading || currentPage === 0}
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Anterior
      </button>

      <div className="animais-pagination-status" aria-live="polite">
        <strong>
          Página {currentPage + 1} de {totalPages}
        </strong>
        <span>
          {firstItem}-{lastItem} de {totalElements}
        </span>
      </div>

      <button
        type="button"
        className="secondary-action"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLoading || currentPage >= totalPages - 1}
      >
        Próxima
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

function getSelectionDisabledReason(animal: Animal) {
  if (animal.status === 'VENDIDO') {
    return 'Animal vendido nao pode ser selecionado.'
  }

  if (animal.status !== 'ATIVO') {
    return 'Apenas animais ativos podem ser selecionados.'
  }

  if (animal.lote?.status === 'VENDIDO') {
    return 'Animal pertence a um lote vendido.'
  }

  if (animal.lote) {
    return 'Animal ja pertence a um lote.'
  }

  return null
}

function filterAvailableSelectedAnimalIds(current: Set<number>, animais: Animal[]) {
  const availableIds = new Set(animais.filter((animal) => !getSelectionDisabledReason(animal)).map((animal) => animal.id))
  const nextSelectedIds = new Set(Array.from(current).filter((animalId) => availableIds.has(animalId)))

  return nextSelectedIds.size === current.size ? current : nextSelectedIds
}
