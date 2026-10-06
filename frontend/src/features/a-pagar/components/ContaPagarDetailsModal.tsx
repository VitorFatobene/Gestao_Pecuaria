import { Ban, CalendarDays, CheckCircle2, CircleDollarSign, ReceiptText, Store, Tag, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  type ContaPagar,
  type ParcelaContaPagar,
} from '../types/contaPagar.types'
import {
  formatAccountStatus,
  formatCategory,
  formatCurrency,
  formatDate,
  formatDueDistance,
  formatInstallmentLabel,
  formatPaymentMethod,
  formatPaymentType,
} from '../utils/contaPagarFormatters'
import { ContaPagarStatusBadge, ParcelaStatusBadge } from './ContaPagarStatusBadge'
import { ParcelaCard } from './ParcelaCard'

type ContaPagarDetailsModalProps = {
  conta: ContaPagar
  isLoading: boolean
  isCancelling: boolean
  onClose: () => void
  onPayInstallment: (parcela: ParcelaContaPagar) => void
  onCancelAccount: () => void
}

export function ContaPagarDetailsModal({
  conta,
  isLoading,
  isCancelling,
  onClose,
  onPayInstallment,
  onCancelAccount,
}: ContaPagarDetailsModalProps) {
  const canCancel = conta.status !== 'PAGA' && conta.status !== 'CANCELADA'

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

  return createPortal(
    <div className="conta-pagar-modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="conta-pagar-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conta-pagar-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="conta-pagar-modal-header">
          <div>
            <span>Detalhes da conta</span>
            <h2 id="conta-pagar-details-title">{conta.descricao}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="conta-pagar-details-body">
          {isLoading && <div className="conta-pagar-inline-loading">Atualizando detalhes...</div>}

          <div className="conta-pagar-details-summary">
            <div>
              <strong>{formatCurrency(conta.valorRestante)}</strong>
              <span>Valor restante</span>
            </div>
            <ContaPagarStatusBadge status={conta.status} />
          </div>

          <section className="conta-pagar-details-section">
            <div className="conta-pagar-section-title">
              <ReceiptText size={18} aria-hidden="true" />
              <strong>Dados da conta</strong>
            </div>
            <div className="conta-pagar-info-grid">
              <DetailsInfo icon={Tag} label="Categoria" value={formatCategory(conta.categoria)} />
              <DetailsInfo icon={Store} label="Fornecedor" value={conta.fornecedor} />
              <DetailsInfo icon={CircleDollarSign} label="Valor total" value={formatCurrency(conta.valorTotal)} />
              <DetailsInfo icon={CircleDollarSign} label="Valor pago" value={formatCurrency(conta.valorPago)} />
              <DetailsInfo icon={CircleDollarSign} label="Valor restante" value={formatCurrency(conta.valorRestante)} />
              <DetailsInfo icon={CalendarDays} label="Data da compra" value={formatDate(conta.dataCompra)} />
              <DetailsInfo icon={ReceiptText} label="Tipo de pagamento" value={formatPaymentType(conta.tipoPagamento)} />
              <DetailsInfo icon={CheckCircle2} label="Status" value={formatAccountStatus(conta.status)} />
            </div>
          </section>

          {conta.observacao && (
            <section className="conta-pagar-notes">
              <span>Observação</span>
              <p>{conta.observacao}</p>
            </section>
          )}

          <section className="conta-pagar-details-section">
            <div className="conta-pagar-section-title">
              <CalendarDays size={18} aria-hidden="true" />
              <strong>Parcelas</strong>
            </div>

            <div className="conta-pagar-parcelas-table">
              <table>
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Pagamento</th>
                    <th>Forma de pagamento</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {conta.parcelas.map((parcela) => {
                    const canPay = parcela.status !== 'PAGA' && parcela.status !== 'CANCELADA'

                    return (
                      <tr key={parcela.id}>
                        <td>{formatInstallmentLabel(parcela, conta.quantidadeParcelas)}</td>
                        <td>{formatCurrency(parcela.valor)}</td>
                        <td>
                          <strong>{formatDate(parcela.dataVencimento)}</strong>
                          <span>{formatDueDistance(parcela)}</span>
                        </td>
                        <td>{formatDate(parcela.dataPagamento)}</td>
                        <td>{formatPaymentMethod(parcela.formaPagamento)}</td>
                        <td>
                          <ParcelaStatusBadge status={parcela.status} />
                        </td>
                        <td>
                          {canPay ? (
                            <button type="button" className="icon-text-button" onClick={() => onPayInstallment(parcela)}>
                              <CheckCircle2 size={15} aria-hidden="true" />
                              Marcar como paga
                            </button>
                          ) : (
                            <span className="conta-pagar-muted-action">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="conta-pagar-parcelas-cards">
              {conta.parcelas.map((parcela) => (
                <ParcelaCard
                  key={parcela.id}
                  parcela={parcela}
                  totalParcelas={conta.quantidadeParcelas}
                  onPay={onPayInstallment}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="conta-pagar-details-actions">
          {canCancel && (
            <button
              type="button"
              className="conta-pagar-danger-action"
              onClick={onCancelAccount}
              disabled={isCancelling}
            >
              <Ban size={16} aria-hidden="true" />
              {isCancelling ? 'Cancelando...' : 'Cancelar conta'}
            </button>
          )}
          <button type="button" className="secondary-action" onClick={onClose}>
            Fechar
          </button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

type DetailsInfoProps = {
  icon: typeof Tag
  label: string
  value: string
}

function DetailsInfo({ icon: Icon, label, value }: DetailsInfoProps) {
  return (
    <article>
      <Icon size={17} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}
