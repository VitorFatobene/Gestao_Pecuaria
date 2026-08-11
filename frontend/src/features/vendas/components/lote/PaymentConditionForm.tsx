import { CalendarClock, CreditCard, Landmark } from 'lucide-react'
import { type CondicaoPagamento, type TipoPagamento } from '../../types/venda.types'

type PaymentConditionFormProps = {
  condition: CondicaoPagamento
  errors: Partial<Record<'diasCarencia' | 'entrada' | 'quantidadeParcelas' | 'intervaloDias', string>>
  isSaving: boolean
  valorTotal: number
  onChange: (condition: CondicaoPagamento) => void
}

const paymentOptions: Array<{ value: TipoPagamento; label: string; icon: typeof CreditCard }> = [
  { value: 'A_VISTA', label: 'A vista', icon: CreditCard },
  { value: 'PRAZO', label: 'Prazo', icon: CalendarClock },
  { value: 'PARCELADO', label: 'Parcelado', icon: Landmark },
]

export function PaymentConditionForm({ condition, errors, isSaving, valorTotal, onChange }: PaymentConditionFormProps) {
  function setPaymentType(tipoPagamento: TipoPagamento) {
    onChange({
      tipoPagamento,
      entrada: tipoPagamento === 'PARCELADO' ? condition.entrada ?? 0 : null,
      quantidadeParcelas: tipoPagamento === 'PARCELADO' ? condition.quantidadeParcelas ?? 4 : null,
      intervaloDias: tipoPagamento === 'PARCELADO' ? condition.intervaloDias ?? 30 : null,
      diasCarencia: tipoPagamento === 'PRAZO' ? condition.diasCarencia ?? 30 : null,
    })
  }

  function updateField<K extends keyof CondicaoPagamento>(field: K, value: CondicaoPagamento[K]) {
    onChange({
      ...condition,
      [field]: value,
    })
  }

  return (
    <section className="venda-lote-card">
      <div className="venda-lote-section-title">
        <CreditCard size={18} aria-hidden="true" />
        <div>
          <span>Condicao de pagamento</span>
          <h2>Forma da negociacao</h2>
        </div>
      </div>

      <div className="payment-type-grid" role="radiogroup" aria-label="Tipo de pagamento">
        {paymentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = condition.tipoPagamento === option.value

          return (
            <button
              key={option.value}
              type="button"
              className={`payment-type-option${isSelected ? ' is-selected' : ''}`}
              onClick={() => setPaymentType(option.value)}
              disabled={isSaving}
              aria-pressed={isSelected}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      {condition.tipoPagamento === 'A_VISTA' && (
        <div className="payment-rule-note">Pagamento marcado como pago com vencimento na data da venda.</div>
      )}

      {condition.tipoPagamento === 'PRAZO' && (
        <label className="venda-lote-field">
          Dias de carencia
          <input
            type="number"
            min="1"
            step="1"
            value={condition.diasCarencia ?? ''}
            onChange={(event) => updateField('diasCarencia', Number(event.target.value))}
            placeholder="60"
            disabled={isSaving}
          />
          {errors.diasCarencia && <small>{errors.diasCarencia}</small>}
        </label>
      )}

      {condition.tipoPagamento === 'PARCELADO' && (
        <div className="venda-lote-form-grid">
          <label className="venda-lote-field">
            Entrada
            <input
              type="number"
              min="0"
              max={valorTotal || undefined}
              step="0.01"
              value={condition.entrada ?? ''}
              onChange={(event) => updateField('entrada', Number(event.target.value))}
              placeholder="30000.00"
              disabled={isSaving}
            />
            {errors.entrada && <small>{errors.entrada}</small>}
          </label>

          <label className="venda-lote-field">
            Quantidade de parcelas
            <input
              type="number"
              min="1"
              step="1"
              value={condition.quantidadeParcelas ?? ''}
              onChange={(event) => updateField('quantidadeParcelas', Number(event.target.value))}
              placeholder="4"
              disabled={isSaving}
            />
            {errors.quantidadeParcelas && <small>{errors.quantidadeParcelas}</small>}
          </label>

          <label className="venda-lote-field">
            Intervalo entre parcelas
            <input
              type="number"
              min="1"
              step="1"
              value={condition.intervaloDias ?? ''}
              onChange={(event) => updateField('intervaloDias', Number(event.target.value))}
              placeholder="30"
              disabled={isSaving}
            />
            {errors.intervaloDias && <small>{errors.intervaloDias}</small>}
          </label>
        </div>
      )}
    </section>
  )
}
