import { Ban, CalendarDays, CheckCircle2, CircleDollarSign, ReceiptText, Scale, Store, Tag, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useModalLifecycle } from '../../../hooks/useModalLifecycle'
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
import { WeightDisplay } from '../../../components/WeightDisplay'
import { calcularValorPorArroba } from '../../../utils/peso'

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
  const isContaAnimal = conta.categoria === 'ANIMAL'
  const animaisDaConta = conta.compra?.animais ?? (conta.animal ? [conta.animal] : [])

  useModalLifecycle(onClose)

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
              <DetailsInfo icon={CircleDollarSign} label="Valor total" value={formatCurrency(conta.valorTotal)} tone="money" />
              <DetailsInfo icon={CircleDollarSign} label="Valor pago" value={formatCurrency(conta.valorPago)} tone="money" />
              <DetailsInfo icon={CircleDollarSign} label="Valor restante" value={formatCurrency(conta.valorRestante)} tone="money" />
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

          {isContaAnimal && (
            <section className="conta-pagar-details-section">
              <div className="conta-pagar-section-title">
                <Scale size={18} aria-hidden="true" />
                <strong>{conta.compra && conta.compra.quantidadeAnimais > 1 ? 'Animais da compra' : 'Dados do animal'}</strong>
              </div>
              {conta.compra && (
                <div className="conta-pagar-info-grid">
                  <DetailsInfo icon={Store} label="Fornecedor" value={conta.compra.fornecedor} />
                  <DetailsInfo icon={CircleDollarSign} label="Valor total" value={formatCurrency(conta.compra.valorTotal)} tone="money" />
                  <DetailsInfo icon={CalendarDays} label="Data da compra" value={formatDate(conta.compra.dataCompra)} />
                  <DetailsInfo icon={Scale} label="Quantidade de animais" value={String(conta.compra.quantidadeAnimais)} />
                </div>
              )}

              <div className="conta-pagar-compra-animals">
                {animaisDaConta.length === 0 ? (
                  <article className="conta-pagar-animal-empty">
                    <div>
                      <span>Peso do animal</span>
                      <strong>Peso não informado</strong>
                    </div>
                    <div className="conta-pagar-valor-arroba">
                      <span>Valor por @</span>
                      <strong>Valor por @ não disponível</strong>
                    </div>
                  </article>
                ) : animaisDaConta.map((animal) => (
                  <article key={animal.id}>
                    <div className="conta-pagar-animal-structural">
                      <span className="brinco-label">Brinco</span>
                      <strong className="brinco-value">{animal.codigoAnimal}</strong>
                    </div>
                    <div className="conta-pagar-animal-weight">
                      <span>Peso do animal</span>
                      <strong><WeightDisplay pesoKg={animal.pesoKg} /></strong>
                    </div>
                    <div className="conta-pagar-valor-arroba">
                      <span>Valor por @</span>
                      <strong>{formatValorPorArroba(conta.compra ? animal.valorPago : conta.valorTotal, animal.pesoKg)}</strong>
                    </div>
                    <div className="conta-pagar-animal-structural">
                      <span>Raça</span>
                      <strong>{animal.raca}</strong>
                    </div>
                    <div className="conta-pagar-animal-money">
                      <span>Custo atribuído</span>
                      <strong>{formatCurrency(animal.valorPago)}</strong>
                    </div>
                  </article>
                ))}
              </div>
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
                    <th className="conta-pagar-parcela-due-header">Vencimento</th>
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
                        <td className="conta-pagar-parcela-money">{formatCurrency(parcela.valor)}</td>
                        <td className="conta-pagar-parcela-due">
                          <strong className="conta-pagar-due-date">{formatDate(parcela.dataVencimento)}</strong>
                          <span className="conta-pagar-due-distance">{formatDueDistance(parcela)}</span>
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

function formatValorPorArroba(valorTotal: number, pesoKg: number) {
  const valorPorArroba = calcularValorPorArroba(valorTotal, pesoKg)

  return valorPorArroba === null ? 'Valor por @ não disponível' : `${formatCurrency(valorPorArroba)}/@`
}

type DetailsInfoProps = {
  icon: typeof Tag
  label: string
  value: string
  tone?: 'money'
}

function DetailsInfo({ icon: Icon, label, value, tone }: DetailsInfoProps) {
  return (
    <article className={tone === 'money' ? 'conta-pagar-info-money' : undefined}>
      <Icon size={17} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}
