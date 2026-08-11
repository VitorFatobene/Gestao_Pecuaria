import { BadgeDollarSign } from 'lucide-react'

type VendaLoteFormState = {
  comprador: string
  valorTotal: number
  dataVenda: string
}

type FormErrors = Partial<Record<keyof VendaLoteFormState, string>>

type VendaLoteFormProps = {
  data: VendaLoteFormState
  errors: FormErrors
  isSaving: boolean
  onChange: (data: VendaLoteFormState) => void
}

export function VendaLoteForm({ data, errors, isSaving, onChange }: VendaLoteFormProps) {
  function updateField<K extends keyof VendaLoteFormState>(field: K, value: VendaLoteFormState[K]) {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <section className="venda-lote-card">
      <div className="venda-lote-section-title">
        <BadgeDollarSign size={18} aria-hidden="true" />
        <div>
          <span>Dados da venda</span>
          <h2>Negociacao</h2>
        </div>
      </div>

      <div className="venda-lote-form-grid">
        <label className="venda-lote-field venda-lote-field-wide">
          Comprador
          <input
            value={data.comprador}
            onChange={(event) => updateField('comprador', event.target.value)}
            placeholder="Frigorifico Boa Carne"
            disabled={isSaving}
          />
          {errors.comprador && <small>{errors.comprador}</small>}
        </label>

        <label className="venda-lote-field">
          Valor total da venda
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={data.valorTotal || ''}
            onChange={(event) => updateField('valorTotal', Number(event.target.value))}
            placeholder="150000.00"
            disabled={isSaving}
          />
          {errors.valorTotal && <small>{errors.valorTotal}</small>}
        </label>

        <label className="venda-lote-field">
          Data da venda
          <input
            type="date"
            value={data.dataVenda}
            onChange={(event) => updateField('dataVenda', event.target.value)}
            disabled={isSaving}
          />
          {errors.dataVenda && <small>{errors.dataVenda}</small>}
        </label>
      </div>
    </section>
  )
}
