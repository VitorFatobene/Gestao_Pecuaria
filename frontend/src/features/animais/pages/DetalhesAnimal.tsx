import { ArrowLeft, Edit3, Repeat2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimalLocationCard } from '../components/AnimalLocationCard'
import { ChangePastureModal } from '../components/ChangePastureModal'
import { alterarPastoAnimal, buscarAnimalPorId } from '../services/animalService'
import { type Animal } from '../types/animal.types'

const placeholderImage =
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80'

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function DetalhesAnimal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const animalId = id ? Number(id) : null
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPasture, setIsChangingPasture] = useState(false)
  const [isChangePastureOpen, setIsChangePastureOpen] = useState(false)
  const [locationRefreshKey, setLocationRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnimal() {
      if (!animalId) {
        setError('Animal invalido.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await buscarAnimalPorId(animalId)
        setAnimal(data)
      } catch {
        setError('Nao foi possivel carregar os detalhes do animal.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimal()
  }, [animalId])

  async function handleChangePasture(pastoId: number) {
    if (!animal) {
      return
    }

    try {
      setIsChangingPasture(true)
      setError(null)
      setFeedback(null)
      const updatedAnimal = await alterarPastoAnimal(animal.id, pastoId)
      setAnimal(updatedAnimal)
      setLocationRefreshKey((current) => current + 1)
      setIsChangePastureOpen(false)
      setFeedback('Pasto alterado com sucesso.')
    } catch {
      setError('Nao foi possivel alterar o pasto do animal.')
    } finally {
      setIsChangingPasture(false)
    }
  }

  if (isLoading) {
    return <div className="animais-loading">Carregando animal...</div>
  }

  if (error || !animal) {
    return (
      <div className="animal-details-page">
        <div className="animais-error" role="alert">
          {error ?? 'Animal nao encontrado.'}
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="animal-details-page">
      <section className="animal-details-hero">
        <img src={animal.imagemUrl?.trim() || placeholderImage} alt={`Animal ${animal.codigoAnimal}`} />
        <div className="animal-details-summary">
          <span>Perfil do animal</span>
          <h1>Animal {animal.codigoAnimal}</h1>
          <p>
            {animal.raca} · {numberFormatter.format(animal.pesoKg)} kg · {animal.status}
          </p>
          <div className="animal-details-actions">
            <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
              <ArrowLeft size={17} aria-hidden="true" />
              Voltar
            </button>
            <button type="button" className="primary-action" onClick={() => navigate(`/animais/${animal.id}/editar`)}>
              <Edit3 size={17} aria-hidden="true" />
              Editar
            </button>
          </div>
        </div>
      </section>

      <section className="animal-details-grid">
        <DetailItem label="Raca" value={animal.raca} />
        <DetailItem label="Sexo" value={animal.sexo ?? '-'} />
        <DetailItem label="Peso atual" value={`${numberFormatter.format(animal.pesoKg)} kg`} />
        <DetailItem label="Peso em arrobas" value={animal.pesoArroba ? numberFormatter.format(animal.pesoArroba) : '-'} />
        <DetailItem label="Valor pago" value={currencyFormatter.format(animal.valorPago)} />
        <DetailItem label="Valor frete" value={currencyFormatter.format(animal.valorFrete ?? 0)} />
        <DetailItem label="Vendedor" value={animal.nomeVendedor ?? '-'} />
        <DetailItem label="Data compra" value={dateFormatter.format(new Date(`${animal.dataCompra}T00:00:00Z`))} />
        <DetailItem label="Lote atual" value={animal.lote?.nome ?? 'Disponivel'} />
      </section>

      {feedback && <div className="animais-feedback">{feedback}</div>}
      {error && (
        <div className="animais-error" role="alert">
          {error}
        </div>
      )}

      <div className="animal-location-section">
        <AnimalLocationCard animalId={animal.id} refreshKey={locationRefreshKey} />
        <button
          type="button"
          className="secondary-action"
          onClick={() => setIsChangePastureOpen(true)}
          disabled={animal.status !== 'ATIVO'}
        >
          <Repeat2 size={16} aria-hidden="true" />
          Alterar Pasto
        </button>
      </div>

      <section className="animal-tabs-card">
        <div className="animal-tabs" aria-label="Modulos futuros">
          <button type="button" disabled>Sanidade/Vacinas</button>
          <button type="button" disabled>Pesagens</button>
          <button type="button" disabled>Reproducao</button>
          <button type="button" disabled>Movimentacoes de Pasto</button>
        </div>
        <p>Historicos operacionais poderao ser vinculados ao perfil deste animal em futuras expansoes.</p>
      </section>

      {isChangePastureOpen && (
        <ChangePastureModal
          animal={animal}
          isSaving={isChangingPasture}
          onClose={() => setIsChangePastureOpen(false)}
          onConfirm={handleChangePasture}
        />
      )}
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <article className="animal-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
