import { AlertCircle, CalendarDays, Clock3, MapPin, Sprout, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buscarLocalizacaoAnimal } from '../services/animalService'
import { type LocalizacaoAnimal } from '../types/animal.types'

type AnimalLocationCardProps = {
  animalId: number
  refreshKey?: number
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function AnimalLocationCard({ animalId, refreshKey = 0 }: AnimalLocationCardProps) {
  const [localizacao, setLocalizacao] = useState<LocalizacaoAnimal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadLocation() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await buscarLocalizacaoAnimal(animalId)

        if (isMounted) {
          setLocalizacao(data)
        }
      } catch {
        if (isMounted) {
          setError('Nao foi possivel carregar a localizacao atual.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLocation()

    return () => {
      isMounted = false
    }
  }, [animalId, refreshKey])

  if (isLoading) {
    return (
      <section className="animal-location-card animal-location-status" aria-live="polite">
        <MapPin size={22} aria-hidden="true" />
        <div>
          <span>Localizacao atual</span>
          <strong>Carregando localizacao...</strong>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="animal-location-card animal-location-status" role="alert">
        <AlertCircle size={22} aria-hidden="true" />
        <div>
          <span>Localizacao atual</span>
          <strong>{error}</strong>
        </div>
      </section>
    )
  }

  if (!localizacao?.pasto) {
    return (
      <section className="animal-location-card animal-location-empty">
        <MapPin size={22} aria-hidden="true" />
        <div>
          <span>Localizacao atual</span>
          <strong>Sem pasto vinculado</strong>
          <p>Este animal ainda nao foi alocado em nenhum pasto.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="animal-location-card">
      <div className="animal-location-heading">
        <MapPin size={22} aria-hidden="true" />
        <div>
          <span>Localizacao atual</span>
          <strong>{localizacao.pasto.nome}</strong>
        </div>
      </div>

      <div className="animal-location-metrics">
        <LocationMetric
          icon={Sprout}
          label="Pasto atual"
          value={localizacao.pasto.nome}
        />
        <LocationMetric
          icon={CalendarDays}
          label="Entrada"
          value={formatDate(localizacao.dataEntrada)}
        />
        <LocationMetric
          icon={Clock3}
          label="Tempo no pasto"
          value={formatPermanencia(localizacao.diasPermanencia)}
        />
      </div>
    </section>
  )
}

type LocationMetricProps = {
  icon: LucideIcon
  label: string
  value: string
}

function LocationMetric({ icon: Icon, label, value }: LocationMetricProps) {
  return (
    <article>
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-'
  }

  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function formatPermanencia(value?: number | null) {
  if (value === null || value === undefined) {
    return '-'
  }

  return value === 1 ? 'Ha 1 dia' : `Ha ${value} dias`
}
