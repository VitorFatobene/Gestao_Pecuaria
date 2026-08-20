import { AlertCircle, Clock3, Sprout, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buscarMovimentacoesAnimal } from '../services/animalService'
import { type MovimentacaoAnimal } from '../types/animal.types'

type AnimalMovementTimelineProps = {
  animalId: number
  refreshKey?: number
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function AnimalMovementTimeline({ animalId, refreshKey = 0 }: AnimalMovementTimelineProps) {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAnimal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMovements() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await buscarMovimentacoesAnimal(animalId)

        if (isMounted) {
          setMovimentacoes(data)
        }
      } catch {
        if (isMounted) {
          setError('Nao foi possivel carregar o historico de movimentacao.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMovements()

    return () => {
      isMounted = false
    }
  }, [animalId, refreshKey])

  return (
    <section className="animal-movement-card">
      <div className="animal-movement-header">
        <div>
          <span>Historico de pastos</span>
          <h2>Movimentacoes do animal</h2>
        </div>
      </div>

      {isLoading ? (
        <TimelineState icon={Clock3} message="Carregando historico de movimentacao..." />
      ) : error ? (
        <TimelineState icon={AlertCircle} message={error} role="alert" />
      ) : movimentacoes.length === 0 ? (
        <TimelineState icon={Sprout} message="Este animal ainda nao possui historico de movimentacao." />
      ) : (
        <ol className="animal-movement-timeline">
          {movimentacoes.map((movimentacao) => (
            <li key={movimentacao.id} className={movimentacao.atual ? 'is-current' : undefined}>
              <div className="animal-movement-marker">
                <Sprout size={18} aria-hidden="true" />
              </div>

              <article className="animal-movement-entry">
                <div className="animal-movement-entry-header">
                  <div>
                    <span>{movimentacao.atual ? 'Atual' : 'Historico'}</span>
                    <h3>Pasto {movimentacao.pasto.nome}</h3>
                  </div>
                  {movimentacao.atual && <strong>Atual</strong>}
                </div>

                <div className="animal-movement-facts">
                  <MovementFact label="Entrada" value={formatDate(movimentacao.dataEntrada)} />
                  <MovementFact label="Saida" value={movimentacao.dataSaida ? formatDate(movimentacao.dataSaida) : 'Atual'} />
                  <MovementFact
                    label={movimentacao.atual ? 'Tempo no pasto' : 'Permaneceu'}
                    value={formatPermanencia(movimentacao.diasPermanencia)}
                  />
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

type TimelineStateProps = {
  icon: LucideIcon
  message: string
  role?: 'alert'
}

function TimelineState({ icon: Icon, message, role }: TimelineStateProps) {
  return (
    <div className="animal-movement-state" role={role}>
      <Icon size={21} aria-hidden="true" />
      <strong>{message}</strong>
    </div>
  )
}

type MovementFactProps = {
  label: string
  value: string
}

function MovementFact({ label, value }: MovementFactProps) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function formatPermanencia(value: number) {
  return value === 1 ? '1 dia' : `${value} dias`
}
