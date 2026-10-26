import { Eye } from 'lucide-react'
import { type ContaPagar } from '../types/contaPagar.types'
import {
  formatCompactCurrency,
  formatCompactDate,
  formatDueDistance,
  getNextInstallment,
} from '../utils/contaPagarFormatters'
import { ContaPagarStatusBadge, ParcelaStatusBadge } from './ContaPagarStatusBadge'

type ContaPagarMobileTableProps = {
  contas: ContaPagar[]
  onViewDetails: (conta: ContaPagar) => void
}

export function ContaPagarMobileTable({ contas, onViewDetails }: ContaPagarMobileTableProps) {
  return (
    <section className="conta-pagar-mobile-table-card" aria-label="Tabela mobile de contas a pagar">
      <div className="conta-pagar-mobile-table-scroll">
        <table className="conta-pagar-mobile-table">
          <thead>
            <tr>
              <th>Conta</th>
              <th className="conta-pagar-mobile-due-header">Venc.</th>
              <th>Valor</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => {
              const nextInstallment = getNextInstallment(conta)

              return (
                <tr key={conta.id}>
                  <td className="conta-pagar-mobile-account">
                    <strong title={conta.descricao}>{conta.descricao}</strong>
                    <span title={conta.fornecedor}>{conta.fornecedor}</span>
                  </td>
                  <td className="conta-pagar-mobile-due">
                    <strong className={nextInstallment?.dataVencimento ? 'conta-pagar-due-date' : undefined}>{formatCompactDate(nextInstallment?.dataVencimento)}</strong>
                    <span className={nextInstallment?.dataVencimento ? 'conta-pagar-due-distance' : undefined}>{formatDueDistance(nextInstallment)}</span>
                  </td>
                  <td className="conta-pagar-mobile-value">{formatCompactCurrency(conta.valorRestante)}</td>
                  <td className="conta-pagar-mobile-status">
                    {conta.status === 'PENDENTE' && nextInstallment?.status === 'ATRASADA' ? (
                      <ParcelaStatusBadge status={nextInstallment.status} />
                    ) : (
                      <ContaPagarStatusBadge status={conta.status} compact />
                    )}
                  </td>
                  <td className="conta-pagar-mobile-actions">
                    <button
                      type="button"
                      className="conta-pagar-mobile-action"
                      onClick={() => onViewDetails(conta)}
                      aria-label={`Ver detalhes de ${conta.descricao}`}
                      title="Ver detalhes"
                    >
                      <Eye size={17} aria-hidden="true" />
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
