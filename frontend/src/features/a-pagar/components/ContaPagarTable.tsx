import { Eye } from 'lucide-react'
import { type ContaPagar } from '../types/contaPagar.types'
import {
  formatCategory,
  formatCurrency,
  formatDate,
  formatDueDistance,
  formatInstallmentLabel,
  getNextInstallment,
} from '../utils/contaPagarFormatters'
import { ContaPagarStatusBadge } from './ContaPagarStatusBadge'

type ContaPagarTableProps = {
  contas: ContaPagar[]
  onViewDetails: (conta: ContaPagar) => void
}

export function ContaPagarTable({ contas, onViewDetails }: ContaPagarTableProps) {
  return (
    <section className="conta-pagar-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Fornecedor</th>
              <th className="conta-pagar-table-money-header">Valor total</th>
              <th className="conta-pagar-table-money-header">Valor restante</th>
              <th>Próximo vencimento</th>
              <th>Parcela</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => {
              const nextInstallment = getNextInstallment(conta)

              return (
                <tr key={conta.id}>
                  <td className="conta-pagar-table-description">
                    <strong>{conta.descricao}</strong>
                    <span>Conta #{conta.id}</span>
                  </td>
                  <td className="conta-pagar-table-text">{formatCategory(conta.categoria)}</td>
                  <td className="conta-pagar-table-text">{conta.fornecedor}</td>
                  <td className="conta-pagar-table-money"><span className="conta-pagar-table-money-value">{formatCurrency(conta.valorTotal)}</span></td>
                  <td className="conta-pagar-table-money"><span className="conta-pagar-table-money-value">{formatCurrency(conta.valorRestante)}</span></td>
                  <td className="conta-pagar-table-due">
                    <strong>{formatDate(nextInstallment?.dataVencimento)}</strong>
                    <span>{formatDueDistance(nextInstallment)}</span>
                  </td>
                  <td className="conta-pagar-table-installment">{formatInstallmentLabel(nextInstallment, conta.quantidadeParcelas)}</td>
                  <td>
                    <ContaPagarStatusBadge status={conta.status} />
                  </td>
                  <td>
                    <button type="button" className="icon-text-button" onClick={() => onViewDetails(conta)}>
                      <Eye size={15} aria-hidden="true" />
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
