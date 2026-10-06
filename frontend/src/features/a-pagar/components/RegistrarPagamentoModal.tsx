import { CheckCircle2, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  type FormaPagamento,
  type ParcelaContaPagar,
  type RegistrarPagamentoParcelaRequest,
} from '../types/contaPagar.types'
import { formatCurrency, formatDate, formatInstallmentLabel, formatPaymentMethod } from '../utils/contaPagarFormatters'

type RegistrarPagamentoModalProps = {
  parcela: ParcelaContaPagar
  totalParcelas: number
  isSaving: boolean
  onClose: () => void
  onSubmit: (data: RegistrarPagamentoParcelaRequest) => Promise<void>
}

const paymentMethods: FormaPagamento[] = ['PIX', 'DINHEIRO', 'TRANSFERENCIA', 'BOLETO', 'OUTROS']

export function RegistrarPagamentoModal({
  parcela,
  totalParcelas,
  isSaving,
  onClose,
  onSubmit,
}: RegistrarPagamentoModalProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [dataPagamento, setDataPagamento] = useState(today)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!dataPagamento) {
      setError('Informe a data do pagamento.')
      return
    }

    setError(null)
    await onSubmit({ dataPagamento, formaPagamento })
  }

  return createPortal(
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="registrar-pagamento-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registrar-pagamento-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-modal-header">
          <div>
            <span>Baixa de parcela</span>
            <h2 id="registrar-pagamento-title">Marcar como paga</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="registrar-pagamento-summary">
          <span>{formatInstallmentLabel(parcela, totalParcelas)}</span>
          <strong>{formatCurrency(parcela.valor)}</strong>
          <p>Vencimento em {formatDate(parcela.dataVencimento)}</p>
        </div>

        <form className="registrar-pagamento-form" onSubmit={handleSubmit}>
          <label>
            <span>Data do pagamento</span>
            <input
              type="date"
              value={dataPagamento}
              onChange={(event) => setDataPagamento(event.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </label>

          <label>
            <span>Forma de pagamento</span>
            <select
              value={formaPagamento}
              onChange={(event) => setFormaPagamento(event.target.value as FormaPagamento)}
              disabled={isSaving}
            >
              {paymentMethods.map((method) => (
                <option value={method} key={method}>
                  {formatPaymentMethod(method)}
                </option>
              ))}
            </select>
          </label>

          {error && <small className="conta-pagar-filter-error">{error}</small>}

          <div className="conta-pagar-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={isSaving}>
              Voltar
            </button>
            <button type="submit" className="primary-action" disabled={isSaving}>
              <CheckCircle2 size={16} aria-hidden="true" />
              {isSaving ? 'Registrando...' : 'Confirmar pagamento'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}
