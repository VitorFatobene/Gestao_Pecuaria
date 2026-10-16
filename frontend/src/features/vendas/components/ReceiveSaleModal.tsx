import { CheckCircle2, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModalLifecycle } from '../../../hooks/useModalLifecycle'
import { FieldLabel } from '../../../components/FieldRequirementBadge'
import { FormFeedback } from '../../../components/FormFeedback'
import { type FormaPagamento, type RegistrarRecebimentoVendaRequest, type Venda } from '../types/vendas.types'

type ReceiveSaleModalProps = {
  venda: Venda
  isSaving: boolean
  onClose: () => void
  onConfirm: (data: RegistrarRecebimentoVendaRequest) => Promise<void>
}

const paymentMethods: FormaPagamento[] = ['PIX', 'DINHEIRO', 'TRANSFERENCIA', 'BOLETO', 'OUTROS']

const paymentMethodLabels: Record<FormaPagamento, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  TRANSFERENCIA: 'Transferência',
  BOLETO: 'Boleto',
  OUTROS: 'Outros',
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ReceiveSaleModal({ venda, isSaving, onClose, onConfirm }: ReceiveSaleModalProps) {
  const today = useMemo(() => getTodayInputValue(), [])
  const [dataPagamento, setDataPagamento] = useState(today)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX')
  const [error, setError] = useState<string | null>(null)
  const valorVenda = venda.valorVenda
  const valorRecebido = getReceivedAmount(venda)
  const saldoAReceber = Math.max(valorVenda - valorRecebido, 0)

  useModalLifecycle(onClose)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!dataPagamento) {
      setError('Informe a data do recebimento.')
      return
    }

    setError(null)
    await onConfirm({ dataPagamento, formaPagamento })
  }

  return createPortal(
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="receber-venda-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receber-venda-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-modal-header">
          <div>
            <span>Recebimento da venda</span>
            <h2 id="receber-venda-title">Confirmar recebimento desta venda?</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="receber-venda-summary" aria-label="Resumo do recebimento">
          <SummaryItem label="Valor da venda" value={currencyFormatter.format(valorVenda)} />
          <SummaryItem label="Valor já recebido" value={currencyFormatter.format(valorRecebido)} />
          <SummaryItem label="Saldo a receber" value={currencyFormatter.format(saldoAReceber)} />
          <SummaryItem label="Valor recebido agora" value={currencyFormatter.format(saldoAReceber)} />
        </div>

        <form className="receber-venda-form" onSubmit={handleSubmit}>
          <label>
            <FieldLabel requirement="required">Data do recebimento</FieldLabel>
            <input
              type="date"
              value={dataPagamento}
              onChange={(event) => setDataPagamento(event.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </label>

          <label>
            <FieldLabel requirement="required">Forma de pagamento</FieldLabel>
            <select
              value={formaPagamento}
              onChange={(event) => setFormaPagamento(event.target.value as FormaPagamento)}
              disabled={isSaving}
            >
              {paymentMethods.map((method) => (
                <option value={method} key={method}>
                  {paymentMethodLabels[method]}
                </option>
              ))}
            </select>
          </label>

          {error && <FormFeedback type="error" title="Erro ao registrar recebimento" message={error} />}
          <div className="conta-pagar-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving || saldoAReceber <= 0}>
              <CheckCircle2 size={16} aria-hidden="true" />
              {isSaving ? 'Registrando...' : 'Confirmar recebimento'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function getReceivedAmount(venda: Venda) {
  return (venda.pagamentos ?? [])
    .filter((pagamento) => pagamento.status === 'PAGO')
    .reduce((total, pagamento) => total + pagamento.valor, 0)
}

function getTodayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
