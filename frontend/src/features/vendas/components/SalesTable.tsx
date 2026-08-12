import { ExternalLink, Eye } from 'lucide-react'
import { type Venda } from '../types/vendas.types'
import { SaleStatusBadge } from './SaleStatusBadge'
import { formatSaleId, getSaleStatus } from '../utils/salesFormatters'
import { formatPaymentInstallment } from '../utils/paymentFormatters'
import { PaymentTypeBadge } from './PaymentTypeBadge'

type SalesTableProps = {
  vendas: Venda[]
  onViewDetails: (venda: Venda) => void
  onOpenPage: (venda: Venda) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function SalesTable({ vendas, onViewDetails, onOpenPage }: SalesTableProps) {
  return (
    <section className="sales-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID venda</th>
              <th>Lote / Animal</th>
              <th>Comprador</th>
              <th>Data</th>
              <th>Peso</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Parcela</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>
                  <strong>{formatSaleId(venda.id)}</strong>
                  <span>Registro #{venda.id}</span>
                </td>
                <td>
                  <strong>{formatAnimal(venda)}</strong>
                  <span>{venda.nomePastoAnimal ?? 'Sem pasto atual'}</span>
                </td>
                <td>{venda.nomeComprador}</td>
                <td>{formatDate(venda.dataVenda)}</td>
                <td>{numberFormatter.format(venda.pesoKgVenda)} kg</td>
                <td>{currencyFormatter.format(venda.valorVenda)}</td>
                <td>
                  <PaymentTypeBadge pagamento={venda.pagamento} />
                </td>
                <td>{formatPaymentInstallment(venda.pagamento)}</td>
                <td>
                  <SaleStatusBadge status={getSaleStatus(venda)} />
                </td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="icon-text-button" onClick={() => onViewDetails(venda)}>
                      <Eye size={15} aria-hidden="true" />
                      Visualizar
                    </button>
                    <button type="button" className="icon-text-button" onClick={() => onOpenPage(venda)}>
                      <ExternalLink size={15} aria-hidden="true" />
                      Abrir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatAnimal(venda: Venda) {
  return [venda.codigoAnimal, venda.racaAnimal].filter(Boolean).join(' - ')
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}
