import { Save } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { buscarAnimaisAtivos } from '../services/vendaService'
import { type AnimalParaVenda, type VendaRequest } from '../types/venda.types'

type VendaFormProps = {
  isSaving: boolean
  onSubmit: (data: VendaRequest) => Promise<void>
  onCancel: () => void
}

type FormErrors = Partial<Record<keyof VendaRequest, string>>

const initialForm: VendaRequest = {
  animalId: 0,
  nomeComprador: '',
  valorVenda: 0,
  dataVenda: '',
  pesoKgVenda: 0,
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

function getAnimalOptionLabel(animal: AnimalParaVenda) {
  const pasto = animal.pasto?.nome ?? 'Sem pasto'
  return `Animal ${animal.codigoAnimal} - ${animal.raca} - ${numberFormatter.format(animal.pesoKg)}kg - ${pasto}`
}

export function VendaForm({ isSaving, onSubmit, onCancel }: VendaFormProps) {
  const [formData, setFormData] = useState<VendaRequest>(initialForm)
  const [animais, setAnimais] = useState<AnimalParaVenda[]>([])
  const [isLoadingAnimais, setIsLoadingAnimais] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function loadAnimais() {
      try {
        setIsLoadingAnimais(true)
        setLoadError(null)
        const data = await buscarAnimaisAtivos()
        setAnimais(data)
      } catch {
        setLoadError('Nao foi possivel carregar os animais ativos.')
      } finally {
        setIsLoadingAnimais(false)
      }
    }

    loadAnimais()
  }, [])

  const selectedAnimal = useMemo(
    () => animais.find((animal) => animal.id === formData.animalId) ?? null,
    [animais, formData.animalId],
  )

  function updateField<K extends keyof VendaRequest>(field: K, value: VendaRequest[K]) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleAnimalChange(animalId: number) {
    const animal = animais.find((item) => item.id === animalId)

    setFormData((current) => ({
      ...current,
      animalId,
      pesoKgVenda: animal?.pesoKg ?? current.pesoKgVenda,
    }))
  }

  function validate() {
    const nextErrors: FormErrors = {}

    if (!formData.animalId) {
      nextErrors.animalId = 'Selecione um animal ativo.'
    }

    if (!formData.nomeComprador.trim()) {
      nextErrors.nomeComprador = 'Informe o comprador.'
    }

    if (formData.valorVenda <= 0) {
      nextErrors.valorVenda = 'Informe um valor maior que zero.'
    }

    if (!formData.dataVenda) {
      nextErrors.dataVenda = 'Informe a data da venda.'
    }

    if (formData.pesoKgVenda <= 0) {
      nextErrors.pesoKgVenda = 'Informe um peso maior que zero.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onSubmit({
      ...formData,
      nomeComprador: formData.nomeComprador.trim(),
    })
  }

  return (
    <form className="venda-form" onSubmit={handleSubmit}>
      <section className="venda-form-section">
        <h2>Dados da venda</h2>
        <div className="venda-form-grid">
          <label className="venda-form-wide">
            Animal
            <select
              value={formData.animalId || ''}
              onChange={(event) => handleAnimalChange(Number(event.target.value))}
              disabled={isLoadingAnimais || isSaving}
              autoFocus
            >
              <option value="">
                {isLoadingAnimais ? 'Carregando animais ativos...' : 'Selecione um animal ativo'}
              </option>
              {animais.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {getAnimalOptionLabel(animal)}
                </option>
              ))}
            </select>
            {errors.animalId && <small>{errors.animalId}</small>}
            {loadError && <small>{loadError}</small>}
          </label>

          <label>
            Comprador
            <input
              value={formData.nomeComprador}
              onChange={(event) => updateField('nomeComprador', event.target.value)}
              placeholder="Pedro Almeida"
              disabled={isSaving}
            />
            {errors.nomeComprador && <small>{errors.nomeComprador}</small>}
          </label>

          <label>
            Valor da Venda
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.valorVenda || ''}
              onChange={(event) => updateField('valorVenda', Number(event.target.value))}
              placeholder="5200.00"
              disabled={isSaving}
            />
            {errors.valorVenda && <small>{errors.valorVenda}</small>}
          </label>

          <label>
            Data da Venda
            <input
              type="date"
              value={formData.dataVenda}
              onChange={(event) => updateField('dataVenda', event.target.value)}
              disabled={isSaving}
            />
            {errors.dataVenda && <small>{errors.dataVenda}</small>}
          </label>

          <label>
            Peso na Venda (kg)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.pesoKgVenda || ''}
              onChange={(event) => updateField('pesoKgVenda', Number(event.target.value))}
              placeholder="480.00"
              disabled={isSaving}
            />
            {errors.pesoKgVenda && <small>{errors.pesoKgVenda}</small>}
          </label>
        </div>
      </section>

      {selectedAnimal && (
        <section className="venda-animal-summary">
          <span>Animal selecionado</span>
          <div>
            <strong>Animal {selectedAnimal.codigoAnimal}</strong>
            <p>
              {selectedAnimal.raca} - {numberFormatter.format(selectedAnimal.pesoKg)} kg -{' '}
              {selectedAnimal.pasto?.nome ?? 'Sem pasto'}
            </p>
          </div>
        </section>
      )}

      {!isLoadingAnimais && !loadError && animais.length === 0 && (
        <div className="vendas-empty compact">Nenhum animal ativo disponivel para venda.</div>
      )}

      <div className="venda-form-actions">
        <button type="button" className="secondary-action" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </button>
        <button type="submit" className="primary-action" disabled={isSaving || isLoadingAnimais || animais.length === 0}>
          <Save size={16} aria-hidden="true" />
          {isSaving ? 'Salvando...' : 'Registrar Venda'}
        </button>
      </div>
    </form>
  )
}
