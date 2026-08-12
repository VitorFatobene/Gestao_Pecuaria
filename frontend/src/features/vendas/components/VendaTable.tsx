import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type Venda } from '../types/venda.types'
import { formatPaymentInstallment } from '../utils/paymentFormatters'
import { PaymentTypeBadge } from './PaymentTypeBadge'

type VendaTableProps = {
  vendas: Venda[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

export function VendaTable({ vendas }: VendaTableProps) {
  const navigate = useNavigate()

  return (
    <section className="vendas-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Codigo Animal</th>
              <th>Comprador</th>
              <th>Valor (R$)</th>
              <th>Tipo</th>
              <th>Parcela</th>
              <th>Data da Venda</th>
              <th>Peso (kg)</th>
              <th>Peso (@)</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id}>
                <td>#{venda.id}</td>
                <td>{venda.codigoAnimal}</td>
                <td>{venda.nomeComprador}</td>
                <td>{currencyFormatter.format(venda.valorVenda)}</td>
                <td>
                  <PaymentTypeBadge pagamento={venda.pagamento} />
                </td>
                <td>{formatPaymentInstallment(venda.pagamento)}</td>
                <td>{formatDate(venda.dataVenda)}</td>
                <td>{numberFormatter.format(venda.pesoKgVenda)} kg</td>
                <td>{numberFormatter.format(venda.pesoArrobaVenda)} @</td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="icon-text-button" onClick={() => navigate(`/vendas/${venda.id}`)}>
                      <Eye size={15} aria-hidden="true" />
                      Ver Detalhes
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
