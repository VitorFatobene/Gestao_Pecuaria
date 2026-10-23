import { Save } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { FieldLabel, FieldRequirementLegend } from '../../../components/FieldRequirementBadge'
import { FormFeedback, type FormFeedbackType } from '../../../components/FormFeedback'
import { buscarPastosDropdown } from '../services/animalService'
import {
  type Animal,
  type AnimalRequest,
  type PastoDropdown,
  type SexoAnimal,
  type TipoPagamentoCompraAnimal,
} from '../types/animal.types'

type AnimalFormProps = {
  animal?: Animal | null
  isSaving: boolean
  feedback?: string | null
  feedbackType?: FormFeedbackType
  feedbackTitle?: string
  onSubmit: (data: AnimalRequest) => Promise<void>
  onCancel: () => void
}

type FormErrors = Partial<Record<keyof AnimalRequest, string>>

const initialForm: AnimalRequest = {
  codigoAnimal: '',
  raca: '',
  sexo: 'MACHO',
  pesoKg: null,
  valorPago: 0,
  valorFrete: 0,
  nomeVendedor: '',
  dataCompra: '',
  imagemUrl: '',
  pastoId: 0,
  tipoPagamentoCompra: 'A_VISTA',
  dataVencimentoCompra: '',
  quantidadeParcelasCompra: 2,
  primeiroVencimentoCompra: '',
  intervaloDiasCompra: 30,
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
    tipoPagamentoCompra: 'A_VISTA',
    dataVencimentoCompra: '',
    quantidadeParcelasCompra: 2,
    primeiroVencimentoCompra: '',
    intervaloDiasCompra: 30,
  }
}

export function AnimalForm({ animal, isSaving, feedback, feedbackType = 'error', feedbackTitle = 'Erro ao salvar animal', onSubmit, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState<AnimalRequest>(() => getInitialForm(animal))
  const [pastos, setPastos] = useState<PastoDropdown[]>([])
  const [isLoadingPastos, setIsLoadingPastos] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      return
    }

    window.requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>('.animal-form label:has(small) input, .animal-form label:has(small) select')
      field?.focus()
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [errors])

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
      nextErrors.codigoAnimal = 'Informe um brinco numerico.'
    }

    if (!formData.raca.trim()) {
      nextErrors.raca = 'Informe a raca.'
    }

    if (formData.pesoKg !== null && formData.pesoKg <= 0) {
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

    if (!animal && formData.tipoPagamentoCompra === 'PRAZO' && !formData.dataVencimentoCompra) {
      nextErrors.dataVencimentoCompra = 'Informe o vencimento da compra.'
    }

    if (!animal && formData.tipoPagamentoCompra === 'PARCELADO') {
      if (!formData.quantidadeParcelasCompra || formData.quantidadeParcelasCompra < 2) {
        nextErrors.quantidadeParcelasCompra = 'Informe pelo menos 2 parcelas.'
      }

      if (!formData.primeiroVencimentoCompra) {
        nextErrors.primeiroVencimentoCompra = 'Informe o primeiro vencimento.'
      }

      if (!formData.intervaloDiasCompra || formData.intervaloDiasCompra <= 0) {
        nextErrors.intervaloDiasCompra = 'Informe um intervalo maior que zero.'
      }
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
      tipoPagamentoCompra: formData.tipoPagamentoCompra ?? 'A_VISTA',
    })
  }

  return (
    <form className="animal-form" onSubmit={handleSubmit}>
      <FieldRequirementLegend />
      <section className="animal-form-section">
        <h2>Dados do animal</h2>
        <div className="animal-form-grid">
          <label>
            <FieldLabel requirement="required">Brinco</FieldLabel>
            <input
              value={formData.codigoAnimal}
              onChange={(event) => updateField('codigoAnimal', event.target.value)}
              placeholder="Digite o numero do brinco"
              inputMode="numeric"
              autoFocus
            />
            {errors.codigoAnimal && <small>{errors.codigoAnimal}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Raca</FieldLabel>
            <input
              value={formData.raca}
              onChange={(event) => updateField('raca', event.target.value)}
              placeholder="Nelore"
            />
            {errors.raca && <small>{errors.raca}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Sexo</FieldLabel>
            <select
              value={formData.sexo}
              onChange={(event) => updateField('sexo', event.target.value as SexoAnimal)}
            >
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Femea</option>
            </select>
          </label>

          <label>
            <FieldLabel requirement="optional">Peso em kg</FieldLabel>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.pesoKg ?? ''}
              onChange={(event) => updateField('pesoKg', event.target.value === '' ? null : Number(event.target.value))}
              placeholder="450.00"
            />
            {errors.pesoKg && <small>{errors.pesoKg}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Pasto</FieldLabel>
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
            <FieldLabel requirement="required">Data da Compra</FieldLabel>
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
            <FieldLabel requirement="optional">Valor Pago</FieldLabel>
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
            <FieldLabel requirement="optional">Valor Frete</FieldLabel>
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
            <FieldLabel requirement="required">Nome do Vendedor</FieldLabel>
            <input
              value={formData.nomeVendedor ?? ''}
              onChange={(event) => updateField('nomeVendedor', event.target.value)}
              placeholder="Fazenda Santa Maria"
            />
            {errors.nomeVendedor && <small>{errors.nomeVendedor}</small>}
          </label>

          <label>
            <FieldLabel requirement="optional">URL da Imagem</FieldLabel>
            <input
              value={formData.imagemUrl ?? ''}
              onChange={(event) => updateField('imagemUrl', event.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </label>
        </div>
      </section>

      {!animal && (
        <section className="animal-form-section animal-payment-section">
          <h2>Pagamento da compra</h2>
          <div className="animal-form-grid">
            <label>
              <FieldLabel requirement="required">Tipo de pagamento</FieldLabel>
              <select
                value={formData.tipoPagamentoCompra ?? 'A_VISTA'}
                onChange={(event) => updateField('tipoPagamentoCompra', event.target.value as TipoPagamentoCompraAnimal)}
              >
                <option value="A_VISTA">A vista</option>
                <option value="PRAZO">Prazo</option>
                <option value="PARCELADO">Parcelado</option>
              </select>
            </label>

            {formData.tipoPagamentoCompra === 'PRAZO' && (
              <label>
                <FieldLabel requirement="required">Data de vencimento</FieldLabel>
                <input
                  type="date"
                  value={formData.dataVencimentoCompra ?? ''}
                  min={formData.dataCompra || undefined}
                  onChange={(event) => updateField('dataVencimentoCompra', event.target.value)}
                />
                {errors.dataVencimentoCompra && <small>{errors.dataVencimentoCompra}</small>}
              </label>
            )}

            {formData.tipoPagamentoCompra === 'PARCELADO' && (
              <>
                <label>
                  <FieldLabel requirement="required">Quantidade de parcelas</FieldLabel>
                  <input
                    type="number"
                    min="2"
                    step="1"
                    value={formData.quantidadeParcelasCompra || ''}
                    onChange={(event) => updateField('quantidadeParcelasCompra', Number(event.target.value))}
                  />
                  {errors.quantidadeParcelasCompra && <small>{errors.quantidadeParcelasCompra}</small>}
                </label>

                <label>
                  <FieldLabel requirement="required">Primeiro vencimento</FieldLabel>
                  <input
                    type="date"
                    value={formData.primeiroVencimentoCompra ?? ''}
                    min={formData.dataCompra || undefined}
                    onChange={(event) => updateField('primeiroVencimentoCompra', event.target.value)}
                  />
                  {errors.primeiroVencimentoCompra && <small>{errors.primeiroVencimentoCompra}</small>}
                </label>

                <label>
                  <FieldLabel requirement="required">Intervalo entre parcelas</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.intervaloDiasCompra || ''}
                    onChange={(event) => updateField('intervaloDiasCompra', Number(event.target.value))}
                    placeholder="30"
                  />
                  {errors.intervaloDiasCompra && <small>{errors.intervaloDiasCompra}</small>}
                </label>
              </>
            )}
          </div>
        </section>
      )}

      {feedback && <FormFeedback type={feedbackType} title={feedbackTitle} message={feedback} />}
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
