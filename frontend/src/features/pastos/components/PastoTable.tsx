import { Edit3, Eye, Power, PowerOff } from 'lucide-react'
import { type Pasto } from '../types/pastos.types'

type PastoTableProps = {
  pastos: Pasto[]
  onEdit: (pasto: Pasto) => void
  onDetails: (pasto: Pasto) => void
  onToggleStatus: (pasto: Pasto) => void
  updatingPastoId: number | null
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function PastoTable({ pastos, onEdit, onDetails, onToggleStatus, updatingPastoId }: PastoTableProps) {
  return (
    <section className="pastos-table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Area</th>
              <th>Animais ativos</th>
              <th>Descricao</th>
              <th>Status</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {pastos.map((pasto) => {
              const ToggleIcon = pasto.ativo ? PowerOff : Power

              return (
                <tr key={pasto.id}>
                  <td>{pasto.nome}</td>
                  <td>{numberFormatter.format(pasto.areaHectares)} ha</td>
                  <td>{numberFormatter.format(pasto.animaisAtivos ?? 0)}</td>
                  <td>{pasto.descricao || '-'}</td>
                  <td>
                    <span className={`pasto-status ${pasto.ativo ? 'is-active' : 'is-inactive'}`}>
                      {pasto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
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
                        className="icon-text-button"
                        disabled={updatingPastoId === pasto.id}
                        onClick={() => onToggleStatus(pasto)}
                      >
                        <ToggleIcon size={15} aria-hidden="true" />
                        {pasto.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
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
