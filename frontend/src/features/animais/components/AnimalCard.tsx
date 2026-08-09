import { Beef, CalendarDays, Eye, MapPin, Repeat2, Scale } from 'lucide-react'
import { type Animal } from '../types/animal.types'

type AnimalCardProps = {
  animal: Animal
  onViewDetails: (animal: Animal) => void
  onChangePasture: (animal: Animal) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

function getStatusClass(status: Animal['status']) {
  if (status === 'ATIVO') {
    return 'is-active'
  }

  if (status === 'VENDIDO') {
    return 'is-sold'
  }

  return 'is-inactive'
}

export function AnimalCard({ animal, onViewDetails, onChangePasture }: AnimalCardProps) {
  return (
    <article className="animal-card">
      <div className="animal-card-image">
        {animal.imagemUrl?.trim() ? (
          <img src={animal.imagemUrl} alt={`Animal ${animal.codigoAnimal}`} loading="lazy" />
        ) : (
          <div className="animal-image-placeholder">
            <Beef size={36} aria-hidden="true" />
          </div>
        )}
        <span className={`animal-status ${getStatusClass(animal.status)}`}>{formatStatus(animal.status)}</span>
      </div>

      <div className="animal-card-body">
        <div className="animal-card-title">
          <div>
            <span>Codigo</span>
            <h2>{animal.codigoAnimal}</h2>
            <p>Nome nao cadastrado</p>
          </div>
          <div className="animal-card-icon">
            <Scale size={20} aria-hidden="true" />
          </div>
        </div>

        <dl className="animal-card-facts">
          <div>
            <dt>Raca</dt>
            <dd>{animal.raca}</dd>
          </div>
          <div>
            <dt>Sexo</dt>
            <dd>{formatSexo(animal.sexo)}</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>Nao informada</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{numberFormatter.format(animal.pesoKg)} kg</dd>
          </div>
          <div>
            <dt>Pasto</dt>
            <dd>{animal.pasto?.nome ?? 'Sem pasto'}</dd>
          </div>
          <div>
            <dt>Compra</dt>
            <dd>{formatDate(animal.dataCompra)}</dd>
          </div>
        </dl>
      </div>

      <div className="animal-card-actions">
        <button type="button" className="secondary-action" onClick={() => onViewDetails(animal)}>
          <Eye size={16} aria-hidden="true" />
          Ver detalhes
        </button>
        <button
          type="button"
          className="secondary-action"
          disabled={animal.status !== 'ATIVO'}
          onClick={() => onChangePasture(animal)}
        >
          <Repeat2 size={16} aria-hidden="true" />
          Alterar pasto
        </button>
      </div>

      <div className="animal-card-footer">
        <span>
          <MapPin size={14} aria-hidden="true" />
          {animal.pasto?.nome ?? 'Sem pasto vinculado'}
        </span>
        <span>
          <CalendarDays size={14} aria-hidden="true" />
          {formatDate(animal.dataCompra)}
        </span>
      </div>
    </article>
  )
}

function formatStatus(status: Animal['status']) {
  const labels: Record<Animal['status'], string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    VENDIDO: 'Vendido',
  }

  return labels[status]
}

function formatSexo(sexo: Animal['sexo']) {
  if (sexo === 'MACHO') {
    return 'Macho'
  }

  if (sexo === 'FEMEA') {
    return 'Femea'
  }

  return 'Nao informado'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
