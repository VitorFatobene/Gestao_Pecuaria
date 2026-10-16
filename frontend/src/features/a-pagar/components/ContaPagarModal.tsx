import { Plus, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalLifecycle } from '../../../hooks/useModalLifecycle'
import { FieldLabel, FieldRequirementLegend } from '../../../components/FieldRequirementBadge'
import { FormFeedback } from '../../../components/FormFeedback'
import {
  type CategoriaContaPagar,
  type CriarContaPagarRequest,
  type TipoPagamentoContaPagar,
} from '../types/contaPagar.types'
import { formatCategory, formatPaymentType } from '../utils/contaPagarFormatters'

type ContaPagarModalProps = {
  isSaving: boolean
  onClose: () => void
  onSubmit: (data: CriarContaPagarRequest) => Promise<string | void>
}

type FormState = {
  descricao: string
  categoria: CategoriaContaPagar
  fornecedor: string
  valorTotal: string
  dataCompra: string
  tipoPagamento: TipoPagamentoContaPagar
  observacao: string
  dataVencimento: string
  quantidadeParcelas: string
  primeiroVencimento: string
  intervaloDias: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const categoryOptions: CategoriaContaPagar[] = ['ANIMAL', 'RACAO', 'SUPLEMENTOS_PASTO']
const paymentTypeOptions: TipoPagamentoContaPagar[] = ['A_VISTA', 'PRAZO', 'PARCELADO']

export function ContaPagarModal({ isSaving, onClose, onSubmit }: ContaPagarModalProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [form, setForm] = useState<FormState>({
    descricao: '',
    categoria: 'RACAO',
    fornecedor: '',
    valorTotal: '',
    dataCompra: today,
    tipoPagamento: 'A_VISTA',
    observacao: '',
    dataVencimento: '',
    quantidadeParcelas: '2',
    primeiroVencimento: '',
    intervaloDias: '30',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useModalLifecycle(onClose)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedValue = Number(form.valorTotal)
    const parsedInstallments = Number(form.quantidadeParcelas)
    const parsedInterval = Number(form.intervaloDias)
    const nextErrors: FormErrors = {}

    if (!form.descricao.trim()) {
      nextErrors.descricao = 'Informe a descrição.'
    }

    if (!form.fornecedor.trim()) {
      nextErrors.fornecedor = 'Informe o fornecedor.'
    }

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      nextErrors.valorTotal = 'Informe um valor maior que zero.'
    }

    if (!form.dataCompra) {
      nextErrors.dataCompra = 'Informe a data da compra.'
    }

    if (form.tipoPagamento === 'PRAZO') {
      if (!form.dataVencimento) {
        nextErrors.dataVencimento = 'Informe a data de vencimento.'
      } else if (form.dataCompra && form.dataVencimento < form.dataCompra) {
        nextErrors.dataVencimento = 'O vencimento não pode ser anterior à compra.'
      }
    }

    if (form.tipoPagamento === 'PARCELADO') {
      if (!Number.isInteger(parsedInstallments) || parsedInstallments < 2) {
        nextErrors.quantidadeParcelas = 'Informe pelo menos 2 parcelas.'
      }

      if (!form.primeiroVencimento) {
        nextErrors.primeiroVencimento = 'Informe o primeiro vencimento.'
      } else if (form.dataCompra && form.primeiroVencimento < form.dataCompra) {
        nextErrors.primeiroVencimento = 'O vencimento não pode ser anterior à compra.'
      }

      if (!Number.isInteger(parsedInterval) || parsedInterval <= 0) {
        nextErrors.intervaloDias = 'Informe um intervalo maior que zero.'
      }
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload: CriarContaPagarRequest = {
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      fornecedor: form.fornecedor.trim(),
      valorTotal: parsedValue,
      dataCompra: form.dataCompra,
      tipoPagamento: form.tipoPagamento,
      observacao: form.observacao.trim() || undefined,
    }

    if (form.tipoPagamento === 'PRAZO') {
      payload.dataVencimento = form.dataVencimento
    }

    if (form.tipoPagamento === 'PARCELADO') {
      payload.quantidadeParcelas = parsedInstallments
      payload.primeiroVencimento = form.primeiroVencimento
      payload.intervaloDias = parsedInterval
    }

    setSubmitError(null)
    const errorMessage = await onSubmit(payload)
    if (errorMessage) setSubmitError(errorMessage)
  }

  const modal = (
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="conta-pagar-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conta-pagar-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-modal-header">
          <div>
            <span>Nova despesa</span>
            <h2 id="conta-pagar-modal-title">Nova conta a pagar</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form className="conta-pagar-form" onSubmit={handleSubmit}>
          <FieldRequirementLegend />
          <label className="form-field-wide">
            <FieldLabel requirement="required">Descrição</FieldLabel>
            <input
              value={form.descricao}
              maxLength={200}
              onChange={(event) => updateField('descricao', event.target.value)}
              placeholder="Compra de ração"
              disabled={isSaving}
              autoFocus
            />
            {errors.descricao && <small>{errors.descricao}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Categoria</FieldLabel>
            <select
              value={form.categoria}
              onChange={(event) => updateField('categoria', event.target.value as CategoriaContaPagar)}
              disabled={isSaving}
            >
              {categoryOptions.map((category) => (
                <option value={category} key={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FieldLabel requirement="required">Fornecedor</FieldLabel>
            <input
              value={form.fornecedor}
              maxLength={200}
              onChange={(event) => updateField('fornecedor', event.target.value)}
              placeholder="Agropecuária Central"
              disabled={isSaving}
            />
            {errors.fornecedor && <small>{errors.fornecedor}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Valor total</FieldLabel>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.valorTotal}
              onChange={(event) => updateField('valorTotal', event.target.value)}
              placeholder="2500,00"
              disabled={isSaving}
            />
            {errors.valorTotal && <small>{errors.valorTotal}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Data da compra</FieldLabel>
            <input
              type="date"
              value={form.dataCompra}
              onChange={(event) => updateField('dataCompra', event.target.value)}
              disabled={isSaving}
            />
            {errors.dataCompra && <small>{errors.dataCompra}</small>}
          </label>

          <label>
            <FieldLabel requirement="required">Tipo de pagamento</FieldLabel>
            <select
              value={form.tipoPagamento}
              onChange={(event) => updateField('tipoPagamento', event.target.value as TipoPagamentoContaPagar)}
              disabled={isSaving}
            >
              {paymentTypeOptions.map((type) => (
                <option value={type} key={type}>
                  {formatPaymentType(type)}
                </option>
              ))}
            </select>
          </label>

          {form.tipoPagamento === 'PRAZO' && (
            <label>
              <FieldLabel requirement="required">Data de vencimento</FieldLabel>
              <input
                type="date"
                value={form.dataVencimento}
                onChange={(event) => updateField('dataVencimento', event.target.value)}
                disabled={isSaving}
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
                  onChange={(event) => updateField('quantidadeParcelas', event.target.value)}
                  disabled={isSaving}
                />
                {errors.quantidadeParcelas && <small>{errors.quantidadeParcelas}</small>}
              </label>

              <label>
                <FieldLabel requirement="required">Primeiro vencimento</FieldLabel>
                <input
                  type="date"
                  value={form.primeiroVencimento}
                  onChange={(event) => updateField('primeiroVencimento', event.target.value)}
                  disabled={isSaving}
                />
                {errors.primeiroVencimento && <small>{errors.primeiroVencimento}</small>}
              </label>

              <label>
                <FieldLabel requirement="required">Intervalo entre parcelas em dias</FieldLabel>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  value={form.intervaloDias}
                  onChange={(event) => updateField('intervaloDias', event.target.value)}
                  disabled={isSaving}
                />
                {errors.intervaloDias && <small>{errors.intervaloDias}</small>}
              </label>
            </>
          )}

          <label className="form-field-wide">
            <FieldLabel requirement="optional">Observação</FieldLabel>
            <textarea
              value={form.observacao}
              maxLength={1000}
              onChange={(event) => updateField('observacao', event.target.value)}
              placeholder="Detalhes adicionais da compra"
              disabled={isSaving}
              rows={3}
            />
          </label>

          {(submitError || Object.keys(errors).length > 0) && <FormFeedback type="error" title="Erro ao cadastrar conta" message={submitError ?? 'Verifique os campos destacados.'} />}
          <div className="conta-pagar-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              <Plus size={16} aria-hidden="true" />
              {isSaving ? 'Salvando...' : 'Cadastrar conta'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
