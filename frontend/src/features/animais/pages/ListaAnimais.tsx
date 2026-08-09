import { RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { AnimalCard } from '../components/AnimalCard'
import { AnimalDetailsDrawer } from '../components/AnimalDetailsDrawer'
import { AnimalFilters } from '../components/AnimalFilters'
import { AnimalHero } from '../components/AnimalHero'
import { AnimalTable } from '../components/AnimalTable'
import { ChangePastureModal } from '../components/ChangePastureModal'
import {
  alterarPastoAnimal,
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
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [animalToChangePasture, setAnimalToChangePasture] = useState<Animal | null>(null)

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

  const loadAnimais = useCallback(async (showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listarAnimais()
      setAnimais(data)
      if (showSuccessPopup) {
        setFeedback('Dados atualizados com sucesso.')
      }
    } catch {
      setError('Nao foi possivel carregar os animais.')
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
      setError('Nao foi possivel alterar o pasto do animal.')
    } finally {
      setIsChangingPasture(false)
    }
  }

  return (
    <div className="animais-page">
      <AnimalHero onCreateAnimal={() => navigate('/animais/novo')} />

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
              onViewDetails={setSelectedAnimal}
              onChangePasture={setAnimalToChangePasture}
            />
          ))}
        </section>
      ) : (
        <AnimalTable
          animais={filteredAnimais}
          onViewDetails={setSelectedAnimal}
          onChangePasture={setAnimalToChangePasture}
        />
      )}

      {selectedAnimal && (
        <AnimalDetailsDrawer
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onOpenFullDetails={(animal) => navigate(`/animais/${animal.id}`)}
          onChangePasture={(animal) => setAnimalToChangePasture(animal)}
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
    </div>
  )
}

function normalizeText(value?: string | number | null) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
