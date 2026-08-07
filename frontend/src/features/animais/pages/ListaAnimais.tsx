import { Plus, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { AnimalCard } from '../components/AnimalCard'
import { AnimalFilters } from '../components/AnimalFilters'
import { AnimalTable } from '../components/AnimalTable'
import { ViewModeSelector } from '../components/ViewModeSelector'
import {
  buscarPorDataCompra,
  deletarAnimal,
  listarAnimais,
  listarAnimaisPorPasto,
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
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [animalToDeactivate, setAnimalToDeactivate] = useState<Animal | null>(null)
  const [deactivatingAnimalId, setDeactivatingAnimalId] = useState<number | null>(null)

  const filteredAnimais = useMemo(() => {
    const normalizedCodigo = filters.codigo?.trim().toLowerCase()

    return animais.filter((animal) => {
      const matchesCodigo = !normalizedCodigo || animal.codigoAnimal.toLowerCase().includes(normalizedCodigo)
      const matchesStatus = !filters.status || animal.status === filters.status
      const matchesPasto = !filters.pastoId || animal.pasto?.id === filters.pastoId

      return matchesCodigo && matchesStatus && matchesPasto
    })
  }, [animais, filters])

  const loadAnimais = useCallback(async (nextFilters: AnimalFilterParams = {}, showSuccessPopup = false) => {
    try {
      setIsLoading(true)
      setError(null)

      let data: Animal[]

      if (nextFilters.pastoId) {
        data = await listarAnimaisPorPasto(nextFilters.pastoId)
      } else if (nextFilters.dataInicio && nextFilters.dataFim) {
        data = await buscarPorDataCompra(nextFilters.dataInicio, nextFilters.dataFim)
      } else {
        data = await listarAnimais()
      }

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
    await loadAnimais(nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    await loadAnimais({})
  }

  async function handleRefresh() {
    await loadAnimais(filters, true)
  }

  async function handleDeactivateAnimal() {
    if (!animalToDeactivate) {
      return
    }

    try {
      setDeactivatingAnimalId(animalToDeactivate.id)
      setError(null)
      await deletarAnimal(animalToDeactivate.id)
      setAnimalToDeactivate(null)
      setFeedback('Animal removido com sucesso.')
      await loadAnimais(filters)
    } catch {
      setError('Nao foi possivel desativar o animal.')
    } finally {
      setDeactivatingAnimalId(null)
    }
  }

  return (
    <div className="animais-page">
      <section className="animais-page-header">
        <div>
          <span>Rebanho</span>
          <h1>Gestao de Animais</h1>
          <p>Controle cadastro, compra, localizacao e status dos animais da fazenda.</p>
        </div>
        <button type="button" className="primary-action" onClick={() => navigate('/animais/novo')}>
          <Plus size={18} aria-hidden="true" />
          Cadastrar Animal
        </button>
      </section>

      <section className="animais-toolbar">
        <AnimalFilters filters={filters} onFilter={handleFilter} onClear={handleClearFilters} />
        <div className="animais-toolbar-actions">
          <ViewModeSelector value={viewMode} onChange={setViewMode} />
          <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw size={16} aria-hidden="true" />
            Atualizar
          </button>
        </div>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="animais-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="animais-loading">Carregando animais...</div>
      ) : filteredAnimais.length === 0 ? (
        <section className="animais-empty">
          <h2>Nenhum animal cadastrado.</h2>
          <p>Cadastre um novo animal ou ajuste os filtros aplicados.</p>
        </section>
      ) : viewMode === 'cards' ? (
        <section className="animais-grid" aria-label="Lista de animais em cards">
          {filteredAnimais.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onDeactivate={setAnimalToDeactivate}
              isDeactivating={deactivatingAnimalId === animal.id}
            />
          ))}
        </section>
      ) : (
        <AnimalTable
          animais={filteredAnimais}
          onDeactivate={setAnimalToDeactivate}
          deactivatingAnimalId={deactivatingAnimalId}
        />
      )}

      {animalToDeactivate && (
        <div className="modal-backdrop" role="presentation">
          <section className="animal-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="animal-confirm-title">
            <h2 id="animal-confirm-title">Desativar Animal</h2>
            <p>
              Confirma a desativacao do animal <strong>{animalToDeactivate.codigoAnimal}</strong>? O registro sera
              mantido no sistema.
            </p>
            <div className="animal-confirm-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => setAnimalToDeactivate(null)}
                disabled={deactivatingAnimalId === animalToDeactivate.id}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-action"
                onClick={handleDeactivateAnimal}
                disabled={deactivatingAnimalId === animalToDeactivate.id}
              >
                {deactivatingAnimalId === animalToDeactivate.id ? 'Desativando...' : 'Desativar Animal'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
