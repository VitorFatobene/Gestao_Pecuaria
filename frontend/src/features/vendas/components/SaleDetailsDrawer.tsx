import { CalendarDays, CheckCircle2, CircleDollarSign, MapPin, ReceiptText, Scale, Tag, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { type ReactNode } from 'react'
import { useModalLifecycle } from '../../../hooks/useModalLifecycle'
import { type AnimalVendaDetalhe, type Venda } from '../types/vendas.types'
import { formatSaleId, formatSaleStatus, getSaleStatus } from '../utils/salesFormatters'
import { formatPaymentInstallment, formatPaymentType } from '../utils/paymentFormatters'
import { SaleStatusBadge } from './SaleStatusBadge'
import { WeightDisplay } from '../../../components/WeightDisplay'
import { isPesoInformado } from '../../../utils/peso'

type SaleDetailsDrawerProps = {
  venda: Venda
  onClose: () => void
  onOpenPage: (venda: Venda) => void
  onReceiveSale: (venda: Venda) => void
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function SaleDetailsDrawer({ venda, onClose, onOpenPage, onReceiveSale }: SaleDetailsDrawerProps) {
  const valorCompra = (venda.valorCompraAnimal ?? 0) + (venda.valorFreteAnimal ?? 0)
  const hasPurchaseValue = venda.valorCompraAnimal !== null && venda.valorCompraAnimal !== undefined
  const lucroEstimado = hasPurchaseValue ? venda.valorVenda - valorCompra : null
  const saldoAReceber = getReceivableBalance(venda)
  const canReceive = getSaleStatus(venda) !== 'CANCELADA' && saldoAReceber > 0
  const animais = venda.animais ?? []
  const quantidadeAnimais = animais.length || venda.quantidadeAnimaisLote || 0
  const pesoTotalKg = venda.pesoTotalKgLote ?? venda.pesoKgVenda

  useModalLifecycle(onClose)

  const modal = (
    <div className="conta-pagar-modal-overlay sale-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="sale-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sale-drawer-header">
          <div>
            <span>Detalhes da venda</span>
            <h2 id="sale-drawer-title">{formatSaleId(venda.id)}</h2>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="sale-details-modal-body">
          <div className="sale-drawer-summary">
            <div>
              <strong>{currencyFormatter.format(venda.valorVenda)}</strong>
              <span>{venda.nomeComprador}</span>
            </div>
            <SaleStatusBadge status={getSaleStatus(venda)} />
          </div>

          <section className="sale-drawer-section">
            <div className="sale-section-title">
              <ReceiptText size={18} aria-hidden="true" />
              <strong>Dados da venda</strong>
            </div>
            <div className="sale-drawer-info">
              <DrawerInfo label="ID" value={formatSaleId(venda.id)} />
              <DrawerInfo label="Data" value={formatDate(venda.dataVenda)} />
              <DrawerInfo label="Comprador" value={venda.nomeComprador} />
              <DrawerInfo label="Tipo" value={formatPaymentType(venda.pagamento)} />
              <DrawerInfo label="Parcela" value={formatPaymentInstallment(venda.pagamento)} />
              <DrawerInfo label="Status" value={formatSaleStatus(getSaleStatus(venda))} />
            </div>
          </section>

          <section className="sale-sale-summary-metrics" aria-label="Resumo dos animais da venda">
            <DrawerMetric icon={Tag} label="Quantidade de animais" value={formatQuantidadeAnimais(quantidadeAnimais)} />
            <DrawerMetric icon={Scale} label="Peso total" value={<WeightDisplay pesoKg={pesoTotalKg} />} />
            <DrawerMetric
              icon={CircleDollarSign}
              label="Valor médio por @"
              value={venda.valorMedioPorArroba == null ? 'Valor por @ não disponível' : `${currencyFormatter.format(venda.valorMedioPorArroba)}/@`}
            />
          </section>

          <section className="sale-drawer-section sale-drawer-animals">
            <div className="sale-section-title">
              <Tag size={18} aria-hidden="true" />
              <strong>Animais da venda</strong>
              <span className="sale-section-count">{formatQuantidadeAnimais(quantidadeAnimais)}</span>
            </div>
            {animais.length === 0 ? (
              <p className="sale-animals-empty">Os detalhes dos animais não estão disponíveis para esta venda.</p>
            ) : (
              <>
                <div className="sale-animals-table">
                  <table>
                    <thead>
                      <tr>
                        <th className="brinco-label">Brinco</th>
                        <th>Raça</th>
                        <th>Sexo</th>
                        <th>Peso</th>
                        <th>Valor atribuído</th>
                        <th>Valor por @</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animais.map((animal) => (
                        <tr key={animal.id}>
                          <td><strong className="brinco-value">{animal.codigoAnimal}</strong></td>
                          <td>{animal.raca ?? 'Não informada'}</td>
                          <td>{formatSexo(animal.sexo)}</td>
                          <td><AnimalWeight pesoKg={animal.pesoKg} /></td>
                          <td>{currencyFormatter.format(animal.valorAtribuido)}</td>
                          <td>{animal.valorPorArroba == null ? 'Valor por @ não disponível' : `${currencyFormatter.format(animal.valorPorArroba)}/@`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sale-animal-cards">
                  {animais.map((animal) => (
                    <article key={animal.id}>
                      <header>
                        <strong className="brinco-text">Brinco <span className="brinco-value">{animal.codigoAnimal}</span></strong>
                        <span>{animal.raca ?? 'Raça não informada'}</span>
                      </header>
                      <span className="sale-animal-sex">{formatSexo(animal.sexo)}</span>
                      <div className="sale-animal-card-metrics">
                        <div>
                          <span>Peso</span>
                          <strong><AnimalWeight pesoKg={animal.pesoKg} /></strong>
                        </div>
                        <div>
                          <span>Valor atribuído</span>
                          <strong>{currencyFormatter.format(animal.valorAtribuido)}</strong>
                        </div>
                        <div>
                          <span>Valor por @</span>
                          <strong>{animal.valorPorArroba == null ? 'Valor por @ não disponível' : `${currencyFormatter.format(animal.valorPorArroba)}/@`}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="sale-drawer-finance">
            <DrawerMetric
              icon={CalendarDays}
              label="Valor de compra"
              value={hasPurchaseValue ? currencyFormatter.format(valorCompra) : 'Nao informado'}
            />
            <DrawerMetric
              icon={Scale}
              label="Lucro estimado"
              value={lucroEstimado === null ? 'Nao informado' : currencyFormatter.format(lucroEstimado)}
              tone={lucroEstimado !== null && lucroEstimado < 0 ? 'negative' : 'positive'}
            />
            <DrawerMetric icon={MapPin} label="Pasto atual" value={venda.nomePastoAnimal ?? 'Sem pasto atual'} />
          </section>
        </div>

        <div className="sale-drawer-actions">
          <button type="button" className="primary-action" onClick={() => onOpenPage(venda)}>
            Abrir detalhes completos
          </button>
          {canReceive && (
            <button type="button" className="primary-action" onClick={() => onReceiveSale(venda)}>
              <CheckCircle2 size={16} aria-hidden="true" />
              Marcar como recebida
            </button>
          )}
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}

type DrawerInfoProps = {
  label: string
  value: ReactNode
}

function DrawerInfo({ label, value }: DrawerInfoProps) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type DrawerMetricProps = DrawerInfoProps & {
  icon: typeof CalendarDays
  tone?: 'positive' | 'negative'
}

function DrawerMetric({ icon: Icon, label, value, tone }: DrawerMetricProps) {
  return (
    <article className={tone ? `is-${tone}` : undefined}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function getReceivableBalance(venda: Venda) {
  const valorRecebido = (venda.pagamentos ?? [])
    .filter((pagamento) => pagamento.status === 'PAGO')
    .reduce((total, pagamento) => total + pagamento.valor, 0)

  return Math.max(venda.valorVenda - valorRecebido, 0)
}

function formatQuantidadeAnimais(quantidade: number) {
  return `${quantidade} ${quantidade === 1 ? 'animal' : 'animais'}`
}

function formatSexo(sexo: AnimalVendaDetalhe['sexo']) {
  if (sexo === 'MACHO') {
    return 'Macho'
  }

  if (sexo === 'FEMEA') {
    return 'Fêmea'
  }

  return 'Não informado'
}

function AnimalWeight({ pesoKg }: Pick<AnimalVendaDetalhe, 'pesoKg'>) {
  if (!isPesoInformado(pesoKg)) {
    return (
      <span className="sale-animal-weight-unavailable">
        <span>Peso não informado</span>
        <span>Arrobas não disponíveis</span>
      </span>
    )
  }

  return <WeightDisplay pesoKg={pesoKg} />
}
