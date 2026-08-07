import { Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { buscarPastosDropdown } from '../services/animalService'
import {
  type Animal,
  type AnimalRequest,
  type PastoDropdown,
  type SexoAnimal,
} from '../types/animal.types'

type AnimalFormProps = {
  animal?: Animal | null
  isSaving: boolean
  onSubmit: (data: AnimalRequest) => Promise<void>
  onCancel: () => void
}

type FormErrors = Partial<Record<keyof AnimalRequest, string>>

const initialForm: AnimalRequest = {
  codigoAnimal: '',
  raca: '',
  sexo: 'MACHO',
  pesoKg: 0,
  valorPago: 0,
  valorFrete: 0,
  nomeVendedor: '',
  dataCompra: '',
  imagemUrl: '',
  pastoId: 0,
}

function getInitialForm(animal?: Animal | null): AnimalRequest {
  if (!animal) {
    return initialForm
  }

  return {
    codigoAnimal: animal.codigoAnimal,
    raca: animal.raca,
    sexo: animal.sexo ?? 'MACHO',
    pesoKg: animal.pesoKg,
    valorPago: animal.valorPago,
    valorFrete: animal.valorFrete ?? 0,
    nomeVendedor: animal.nomeVendedor ?? '',
    dataCompra: animal.dataCompra,
    imagemUrl: animal.imagemUrl ?? '',
    pastoId: animal.pasto?.id ?? 0,
  }
}

export function AnimalForm({ animal, isSaving, onSubmit, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState<AnimalRequest>(() => getInitialForm(animal))
  const [pastos, setPastos] = useState<PastoDropdown[]>([])
  const [isLoadingPastos, setIsLoadingPastos] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function loadPastos() {
      try {
        setIsLoadingPastos(true)
        const data = await buscarPastosDropdown()
        setPastos(data)
      } catch {
        setPastos([])
      } finally {
        setIsLoadingPastos(false)
      }
    }

    loadPastos()
  }, [])

  function updateField<K extends keyof AnimalRequest>(field: K, value: AnimalRequest[K]) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function validate() {
    const nextErrors: FormErrors = {}

    if (!formData.codigoAnimal.trim() || !Number.isFinite(Number(formData.codigoAnimal))) {
      nextErrors.codigoAnimal = 'Informe um codigo numerico.'
    }

    if (!formData.raca.trim()) {
      nextErrors.raca = 'Informe a raca.'
    }

    if (formData.pesoKg <= 0) {
      nextErrors.pesoKg = 'Informe um peso maior que zero.'
    }

    if (formData.valorPago < 0) {
      nextErrors.valorPago = 'Informe um valor pago valido.'
    }

    if ((formData.valorFrete ?? 0) < 0) {
      nextErrors.valorFrete = 'Informe um frete valido.'
    }

    if (!formData.nomeVendedor?.trim()) {
      nextErrors.nomeVendedor = 'Informe o vendedor.'
    }

    if (!formData.dataCompra) {
      nextErrors.dataCompra = 'Informe a data de compra.'
    }

    if (!formData.pastoId) {
      nextErrors.pastoId = 'Selecione um pasto.'
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
      codigoAnimal: formData.codigoAnimal.trim(),
      raca: formData.raca.trim(),
      nomeVendedor: formData.nomeVendedor?.trim(),
      imagemUrl: formData.imagemUrl?.trim() || undefined,
      valorFrete: formData.valorFrete ?? 0,
    })
  }

  return (
    <form className="animal-form" onSubmit={handleSubmit}>
      <section className="animal-form-section">
        <h2>Dados do animal</h2>
        <div className="animal-form-grid">
          <label>
            Codigo do Animal
            <input
              value={formData.codigoAnimal}
              onChange={(event) => updateField('codigoAnimal', event.target.value)}
              placeholder="101"
              inputMode="numeric"
              autoFocus
            />
            {errors.codigoAnimal && <small>{errors.codigoAnimal}</small>}
          </label>

          <label>
            Raca
            <input
              value={formData.raca}
              onChange={(event) => updateField('raca', event.target.value)}
              placeholder="Nelore"
            />
            {errors.raca && <small>{errors.raca}</small>}
          </label>

          <label>
            Sexo
            <select
              value={formData.sexo}
              onChange={(event) => updateField('sexo', event.target.value as SexoAnimal)}
            >
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Femea</option>
            </select>
          </label>

          <label>
            Peso em kg
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.pesoKg || ''}
              onChange={(event) => updateField('pesoKg', Number(event.target.value))}
              placeholder="450.00"
            />
            {errors.pesoKg && <small>{errors.pesoKg}</small>}
          </label>

          <label>
            Pasto
            <select
              value={formData.pastoId || ''}
              onChange={(event) => updateField('pastoId', Number(event.target.value))}
              disabled={isLoadingPastos}
            >
              <option value="">{isLoadingPastos ? 'Carregando pastos...' : 'Selecione um pasto'}</option>
              {pastos.map((pasto) => (
                <option key={pasto.id} value={pasto.id}>
                  {pasto.nome}
                </option>
              ))}
            </select>
            {errors.pastoId && <small>{errors.pastoId}</small>}
          </label>

          <label>
            Data da Compra
            <input
              type="date"
              value={formData.dataCompra}
              onChange={(event) => updateField('dataCompra', event.target.value)}
            />
            {errors.dataCompra && <small>{errors.dataCompra}</small>}
          </label>
        </div>
      </section>

      <section className="animal-form-section">
        <h2>Dados financeiros</h2>
        <div className="animal-form-grid">
          <label>
            Valor Pago
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.valorPago || ''}
              onChange={(event) => updateField('valorPago', Number(event.target.value))}
              placeholder="3200.00"
            />
            {errors.valorPago && <small>{errors.valorPago}</small>}
          </label>

          <label>
            Valor Frete
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.valorFrete ?? ''}
              onChange={(event) => updateField('valorFrete', Number(event.target.value))}
              placeholder="150.00"
            />
            {errors.valorFrete && <small>{errors.valorFrete}</small>}
          </label>

          <label>
            Nome do Vendedor
            <input
              value={formData.nomeVendedor ?? ''}
              onChange={(event) => updateField('nomeVendedor', event.target.value)}
              placeholder="Fazenda Santa Maria"
            />
            {errors.nomeVendedor && <small>{errors.nomeVendedor}</small>}
          </label>

          <label>
            URL da Imagem
            <input
              value={formData.imagemUrl ?? ''}
              onChange={(event) => updateField('imagemUrl', event.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </label>
        </div>
      </section>

      <div className="animal-form-actions">
        <button type="button" className="secondary-action" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </button>
        <button type="submit" className="primary-action" disabled={isSaving}>
          <Save size={16} aria-hidden="true" />
          {isSaving ? 'Salvando...' : 'Salvar Animal'}
        </button>
      </div>
    </form>
  )
}
