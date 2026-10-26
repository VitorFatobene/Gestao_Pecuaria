import axios from 'axios'
import {
  ArrowLeft,
  CircleDollarSign,
  ClipboardCheck,
  Plus,
  Save,
  Scale,
  Trash2,
} from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormFeedback, type FormFeedbackType } from '../../../components/FormFeedback'
import { FieldLabel, FieldRequirementLegend } from '../../../components/FieldRequirementBadge'
import { type FormaPagamento, type TipoPagamentoContaPagar } from '../../a-pagar/types/contaPagar.types'
import { buscarPastosDropdown } from '../../animais/services/animalService'
import { type PastoDropdown, type SexoAnimal } from '../../animais/types/animal.types'
import { criarCompra } from '../services/compraService'
import { type CompraRequest, type TipoRateioCompra } from '../types/compra.types'
import { WeightDisplay } from '../../../components/WeightDisplay'
import { calcularValorPorArroba } from '../../../utils/peso'

type CompraAnimalFormState = {
  codigoAnimal: string
  pesoKg: string
  sexo: SexoAnimal
  raca: string
  pastoId: string
  valorPago: string
}

type CompraFormState = {
  fornecedor: string
  dataCompra: string
  valorTotal: string
  observacao: string
  tipoRateio: TipoRateioCompra
  tipoPagamento: TipoPagamentoContaPagar
  pagamentoRealizadoNoAto: boolean
  dataPagamento: string
  formaPagamento: FormaPagamento
  dataVencimento: string
  quantidadeParcelas: string
  primeiroVencimento: string
  intervaloDias: string
}

type CompraFormErrors = Partial<Record<keyof CompraFormState, string>>
type CompraAnimalErrors = Partial<Record<keyof CompraAnimalFormState, string>>

type CompraResumo = {
  quantidadeAnimais: number
  pesoTotal: number
  pesoMedio: number
  valorTotal: number
  valorMedioAnimal: number
  custoMedioKg: number
  somaAtribuida: number
  diferenca: number
  custosAtribuidos: number[]
}

const today = new Date().toISOString().slice(0, 10)

const initialCompraForm: CompraFormState = {
  fornecedor: '',
  dataCompra: today,
  valorTotal: '',
  observacao: '',
  tipoRateio: 'IGUAL',
  tipoPagamento: 'A_VISTA',
  pagamentoRealizadoNoAto: false,
  dataPagamento: today,
  formaPagamento: 'PIX',
  dataVencimento: '',
  quantidadeParcelas: '2',
  primeiroVencimento: '',
  intervaloDias: '30',
}

function createAnimalForm(): CompraAnimalFormState {
  return {
    codigoAnimal: '',
    pesoKg: '',
    sexo: 'MACHO',
    raca: '',
    pastoId: '',
    valorPago: '',
  }
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function RegistrarCompraPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CompraFormState>(initialCompraForm)
  const [animais, setAnimais] = useState<CompraAnimalFormState[]>(() => [createAnimalForm()])
  const [pastos, setPastos] = useState<PastoDropdown[]>([])
  const [isLoadingPastos, setIsLoadingPastos] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<CompraFormErrors>({})
  const [animalErrors, setAnimalErrors] = useState<CompraAnimalErrors[]>([])
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<FormFeedbackType>('error')

  useEffect(() => {
    async function loadPastos() {
      try {
        setIsLoadingPastos(true)
        const data = await buscarPastosDropdown()
        setPastos(data.filter((pasto) => pasto.ativo !== false))
      } catch {
        setError('Nao foi possivel carregar os pastos. Tente novamente antes de salvar a compra.')
        setPastos([])
      } finally {
        setIsLoadingPastos(false)
      }
    }

    loadPastos()
  }, [])

  const resumo = useMemo(() => calculateResumo(form, animais), [form, animais])
  const hasManualMismatch = form.tipoRateio === 'MANUAL' && toCents(resumo.diferenca) !== 0

  useEffect(() => {
    if (Object.keys(errors).length === 0 && animalErrors.every((animalError) => Object.keys(animalError).length === 0)) {
      return
    }

    window.requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>('.compra-form label:has(small) input, .compra-form label:has(small) select, .compra-form label:has(small) textarea')
      field?.focus()
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [animalErrors, errors])

  function updateFormField<K extends keyof CompraFormState>(field: K, value: CompraFormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateAnimalField<K extends keyof CompraAnimalFormState>(
    index: number,
    field: K,
    value: CompraAnimalFormState[K],
  ) {
    setAnimais((current) =>
      current.map((animal, animalIndex) =>
        animalIndex === index
          ? {
              ...animal,
              [field]: value,
            }
          : animal,
      ),
    )
  }

  function addAnimal() {
    setAnimais((current) => [...current, createAnimalForm()])
  }

  function removeAnimal(index: number) {
    setAnimais((current) => (current.length === 1 ? current : current.filter((_, animalIndex) => animalIndex !== index)))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFeedback(null)

    const validation = validateCompra(form, animais, resumo)
    setErrors(validation.errors)
    setAnimalErrors(validation.animalErrors)

    if (!validation.isValid) {
      setFeedbackType('error')
      setFeedback('Verifique os campos destacados.')
      return
    }

    try {
      setIsSaving(true)
      const payload = toCompraRequest(form, animais, resumo.custosAtribuidos)
      await criarCompra(payload)
      setFeedbackType('success')
      setFeedback('Compra registrada com sucesso.')
      window.setTimeout(() => navigate('/animais'), 1100)
    } catch (requestError) {
      setFeedbackType('error')
      setFeedback(getFriendlyError(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="compra-page">
      <section className="animais-page-header compra-page-header">
        <div>
          <span>Registrar compra</span>
          <h1>Registrar Compra</h1>
          <p>Cadastre uma compra com um ou varios animais e distribua o custo total no mesmo fluxo.</p>
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar
        </button>
      </section>

      <form className="compra-form" onSubmit={handleSubmit}>
        <FieldRequirementLegend />
        <section className="compra-section compra-main-section">
          <div className="compra-section-heading">
            <CircleDollarSign size={20} aria-hidden="true" />
            <h2>Dados da compra</h2>
          </div>

          <div className="compra-form-grid">
            <label>
              <FieldLabel requirement="required">Fornecedor</FieldLabel>
              <input
                value={form.fornecedor}
                maxLength={200}
                onChange={(event) => updateFormField('fornecedor', event.target.value)}
                placeholder="Fazenda Santa Luzia"
                autoFocus
              />
              {errors.fornecedor && <small>{errors.fornecedor}</small>}
            </label>

            <label>
              <FieldLabel requirement="required">Data</FieldLabel>
              <input
                type="date"
                value={form.dataCompra}
                onChange={(event) => updateFormField('dataCompra', event.target.value)}
              />
              {errors.dataCompra && <small>{errors.dataCompra}</small>}
            </label>

            <label>
              <FieldLabel requirement="required">Valor total</FieldLabel>
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={form.valorTotal}
                onChange={(event) => updateFormField('valorTotal', event.target.value)}
                placeholder="18000.00"
              />
              {errors.valorTotal && <small>{errors.valorTotal}</small>}
            </label>

            <label>
              <FieldLabel requirement="required">Tipo de rateio</FieldLabel>
              <select
                value={form.tipoRateio}
                onChange={(event) => updateFormField('tipoRateio', event.target.value as TipoRateioCompra)}
              >
                <option value="PROPORCIONAL_PESO">Proporcional ao peso</option>
                <option value="IGUAL">Igual</option>
                <option value="MANUAL">Manual</option>
              </select>
            </label>

            <label className="compra-form-wide">
              <FieldLabel requirement="optional">Observacao</FieldLabel>
              <textarea
                value={form.observacao}
                maxLength={1000}
                rows={3}
                onChange={(event) => updateFormField('observacao', event.target.value)}
                placeholder="Detalhes da negociacao, transporte ou origem dos animais"
              />
            </label>
          </div>
        </section>

        <section className="compra-section">
          <div className="compra-section-heading">
            <CircleDollarSign size={20} aria-hidden="true" />
            <h2>Pagamento da compra</h2>
          </div>

          <div className="compra-form-grid">
            <label>
              <FieldLabel requirement="required">Tipo de pagamento</FieldLabel>
              <select
                value={form.tipoPagamento}
                onChange={(event) => {
                  const tipoPagamento = event.target.value as TipoPagamentoContaPagar
                  setForm((current) => ({
                    ...current,
                    tipoPagamento,
                    pagamentoRealizadoNoAto: tipoPagamento === 'A_VISTA' ? current.pagamentoRealizadoNoAto : false,
                  }))
                }}
              >
                <option value="A_VISTA">A vista</option>
                <option value="PRAZO">Prazo</option>
                <option value="PARCELADO">Parcelado</option>
              </select>
            </label>

            {form.tipoPagamento === 'A_VISTA' && (
              <>
                <label className="compra-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.pagamentoRealizadoNoAto}
                    onChange={(event) => updateFormField('pagamentoRealizadoNoAto', event.target.checked)}
                  />
                  <span><FieldLabel requirement="optional">Pagamento realizado no ato</FieldLabel></span>
                </label>

                {form.pagamentoRealizadoNoAto && (
                  <>
                    <label>
                      <FieldLabel requirement="required">Data de pagamento</FieldLabel>
                      <input
                        type="date"
                        value={form.dataPagamento}
                        onChange={(event) => updateFormField('dataPagamento', event.target.value)}
                      />
                      {errors.dataPagamento && <small>{errors.dataPagamento}</small>}
                    </label>

                    <label>
                      <FieldLabel requirement="required">Forma de pagamento</FieldLabel>
                      <select
                        value={form.formaPagamento}
                        onChange={(event) => updateFormField('formaPagamento', event.target.value as FormaPagamento)}
                      >
                        <option value="PIX">PIX</option>
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="BOLETO">Boleto</option>
                        <option value="OUTROS">Outros</option>
                      </select>
                    </label>
                  </>
                )}
              </>
            )}

            {form.tipoPagamento === 'PRAZO' && (
              <label>
                <FieldLabel requirement="required">Data de vencimento</FieldLabel>
                <input
                  type="date"
                  value={form.dataVencimento}
                  min={form.dataCompra || undefined}
                  onChange={(event) => updateFormField('dataVencimento', event.target.value)}
                />
                {errors.dataVencimento && <small>{errors.dataVencimento}</small>}
              </label>
            )}

            {form.tipoPagamento === 'PARCELADO' && (
              <>
                <label>
                  <FieldLabel requirement="required">Quantidade de parcelas</FieldLabel>
                  <input
                    type="number"
                    min="2"
                    max="360"
                    step="1"
                    value={form.quantidadeParcelas}
                    onChange={(event) => updateFormField('quantidadeParcelas', event.target.value)}
                  />
                  {errors.quantidadeParcelas && <small>{errors.quantidadeParcelas}</small>}
                </label>

                <label>
                  <FieldLabel requirement="required">Primeiro vencimento</FieldLabel>
                  <input
                    type="date"
                    value={form.primeiroVencimento}
                    min={form.dataCompra || undefined}
                    onChange={(event) => updateFormField('primeiroVencimento', event.target.value)}
                  />
                  {errors.primeiroVencimento && <small>{errors.primeiroVencimento}</small>}
                </label>

                <label>
                  <FieldLabel requirement="required">Intervalo entre parcelas</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    step="1"
                    value={form.intervaloDias}
                    onChange={(event) => updateFormField('intervaloDias', event.target.value)}
                    placeholder="30"
                  />
                  {errors.intervaloDias && <small>{errors.intervaloDias}</small>}
                </label>
              </>
            )}
          </div>
        </section>

        <section className="compra-section">
          <div className="compra-section-heading compra-section-heading-actions">
            <div>
              <Scale size={20} aria-hidden="true" />
              <h2>Animais da compra</h2>
            </div>
            <button type="button" className="secondary-action compra-add-animal" onClick={addAnimal}>
              <Plus size={16} aria-hidden="true" />
              Adicionar animal
            </button>
          </div>

          <div className="compra-animals-list">
            {animais.map((animal, index) => {
              const valorPorArroba = calcularValorPorArrobaDaCompra(
                form,
                animal,
                resumo.custosAtribuidos[index],
              )

              return (
                <article className="compra-animal-card" key={index}>
                  <div className="compra-animal-card-header">
                    <h3>Animal {index + 1}</h3>
                    <button
                      type="button"
                      className="compra-remove-animal"
                      onClick={() => removeAnimal(index)}
                      disabled={animais.length === 1}
                      aria-label={`Remover animal ${index + 1}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="compra-animal-grid">
                  <label>
                    <FieldLabel requirement="required"><span className="brinco-label">Brinco</span></FieldLabel>
                    <input
                      value={animal.codigoAnimal}
                      inputMode="numeric"
                      onChange={(event) => updateAnimalField(index, 'codigoAnimal', event.target.value)}
                      placeholder="Digite o numero do brinco"
                    />
                    {animalErrors[index]?.codigoAnimal && <small>{animalErrors[index]?.codigoAnimal}</small>}
                  </label>

                  <label>
                    <FieldLabel requirement="required">Peso</FieldLabel>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={animal.pesoKg}
                      onChange={(event) => updateAnimalField(index, 'pesoKg', event.target.value)}
                      placeholder="420.50"
                    />
                    {animalErrors[index]?.pesoKg && <small>{animalErrors[index]?.pesoKg}</small>}
                  </label>

                  <label>
                    <FieldLabel requirement="required">Sexo</FieldLabel>
                    <select
                      value={animal.sexo}
                      onChange={(event) => updateAnimalField(index, 'sexo', event.target.value as SexoAnimal)}
                    >
                      <option value="MACHO">Macho</option>
                      <option value="FEMEA">Femea</option>
                    </select>
                  </label>

                  <label>
                    <FieldLabel requirement="required">Raca</FieldLabel>
                    <input
                      value={animal.raca}
                      maxLength={120}
                      onChange={(event) => updateAnimalField(index, 'raca', event.target.value)}
                      placeholder="Nelore"
                    />
                    {animalErrors[index]?.raca && <small>{animalErrors[index]?.raca}</small>}
                  </label>

                  <label>
                    <FieldLabel requirement="required">Pasto</FieldLabel>
                    <select
                      value={animal.pastoId}
                      onChange={(event) => updateAnimalField(index, 'pastoId', event.target.value)}
                      disabled={isLoadingPastos}
                    >
                      <option value="">{isLoadingPastos ? 'Carregando pastos...' : 'Selecione um pasto'}</option>
                      {pastos.map((pasto) => (
                        <option value={pasto.id} key={pasto.id}>
                          {pasto.nome}
                        </option>
                      ))}
                    </select>
                    {animalErrors[index]?.pastoId && <small>{animalErrors[index]?.pastoId}</small>}
                  </label>

                  <div className="compra-custo-e-arroba">
                    <label>
                      <FieldLabel requirement={form.tipoRateio === 'MANUAL' ? 'required' : 'calculated'}>Custo atribuido</FieldLabel>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={form.tipoRateio === 'MANUAL' ? animal.valorPago : formatInputCurrency(resumo.custosAtribuidos[index])}
                        readOnly={form.tipoRateio !== 'MANUAL'}
                        onChange={(event) => updateAnimalField(index, 'valorPago', event.target.value)}
                        placeholder="0.00"
                      />
                      {form.tipoRateio === 'MANUAL' && animalErrors[index]?.valorPago && (
                        <small>{animalErrors[index]?.valorPago}</small>
                      )}
                    </label>

                    <div className="compra-valor-arroba" aria-live="polite">
                      <FieldLabel requirement="calculated">Valor por @</FieldLabel>
                      <strong>
                        {valorPorArroba.valor === null
                          ? valorPorArroba.indisponivel
                          : `${currencyFormatter.format(valorPorArroba.valor)}/@`}
                      </strong>
                    </div>
                  </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="compra-summary-grid" aria-label="Resumo da compra antes de salvar">
          <article className="compra-summary-panel">
            <div className="compra-section-heading">
              <ClipboardCheck size={20} aria-hidden="true" />
              <h2>Resumo antes de salvar</h2>
            </div>
            <dl className="compra-summary-list">
              <div>
                <dt>Quantidade de animais</dt>
                <dd>{resumo.quantidadeAnimais}</dd>
              </div>
              <div>
                <dt>Peso total</dt>
                <dd><WeightDisplay pesoKg={resumo.pesoTotal} /></dd>
              </div>
              <div>
                <dt>Peso medio</dt>
                <dd><WeightDisplay pesoKg={resumo.pesoMedio} /></dd>
              </div>
              <div>
                <dt>Valor total</dt>
                <dd>{currencyFormatter.format(resumo.valorTotal)}</dd>
              </div>
              <div>
                <dt>Valor medio por animal</dt>
                <dd>{currencyFormatter.format(resumo.valorMedioAnimal)}</dd>
              </div>
              <div>
                <dt>Custo medio por kg</dt>
                <dd>{currencyFormatter.format(resumo.custoMedioKg)}</dd>
              </div>
            </dl>
          </article>

          <article className={`compra-rateio-panel ${hasManualMismatch ? 'has-difference' : ''}`}>
            <h2>Conferencia do rateio</h2>
            <dl className="compra-rateio-list">
              <div>
                <dt>Valor total da compra</dt>
                <dd>{currencyFormatter.format(resumo.valorTotal)}</dd>
              </div>
              <div>
                <dt>Soma dos valores atribuidos</dt>
                <dd>{currencyFormatter.format(resumo.somaAtribuida)}</dd>
              </div>
              <div>
                <dt>Diferenca</dt>
                <dd>{currencyFormatter.format(resumo.diferenca)}</dd>
              </div>
            </dl>
            {errors.tipoRateio && <p className="compra-rateio-error">{errors.tipoRateio}</p>}
          </article>
        </section>

        {feedback && <FormFeedback type={feedbackType} title={feedbackType === 'success' ? 'Compra registrada' : 'Erro ao salvar compra'} message={feedback} />}
        {error && <FormFeedback type="warning" title="Não foi possível carregar os pastos" message={error} />}
        <div className="compra-form-actions">
          <button type="button" className="secondary-action" onClick={() => navigate('/animais')} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" className="primary-action" disabled={isSaving || hasManualMismatch}>
            <Save size={16} aria-hidden="true" />
            {isSaving ? 'Salvando...' : 'Salvar compra'}
          </button>
        </div>
      </form>
    </div>
  )
}

function validateCompra(form: CompraFormState, animais: CompraAnimalFormState[], resumo: CompraResumo) {
  const errors: CompraFormErrors = {}
  const animalErrors: CompraAnimalErrors[] = animais.map(() => ({}))
  const codigoCount = new Map<string, number>()

  if (!form.fornecedor.trim()) {
    errors.fornecedor = 'Informe o fornecedor.'
  }

  if (!form.dataCompra) {
    errors.dataCompra = 'Informe a data da compra.'
  }

  if (!isPositiveNumber(form.valorTotal)) {
    errors.valorTotal = 'Informe um valor total maior que zero.'
  }

  animais.forEach((animal) => {
    const normalizedCode = animal.codigoAnimal.trim()
    if (normalizedCode) {
      codigoCount.set(normalizedCode, (codigoCount.get(normalizedCode) ?? 0) + 1)
    }
  })

  animais.forEach((animal, index) => {
    if (!animal.codigoAnimal.trim() || !Number.isFinite(Number(animal.codigoAnimal))) {
      animalErrors[index].codigoAnimal = 'Informe um brinco numerico.'
    } else if ((codigoCount.get(animal.codigoAnimal.trim()) ?? 0) > 1) {
      animalErrors[index].codigoAnimal = 'Brinco repetido nesta compra.'
    }

    if (!isPositiveNumber(animal.pesoKg)) {
      animalErrors[index].pesoKg = 'Informe um peso maior que zero.'
    }

    if (!animal.raca.trim()) {
      animalErrors[index].raca = 'Informe a raca.'
    }

    if (!animal.pastoId) {
      animalErrors[index].pastoId = 'Selecione um pasto.'
    }

    if (form.tipoRateio === 'MANUAL' && !isNonNegativeNumber(animal.valorPago)) {
      animalErrors[index].valorPago = 'Informe o custo deste animal.'
    }
  })

  if (form.tipoRateio === 'MANUAL' && toCents(resumo.diferenca) !== 0) {
    errors.tipoRateio = 'No rateio manual, a soma atribuida deve fechar exatamente com o valor total.'
  }

  if (form.pagamentoRealizadoNoAto && form.tipoPagamento !== 'A_VISTA') {
    errors.tipoPagamento = 'Pagamento no ato só pode ser usado em compras à vista.'
  }

  if (form.tipoPagamento === 'A_VISTA' && form.pagamentoRealizadoNoAto && !form.dataPagamento) {
    errors.dataPagamento = 'Informe a data de pagamento.'
  }

  if (form.tipoPagamento === 'PRAZO') {
    if (!form.dataVencimento) {
      errors.dataVencimento = 'Informe a data de vencimento.'
    } else if (form.dataCompra && form.dataVencimento < form.dataCompra) {
      errors.dataVencimento = 'O vencimento nao pode ser anterior à compra.'
    }
  }

  if (form.tipoPagamento === 'PARCELADO') {
    const quantidadeParcelas = Number(form.quantidadeParcelas)
    const intervaloDias = Number(form.intervaloDias)

    if (!Number.isInteger(quantidadeParcelas) || quantidadeParcelas < 2) {
      errors.quantidadeParcelas = 'Informe pelo menos 2 parcelas.'
    }
    if (!form.primeiroVencimento) {
      errors.primeiroVencimento = 'Informe o primeiro vencimento.'
    } else if (form.dataCompra && form.primeiroVencimento < form.dataCompra) {
      errors.primeiroVencimento = 'O vencimento nao pode ser anterior à compra.'
    }
    if (!Number.isInteger(intervaloDias) || intervaloDias <= 0) {
      errors.intervaloDias = 'Informe um intervalo maior que zero.'
    }
  }

  return {
    errors,
    animalErrors,
    isValid:
      Object.keys(errors).length === 0 &&
      animalErrors.every((animalError) => Object.keys(animalError).length === 0),
  }
}

function toCompraRequest(
  form: CompraFormState,
  animais: CompraAnimalFormState[],
  custosAtribuidos: number[],
): CompraRequest {
  return {
    fornecedor: form.fornecedor.trim(),
    dataCompra: form.dataCompra,
    valorTotal: toMoneyNumber(form.valorTotal),
    observacao: form.observacao.trim() || undefined,
    tipoRateio: form.tipoRateio,
    tipoPagamento: form.tipoPagamento,
    pagamentoRealizadoNoAto: form.tipoPagamento === 'A_VISTA' ? form.pagamentoRealizadoNoAto : false,
    dataPagamento:
      form.tipoPagamento === 'A_VISTA' && form.pagamentoRealizadoNoAto ? form.dataPagamento : undefined,
    formaPagamento:
      form.tipoPagamento === 'A_VISTA' && form.pagamentoRealizadoNoAto ? form.formaPagamento : undefined,
    dataVencimento: form.tipoPagamento === 'PRAZO' ? form.dataVencimento : undefined,
    quantidadeParcelas: form.tipoPagamento === 'PARCELADO' ? Number(form.quantidadeParcelas) : undefined,
    primeiroVencimento: form.tipoPagamento === 'PARCELADO' ? form.primeiroVencimento : undefined,
    intervaloDias: form.tipoPagamento === 'PARCELADO' ? Number(form.intervaloDias) : undefined,
    animais: animais.map((animal, index) => ({
      codigoAnimal: Number(animal.codigoAnimal),
      raca: animal.raca.trim(),
      sexo: animal.sexo,
      pesoKg: toMoneyNumber(animal.pesoKg),
      pastoId: Number(animal.pastoId),
      valorPago: form.tipoRateio === 'MANUAL' ? toMoneyNumber(animal.valorPago) : custosAtribuidos[index],
    })),
  }
}

function calculateResumo(form: CompraFormState, animais: CompraAnimalFormState[]): CompraResumo {
  const valorTotal = isPositiveNumber(form.valorTotal) ? toMoneyNumber(form.valorTotal) : 0
  const pesoTotal = animais.reduce((total, animal) => total + (isPositiveNumber(animal.pesoKg) ? Number(animal.pesoKg) : 0), 0)
  const custosAtribuidos = calculateCustosAtribuidos(form.tipoRateio, valorTotal, animais, pesoTotal)
  const somaAtribuida = centsToNumber(custosAtribuidos.reduce((total, value) => total + toCents(value), 0))
  const quantidadeAnimais = animais.length

  return {
    quantidadeAnimais,
    pesoTotal,
    pesoMedio: quantidadeAnimais > 0 ? pesoTotal / quantidadeAnimais : 0,
    valorTotal,
    valorMedioAnimal: quantidadeAnimais > 0 ? valorTotal / quantidadeAnimais : 0,
    custoMedioKg: pesoTotal > 0 ? valorTotal / pesoTotal : 0,
    somaAtribuida,
    diferenca: centsToNumber(toCents(valorTotal) - toCents(somaAtribuida)),
    custosAtribuidos,
  }
}

function calculateCustosAtribuidos(
  tipoRateio: TipoRateioCompra,
  valorTotal: number,
  animais: CompraAnimalFormState[],
  pesoTotal: number,
) {
  if (valorTotal <= 0 || animais.length === 0) {
    return animais.map(() => 0)
  }

  if (tipoRateio === 'MANUAL') {
    return animais.map((animal) => (isNonNegativeNumber(animal.valorPago) ? toMoneyNumber(animal.valorPago) : 0))
  }

  if (tipoRateio === 'IGUAL') {
    return distributeEqual(valorTotal, animais.length)
  }

  if (pesoTotal <= 0) {
    return animais.map(() => 0)
  }

  const totalCents = toCents(valorTotal)
  let somaParcial = 0

  return animais.map((animal, index) => {
    if (index === animais.length - 1) {
      return centsToNumber(totalCents - somaParcial)
    }

    const peso = isPositiveNumber(animal.pesoKg) ? Number(animal.pesoKg) : 0
    const custoCents = Math.round((totalCents * peso) / pesoTotal)
    somaParcial += custoCents
    return centsToNumber(custoCents)
  })
}

function calcularValorPorArrobaDaCompra(
  form: CompraFormState,
  animal: CompraAnimalFormState,
  custoAtribuido: number | undefined,
) {
  if (!isPositiveNumber(animal.pesoKg)) {
    return { valor: null, indisponivel: 'Não disponível' }
  }

  if (form.tipoRateio === 'MANUAL' && (!animal.valorPago.trim() || !isNonNegativeNumber(animal.valorPago))) {
    return { valor: null, indisponivel: 'Aguardando custo atribuído' }
  }

  if (form.tipoRateio !== 'MANUAL' && !isPositiveNumber(form.valorTotal)) {
    return { valor: null, indisponivel: 'Aguardando valor da compra' }
  }

  return {
    valor: calcularValorPorArroba(custoAtribuido, Number(animal.pesoKg)),
    indisponivel: 'Não disponível',
  }
}

function distributeEqual(valorTotal: number, quantidade: number) {
  const totalCents = toCents(valorTotal)
  const baseCents = Math.round(totalCents / quantidade)
  let somaParcial = 0

  return Array.from({ length: quantidade }, (_, index) => {
    if (index === quantidade - 1) {
      return centsToNumber(totalCents - somaParcial)
    }

    somaParcial += baseCents
    return centsToNumber(baseCents)
  })
}

function isPositiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
}

function isNonNegativeNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0
}

function toMoneyNumber(value: string | number) {
  return centsToNumber(toCents(value))
}

function toCents(value: string | number) {
  return Math.round(Number(value || 0) * 100)
}

function centsToNumber(value: number) {
  return Number((value / 100).toFixed(2))
}

function formatInputCurrency(value: number | undefined) {
  return value ? value.toFixed(2) : ''
}

function getFriendlyError(error: unknown) {
  if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error

    if (message && message.length < 180) {
      return message
    }
  }

  return 'Nao foi possivel registrar a compra. Revise os dados e tente novamente.'
}
