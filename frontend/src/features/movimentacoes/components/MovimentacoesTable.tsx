import { Clock3, MapPin, PawPrint } from 'lucide-react'
import { type MovimentacaoAnimal } from '../types/movimentacoes.types'

type MovimentacoesTableProps = {
  movimentacoes: MovimentacaoAnimal[]
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function MovimentacoesTable({ movimentacoes }: MovimentacoesTableProps) {
  return (
    <section className="movimentacoes-table-card">
      <div className="table-wrapper movimentacoes-table-wrapper">
        <table className="movimentacoes-table">
          <thead>
            <tr>
              <th>Animal</th>
              <th>Pasto</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Permanência</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((movimentacao) => (
              <tr key={movimentacao.id}>
                <td data-label="Animal">
                  <div className="movimentacoes-entity">
                    <PawPrint size={17} aria-hidden="true" />
                    <div>
                      <strong>{movimentacao.animal.codigoAnimal}</strong>
                      <span>{movimentacao.animal.raca}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Pasto">
                  <div className="movimentacoes-entity">
                    <MapPin size={17} aria-hidden="true" />
                    <div>
                      <strong>{movimentacao.pasto.nome}</strong>
                      <span>{movimentacao.pasto.ativo === false ? 'Inativo' : 'Ativo'}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Entrada">{formatDate(movimentacao.dataEntrada)}</td>
                <td data-label="Saída">{movimentacao.dataSaida ? formatDate(movimentacao.dataSaida) : 'Atual'}</td>
                <td data-label="Permanência">
                  <span className="movimentacoes-duration">
                    <Clock3 size={14} aria-hidden="true" />
                    {formatDays(movimentacao.diasPermanencia)}
                  </span>
                </td>
                <td data-label="Status">
                  <MovimentacaoStatusBadge atual={movimentacao.atual} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function MovimentacaoStatusBadge({ atual }: { atual: boolean }) {
  return <span className={atual ? 'movimentacoes-status is-current' : 'movimentacoes-status'}>{atual ? 'Atual' : 'Finalizado'}</span>
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function formatDays(days: number) {
  return days === 1 ? '1 dia' : `${numberFormatter.format(days)} dias`
}
