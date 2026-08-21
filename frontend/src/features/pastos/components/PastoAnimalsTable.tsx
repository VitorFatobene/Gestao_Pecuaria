import { AlertCircle, Beef, Clock3, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAnimaisAtuaisDoPasto } from '../services/pastosService'
import { type AnimalNoPasto } from '../types/pastos.types'

type PastoAnimalsTableProps = {
  pastoId: number
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function PastoAnimalsTable({ pastoId }: PastoAnimalsTableProps) {
  const [animais, setAnimais] = useState<AnimalNoPasto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAnimais() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAnimaisAtuaisDoPasto(pastoId)

        if (isMounted) {
          setAnimais(data)
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar os animais atuais do pasto.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadAnimais()

    return () => {
      isMounted = false
    }
  }, [pastoId])

  return (
    <section className="pasto-animals-table-card">
      <div className="pasto-animals-table-header">
        <div>
          <span>Presença no pasto</span>
          <h3>Animais atuais</h3>
        </div>
        <strong>
          <Beef size={15} aria-hidden="true" />
          {numberFormatter.format(animais.length)}
        </strong>
      </div>

      {isLoading ? (
        <TableState icon={Clock3} message="Carregando animais atuais..." />
      ) : error ? (
        <TableState icon={AlertCircle} message={error} role="alert" />
      ) : animais.length === 0 ? (
        <TableState icon={Beef} message="Este pasto não possui animais atualmente." />
      ) : (
        <div className="table-wrapper">
          <table className="pasto-animals-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Raça</th>
                <th>Peso</th>
                <th>Entrada</th>
                <th>Tempo no pasto</th>
              </tr>
            </thead>
            <tbody>
              {animais.map((animal) => (
                <tr key={animal.animalId}>
                  <td>
                    <strong>{animal.codigoAnimal}</strong>
                  </td>
                  <td>{animal.nome || 'Não cadastrado'}</td>
                  <td>{animal.raca}</td>
                  <td>{numberFormatter.format(animal.pesoKg)} kg</td>
                  <td>{formatDate(animal.dataEntrada)}</td>
                  <td>
                    <span className={`pasto-animals-duration ${getDurationClass(animal.diasNoPasto)}`}>
                      {formatDays(animal.diasNoPasto)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

type TableStateProps = {
  icon: LucideIcon
  message: string
  role?: 'alert'
}

function TableState({ icon: Icon, message, role }: TableStateProps) {
  return (
    <div className="pasto-animals-state" role={role}>
      <Icon size={19} aria-hidden="true" />
      <strong>{message}</strong>
    </div>
  )
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function formatDays(days: number) {
  return days === 1 ? '1 dia' : `${numberFormatter.format(days)} dias`
}

function getDurationClass(days: number) {
  if (days > 45) {
    return 'is-high'
  }

  if (days > 30) {
    return 'is-warning'
  }

  return 'is-good'
}
