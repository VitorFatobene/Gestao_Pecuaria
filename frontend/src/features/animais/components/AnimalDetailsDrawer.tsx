import { ArrowRight, CalendarDays, CircleDollarSign, MapPin, Repeat2, Scale, X } from 'lucide-react'
import { type Animal } from '../types/animal.types'

type AnimalDetailsDrawerProps = {
  animal: Animal
  onClose: () => void
  onOpenFullDetails: (animal: Animal) => void
  onChangePasture: (animal: Animal) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function AnimalDetailsDrawer({
  animal,
  onClose,
  onOpenFullDetails,
  onChangePasture,
}: AnimalDetailsDrawerProps) {
  return (
    <div className="animal-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="animal-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="animal-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="animal-drawer-header">
          <div>
            <span>Detalhes do animal</span>
            <h2 id="animal-drawer-title">Animal {animal.codigoAnimal}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="animal-drawer-image">
          {animal.imagemUrl?.trim() ? (
            <img src={animal.imagemUrl} alt={`Animal ${animal.codigoAnimal}`} />
          ) : (
            <div className="animal-image-placeholder">
              <Scale size={34} aria-hidden="true" />
            </div>
          )}
          <span className={`animal-status ${getStatusClass(animal.status)}`}>{formatStatus(animal.status)}</span>
        </div>

        <div className="animal-drawer-summary">
          <strong>{animal.raca}</strong>
          <span>{formatSexo(animal.sexo)} · {numberFormatter.format(animal.pesoKg)} kg</span>
        </div>

        <div className="animal-drawer-info">
          <DrawerInfo label="Codigo" value={animal.codigoAnimal} />
          <DrawerInfo label="Nome" value="Nao cadastrado" />
          <DrawerInfo label="Raca" value={animal.raca} />
          <DrawerInfo label="Sexo" value={formatSexo(animal.sexo)} />
          <DrawerInfo label="Peso" value={`${numberFormatter.format(animal.pesoKg)} kg`} />
          <DrawerInfo label="Idade" value="Nao informada" />
          <DrawerInfo label="Pasto atual" value={animal.pasto?.nome ?? 'Sem pasto'} />
          <DrawerInfo label="Status" value={formatStatus(animal.status)} />
        </div>

        <div className="animal-drawer-finance">
          <DrawerMetric
            icon={CalendarDays}
            label="Data de compra"
            value={dateFormatter.format(new Date(`${animal.dataCompra}T00:00:00Z`))}
          />
          <DrawerMetric icon={CircleDollarSign} label="Valor de compra" value={currencyFormatter.format(animal.valorPago)} />
          <DrawerMetric icon={MapPin} label="Origem" value={animal.nomeVendedor ?? 'Nao informada'} />
        </div>

        <div className="animal-drawer-actions">
          <button type="button" className="secondary-action" onClick={() => onOpenFullDetails(animal)}>
            Ver detalhes completos
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => onChangePasture(animal)}
            disabled={animal.status !== 'ATIVO'}
          >
            <Repeat2 size={16} aria-hidden="true" />
            Alterar pasto
          </button>
        </div>
      </aside>
    </div>
  )
}

type DrawerInfoProps = {
  label: string
  value: string
}

function DrawerInfo({ label, value }: DrawerInfoProps) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type DrawerMetricProps = DrawerInfoProps & {
  icon: typeof CalendarDays
}

function DrawerMetric({ icon: Icon, label, value }: DrawerMetricProps) {
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

function getStatusClass(status: Animal['status']) {
  if (status === 'ATIVO') {
    return 'is-active'
  }

  if (status === 'VENDIDO') {
    return 'is-sold'
  }

  return 'is-inactive'
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
