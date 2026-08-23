import { ArrowRight, CalendarDays, CircleDollarSign, MapPin, Repeat2, Save, Scale, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { buscarPesagensAnimal, registrarPesagemAnimal } from '../services/animalService'
import { type Animal, type PesagemAnimal } from '../types/animal.types'

type AnimalDetailsDrawerProps = {
  animal: Animal
  onClose: () => void
  onOpenFullDetails: (animal: Animal) => void
  onChangePasture: (animal: Animal) => void
  onAnimalUpdated: (animalId: number) => Promise<void>
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
  onAnimalUpdated,
}: AnimalDetailsDrawerProps) {
  const [pesagens, setPesagens] = useState<PesagemAnimal[]>([])
  const [isLoadingPesagens, setIsLoadingPesagens] = useState(true)
  const [isWeighingFormOpen, setIsWeighingFormOpen] = useState(false)
  const [isSavingWeighing, setIsSavingWeighing] = useState(false)
  const [pesoKg, setPesoKg] = useState('')
  const [dataPesagem, setDataPesagem] = useState(getTodayDateInput)
  const [observacao, setObservacao] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    async function loadPesagens() {
      try {
        setIsLoadingPesagens(true)
        setFormError(null)
        const historico = await buscarPesagensAnimal(animal.id)
        setPesagens(historico)
      } catch {
        setFormError('Nao foi possivel carregar o historico de pesagens.')
      } finally {
        setIsLoadingPesagens(false)
      }
    }

    void loadPesagens()
  }, [animal.id])

  async function handleSubmitWeighing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedPeso = Number(pesoKg)

    if (!Number.isFinite(parsedPeso) || parsedPeso <= 0) {
      setFormError('Informe um peso maior que zero.')
      return
    }

    if (!dataPesagem) {
      setFormError('Informe a data da pesagem.')
      return
    }

    try {
      setIsSavingWeighing(true)
      setFormError(null)
      await registrarPesagemAnimal(animal.id, {
        pesoKg: parsedPeso,
        dataPesagem,
        observacao: observacao.trim() || undefined,
      })
      const historico = await buscarPesagensAnimal(animal.id)
      setPesagens(historico)
      setPesoKg('')
      setObservacao('')
      setIsWeighingFormOpen(false)
      await onAnimalUpdated(animal.id)
    } catch {
      setFormError('Nao foi possivel registrar a pesagem.')
    } finally {
      setIsSavingWeighing(false)
    }
  }

  const modal = (
    <div className="animal-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="animal-details-modal"
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

        <div className="animal-details-modal-grid">
          <div className="animal-details-modal-left">
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
              <span>{formatSexo(animal.sexo)} · {formatWeight(animal.pesoKg)}</span>
            </div>

            <div className="animal-drawer-info animal-primary-info">
              <DrawerInfo label="Codigo" value={animal.codigoAnimal} />
              <DrawerInfo label="Status" value={formatStatus(animal.status)} />
              <DrawerInfo label="Sexo" value={formatSexo(animal.sexo)} />
              <DrawerInfo label="Peso em arrobas" value={animal.pesoArroba ? numberFormatter.format(animal.pesoArroba) : '-'} />
            </div>
          </div>

          <div className="animal-details-modal-right">
            <section className="animal-current-weight">
              <div>
                <span>Peso atual</span>
                <strong>{formatWeight(animal.pesoKg)}</strong>
              </div>
              <button type="button" className="primary-action" onClick={() => setIsWeighingFormOpen(true)}>
                <Scale size={16} aria-hidden="true" />
                Nova pesagem
              </button>
            </section>

            {isWeighingFormOpen && (
              <form className="animal-weighing-form" onSubmit={handleSubmitWeighing}>
                <div className="animal-weighing-current">
                  <span>Peso atual:</span>
                  <strong>{formatWeight(animal.pesoKg)}</strong>
                </div>
                <label>
                  Novo peso
                  <div className="animal-input-with-suffix">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pesoKg}
                      onChange={(event) => setPesoKg(event.target.value)}
                      required
                    />
                    <span>kg</span>
                  </div>
                </label>
                <label>
                  Data da pesagem
                  <input
                    type="date"
                    value={dataPesagem}
                    max={getTodayDateInput()}
                    onChange={(event) => setDataPesagem(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Observacao
                  <textarea
                    value={observacao}
                    onChange={(event) => setObservacao(event.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                </label>
                <div className="animal-weighing-actions">
                  <button type="button" className="secondary-action" onClick={() => setIsWeighingFormOpen(false)} disabled={isSavingWeighing}>
                    Cancelar
                  </button>
                  <button type="submit" className="primary-action" disabled={isSavingWeighing}>
                    <Save size={16} aria-hidden="true" />
                    {isSavingWeighing ? 'Salvando...' : 'Salvar pesagem'}
                  </button>
                </div>
              </form>
            )}

            <div className="animal-drawer-info">
              <DrawerInfo label="Pasto atual" value={animal.pasto?.nome ?? 'Sem pasto'} />
              <DrawerInfo label="Lote atual" value={animal.lote?.nome ?? 'Disponivel'} />
              <DrawerInfo label="Raca" value={animal.raca} />
              <DrawerInfo label="Sexo" value={formatSexo(animal.sexo)} />
            </div>

            <div className="animal-drawer-finance">
              <DrawerMetric
                icon={CalendarDays}
                label="Data de compra"
                value={dateFormatter.format(new Date(`${animal.dataCompra}T00:00:00Z`))}
              />
              <DrawerMetric icon={CircleDollarSign} label="Valor de compra" value={currencyFormatter.format(animal.valorPago)} />
              <DrawerMetric icon={MapPin} label="Vendedor/origem" value={animal.nomeVendedor ?? 'Nao informada'} />
            </div>
          </div>
        </div>

        <section className="animal-details-history-grid">
          <article className="animal-history-card">
            <div className="animal-history-header">
              <h3>Localizacao atual</h3>
            </div>
            <DrawerInfo label="Pasto" value={animal.pastoAtual?.nome ?? animal.pasto?.nome ?? 'Sem pasto'} />
            <DrawerInfo label="Dias no pasto" value={animal.diasNoPasto == null ? '-' : String(animal.diasNoPasto)} />
          </article>

          <article className="animal-history-card">
            <div className="animal-history-header">
              <h3>Historico de pastos</h3>
            </div>
            <p className="animal-history-muted">Abra os detalhes completos para consultar a linha do tempo de movimentacoes.</p>
          </article>

          <article className="animal-history-card animal-weighing-history-card">
            <div className="animal-history-header">
              <h3>Historico de pesagens</h3>
            </div>
            {formError && <p className="animal-form-error" role="alert">{formError}</p>}
            {isLoadingPesagens ? (
              <p className="animal-history-muted">Carregando pesagens...</p>
            ) : pesagens.length === 0 ? (
              <p className="animal-history-muted">Nenhuma pesagem registrada.</p>
            ) : (
              <div className="animal-weighing-history">
                {pesagens.map((pesagem) => (
                  <div className="animal-weighing-row" key={pesagem.id}>
                    <div>
                      <strong>{dateFormatter.format(new Date(`${pesagem.dataPesagem}T00:00:00Z`))}</strong>
                      {pesagem.observacao && <span>{pesagem.observacao}</span>}
                    </div>
                    <b>{formatWeight(pesagem.pesoKg)}</b>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <div className="animal-drawer-actions">
          <button type="button" className="secondary-action" onClick={() => onOpenFullDetails(animal)}>
            Ver detalhes completos
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => {
              onChangePasture(animal)
              onClose()
            }}
            disabled={animal.status !== 'ATIVO'}
          >
            <Repeat2 size={16} aria-hidden="true" />
            Alterar pasto
          </button>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
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

function formatWeight(value: number) {
  return `${numberFormatter.format(value)} kg`
}

function getTodayDateInput() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
