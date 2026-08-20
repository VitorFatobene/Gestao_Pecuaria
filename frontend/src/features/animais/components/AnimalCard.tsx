import { AlertCircle, Beef, CalendarDays, CheckCircle2, Clock3, Eye, MapPin, Repeat2, Scale, Sprout } from 'lucide-react'
import { type Animal } from '../types/animal.types'

type AnimalCardProps = {
  animal: Animal
  isSelected?: boolean
  selectionDisabledReason?: string | null
  onViewDetails: (animal: Animal) => void
  onChangePasture: (animal: Animal) => void
  onToggleSelection?: (animal: Animal) => void
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

export function AnimalCard({
  animal,
  isSelected = false,
  selectionDisabledReason,
  onViewDetails,
  onChangePasture,
  onToggleSelection,
}: AnimalCardProps) {
  const canSelect = !selectionDisabledReason
  const hasOpenLote = animal.lote?.status === 'ABERTO'

  return (
    <article className={`animal-card ${isSelected ? 'is-selected' : ''}`}>
      <div className="animal-card-image">
        {animal.imagemUrl?.trim() ? (
          <img src={animal.imagemUrl} alt={`Animal ${animal.codigoAnimal}`} loading="lazy" />
        ) : (
          <div className="animal-image-placeholder">
            <Beef size={36} aria-hidden="true" />
          </div>
        )}
        <span className={`animal-status ${getStatusClass(animal.status)}`}>{formatStatus(animal.status)}</span>
        <label className="animal-selection-checkbox" title={selectionDisabledReason ?? 'Selecionar animal'}>
          <input
            type="checkbox"
            checked={isSelected}
            disabled={!canSelect}
            onChange={() => onToggleSelection?.(animal)}
            aria-label={`Selecionar animal ${animal.codigoAnimal}`}
          />
          <span aria-hidden="true">
            <CheckCircle2 size={17} />
          </span>
        </label>
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
          <div>
            <dt>Lote atual</dt>
            <dd>{animal.lote?.nome ?? 'Disponivel'}</dd>
          </div>
        </dl>

        <section className="animal-card-location" aria-label="Localizacao atual">
          <div>
            <Sprout size={17} aria-hidden="true" />
            <span>{animal.pastoAtual?.nome ?? 'Sem pasto definido'}</span>
          </div>
          <div>
            <Clock3 size={17} aria-hidden="true" />
            <span>{animal.diasNoPasto == null ? 'Tempo nao informado' : formatDiasNoPasto(animal.diasNoPasto)}</span>
          </div>
        </section>

        {hasOpenLote && (
          <div className="animal-selection-warning" role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            Animal ja pertence a um lote.
          </div>
        )}
      </div>

      {isSelected && (
        <div className="animal-selected-indicator">
          <CheckCircle2 size={15} aria-hidden="true" />
          Selecionado
        </div>
      )}

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

function formatDiasNoPasto(dias: number) {
  return dias === 1 ? 'Ha 1 dia' : `Ha ${dias} dias`
}
