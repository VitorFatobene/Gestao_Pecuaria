import { History, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { listarAnimais } from '../../animais/services/animalService'
import { type Animal } from '../../animais/types/animal.types'
import { getPastos } from '../../pastos/services/pastosService'
import { type Pasto } from '../../pastos/types/pastos.types'
import { MovimentacaoFilters } from '../components/MovimentacaoFilters'
import { MovimentacoesHero } from '../components/MovimentacoesHero'
import { MovimentacoesTable } from '../components/MovimentacoesTable'
import { listarMovimentacoes } from '../services/movimentacoesService'
import { type MovimentacaoAnimal, type MovimentacaoFilters as MovimentacaoFiltersType } from '../types/movimentacoes.types'

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAnimal[]>([])
  const [animais, setAnimais] = useState<Animal[]>([])
  const [pastos, setPastos] = useState<Pasto[]>([])
  const [filters, setFilters] = useState<MovimentacaoFiltersType>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const loadOptions = useCallback(async () => {
    try {
      const [animaisData, pastosData] = await Promise.all([listarAnimais(), getPastos()])
      setAnimais(animaisData)
      setPastos(pastosData)
    } catch {
      setError('Não foi possível carregar as opções de filtro.')
    }
  }, [])

  const loadMovimentacoes = useCallback(async (nextFilters: MovimentacaoFiltersType = {}, showSuccess = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await listarMovimentacoes(nextFilters)
      setMovimentacoes(data)

      if (showSuccess) {
        setFeedback('Movimentações atualizadas com sucesso.')
      }
    } catch {
      setError('Não foi possível carregar o histórico de movimentações.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOptions()
      void loadMovimentacoes()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadMovimentacoes, loadOptions])

  async function handleFilter(nextFilters: MovimentacaoFiltersType) {
    setFeedback(null)
    setFilters(nextFilters)
    await loadMovimentacoes(nextFilters)
  }

  async function handleClearFilters() {
    setFeedback(null)
    setFilters({})
    await loadMovimentacoes({})
  }

  async function handleRefresh() {
    await loadOptions()
    await loadMovimentacoes(filters, true)
  }

  return (
    <div className="movimentacoes-page">
      <MovimentacoesHero />

      <MovimentacaoFilters
        filters={filters}
        animais={animais}
        pastos={pastos}
        isLoading={isLoading}
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />

      <div className="movimentacoes-list-header">
        <div>
          <span>{numberFormatter.format(movimentacoes.length)}</span>
          <p>{movimentacoes.length === 1 ? 'registro encontrado' : 'registros encontrados'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw size={16} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {feedback && <div className="movimentacoes-feedback">{feedback}</div>}
      {error && (
        <div className="movimentacoes-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <MovimentacoesSkeleton />
      ) : movimentacoes.length === 0 ? (
        <section className="movimentacoes-empty">
          <History size={28} aria-hidden="true" />
          <h2>Nenhuma movimentação encontrada.</h2>
          <p>Movimente animais entre pastos ou ajuste os filtros aplicados.</p>
        </section>
      ) : (
        <MovimentacoesTable movimentacoes={movimentacoes} />
      )}
    </div>
  )
}

function MovimentacoesSkeleton() {
  return (
    <section className="movimentacoes-table-card" aria-label="Carregando movimentações">
      <div className="movimentacoes-table-skeleton">
        {Array.from({ length: 7 }).map((_, index) => (
          <i className="skeleton-line skeleton-row" key={index} />
        ))}
      </div>
    </section>
  )
}
