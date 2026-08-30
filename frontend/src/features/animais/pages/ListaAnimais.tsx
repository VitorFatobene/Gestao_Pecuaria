import { RefreshCcw } from 'lucide-react'
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
  listarAnimais,
} from '../services/animalService'
import {
  type Animal,
  type AnimalFilterParams,
  type AnimalViewMode,
} from '../types/animal.types'

export function ListaAnimais() {
  const navigate = useNavigate()
  const [animais, setAnimais] = useState<Animal[]>([])
  const [filters, setFilters] = useState<AnimalFilterParams>({})
  const [viewMode, setViewMode] = useState<AnimalViewMode>('cards')
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

  const filteredAnimais = useMemo(() => {
    const normalizedSearch = normalizeText(filters.busca)
    const normalizedRace = normalizeText(filters.raca)

    return animais.filter((animal) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeText(animal.codigoAnimal).includes(normalizedSearch) ||
        normalizeText(animal.raca).includes(normalizedSearch)
      const matchesStatus = !filters.status || animal.status === filters.status
      const matchesPasto = !filters.pastoId || animal.pasto?.id === filters.pastoId
      const matchesRace = !normalizedRace || normalizeText(animal.raca) === normalizedRace

      return matchesSearch && matchesStatus && matchesPasto && matchesRace
    })
  }, [animais, filters])

  const racas = useMemo(() => {
    const uniqueRacas = new Set(animais.map((animal) => animal.raca).filter(Boolean))
    return Array.from(uniqueRacas).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [animais])

  const selectedAnimais = useMemo(
    () => animais.filter((animal) => selectedAnimalIds.has(animal.id)),
    [animais, selectedAnimalIds],
  )

  const loadAnimais = useCallback(async (showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listarAnimais()
      setAnimais(data)
      setSelectedAnimalIds((current) => filterAvailableSelectedAnimalIds(current, data))
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Não foi possível carregar os animais.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAnimais()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadAnimais])

  async function handleFilter(nextFilters: AnimalFilterParams) {
    setFeedback(null)
    setFilters(nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
  }

  async function handleRefresh() {
    await loadAnimais(true)
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
      await loadAnimais()
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
      setAnimais((current) => current.map((animal) => (animal.id === updatedAnimal.id ? updatedAnimal : animal)))
      setSelectedAnimal((current) => (current?.id === updatedAnimal.id ? updatedAnimal : current))
      setAnimalToChangePasture(null)
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
      <AnimalHero onCreateAnimal={() => navigate('/animais/novo')} onCreateLote={handleCreateLoteAction} />

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
          <span>{filteredAnimais.length}</span>
          <p>{filteredAnimais.length === 1 ? 'animal encontrado' : 'animais encontrados'}</p>
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
      ) : filteredAnimais.length === 0 ? (
        <section className="animais-empty">
          <h2>Nenhum animal encontrado.</h2>
          <p>Cadastre um novo animal ou ajuste os filtros aplicados.</p>
        </section>
      ) : viewMode === 'cards' ? (
        <section className="animais-grid" aria-label="Lista de animais em cards">
          {filteredAnimais.map((animal) => (
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
          animais={filteredAnimais}
          selectedAnimalIds={selectedAnimalIds}
          getSelectionDisabledReason={getSelectionDisabledReason}
          onViewDetails={setSelectedAnimal}
          onChangePasture={setAnimalToChangePasture}
          onToggleSelection={handleToggleAnimalSelection}
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

function normalizeText(value?: string | number | null) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
