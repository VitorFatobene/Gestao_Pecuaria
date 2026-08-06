import { Edit3, Eye, PowerOff, Scale } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type Animal } from '../types/animal.types'

type AnimalCardProps = {
  animal: Animal
  onDeactivate: (animal: Animal) => void
  isDeactivating: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

const placeholderImage =
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80'

function getStatusClass(status: Animal['status']) {
  if (status === 'ATIVO') {
    return 'is-active'
  }

  if (status === 'VENDIDO') {
    return 'is-sold'
  }

  return 'is-inactive'
}

export function AnimalCard({ animal, onDeactivate, isDeactivating }: AnimalCardProps) {
  const navigate = useNavigate()
  const imageUrl = animal.imagemUrl?.trim() || placeholderImage
  const isInactive = animal.status === 'INATIVO'

  return (
    <article className="animal-card">
      <div className="animal-card-image">
        <img src={imageUrl} alt={`Animal ${animal.codigoAnimal}`} loading="lazy" />
        <span className={`animal-status ${getStatusClass(animal.status)}`}>{animal.status}</span>
      </div>

      <div className="animal-card-body">
        <div className="animal-card-title">
          <div>
            <span>Codigo do Animal</span>
            <h2>{animal.codigoAnimal}</h2>
          </div>
          <Scale size={22} aria-hidden="true" />
        </div>

        <dl className="animal-card-facts">
          <div>
            <dt>Raca</dt>
            <dd>{animal.raca}</dd>
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
            <dt>Status</dt>
            <dd>{animal.status}</dd>
          </div>
        </dl>
      </div>

      <div className="animal-card-actions">
        <button type="button" className="secondary-action" onClick={() => navigate(`/animais/${animal.id}`)}>
          <Eye size={16} aria-hidden="true" />
          Ver Detalhes
        </button>
        <button type="button" className="secondary-action" onClick={() => navigate(`/animais/${animal.id}/editar`)}>
          <Edit3 size={16} aria-hidden="true" />
          Editar
        </button>
        <button
          type="button"
          className="danger-action"
          disabled={isDeactivating || isInactive}
          onClick={() => onDeactivate(animal)}
        >
          <PowerOff size={16} aria-hidden="true" />
          Desativar
        </button>
      </div>
    </article>
  )
}

