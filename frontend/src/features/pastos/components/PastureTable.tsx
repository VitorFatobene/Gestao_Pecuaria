import { Edit3, Eye, PowerOff } from 'lucide-react'
import { StatusBadge } from './PastureCard'
import { type PastoResumo } from '../types/pastos.types'

type PastureTableProps = {
  pastos: PastoResumo[]
  onDetails: (pasto: PastoResumo) => void
  onEdit: (pasto: PastoResumo) => void
  onDeactivate: (pasto: PastoResumo) => void
  updatingPastoId: number | null
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})

export function PastureTable({ pastos, onDetails, onEdit, onDeactivate, updatingPastoId }: PastureTableProps) {
  return (
    <section className="pasture-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Area</th>
              <th>Capacidade</th>
              <th>Animais</th>
              <th>Ocupacao</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {pastos.map((pasto) => (
              <tr key={pasto.id}>
                <td>
                  <strong>{pasto.nome}</strong>
                  <span>{pasto.tipoPastagem}</span>
                </td>
                <td>{numberFormatter.format(pasto.areaHectares)} ha</td>
                <td>{numberFormatter.format(pasto.capacidade)}</td>
                <td>{numberFormatter.format(pasto.quantidadeAnimais)}</td>
                <td>{percentFormatter.format(pasto.ocupacaoPercentual)}%</td>
                <td>
                  <StatusBadge status={pasto.statusOcupacao} />
                </td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="icon-text-button" onClick={() => onDetails(pasto)}>
                      <Eye size={15} aria-hidden="true" />
                      Detalhes
                    </button>
                    <button type="button" className="icon-text-button" onClick={() => onEdit(pasto)}>
                      <Edit3 size={15} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="icon-text-button danger-text-button"
                      disabled={updatingPastoId === pasto.id || !pasto.ativo}
                      onClick={() => onDeactivate(pasto)}
                    >
                      <PowerOff size={15} aria-hidden="true" />
                      Desativar
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
