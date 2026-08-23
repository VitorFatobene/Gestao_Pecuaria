import { Beef, CalendarDays, Edit3, Eye, Gauge, LandPlot, PowerOff, Repeat2, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { type PastoDetalhes, type PastoResumo } from '../types/pastos.types'
import { PastoAnimalsTable } from './PastoAnimalsTable'
import { StatusBadge } from './PastureCard'

type PastureDetailsDrawerProps = {
  pasto: PastoResumo
  detalhes: PastoDetalhes | null
  isLoading: boolean
  onClose: () => void
  onViewAnimals: (pasto: PastoResumo) => void
  onEdit: (pasto: PastoResumo) => void
  onDeactivate: (pasto: PastoResumo) => void
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function PastureDetailsDrawer({
  pasto,
  detalhes,
  isLoading,
  onClose,
  onViewAnimals,
  onEdit,
  onDeactivate,
}: PastureDetailsDrawerProps) {
  const detailPasto = detalhes?.pasto ?? pasto

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const modal = (
    <div className="animal-drawer-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="pasture-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pasture-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="pasture-drawer-header">
          <div>
            <span>Detalhes do pasto</span>
            <h2 id="pasture-drawer-title">{detailPasto.nome}</h2>
          </div>
          <StatusBadge status={detailPasto.statusOcupacao} />
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="Fechar detalhes">
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="pasture-details-modal-body">
          <div className="pasture-details-primary">
            <div className="pasture-drawer-summary">
              <StatusBadge status={detailPasto.statusOcupacao} />
              <strong>{numberFormatter.format(detailPasto.areaHectares)} ha</strong>
              <span>{detailPasto.tipoPastagem}</span>
            </div>

            <div className="pasture-drawer-info">
              <DrawerMetric icon={LandPlot} label="Area" value={`${numberFormatter.format(detailPasto.areaHectares)} ha`} />
              <DrawerMetric icon={Beef} label="Capacidade" value={`${numberFormatter.format(detailPasto.capacidade)} animais`} />
              <DrawerMetric icon={Gauge} label="Animais alocados" value={numberFormatter.format(detailPasto.quantidadeAnimais)} />
              <DrawerMetric icon={Gauge} label="Taxa ocupacao" value={`${percentFormatter.format(detailPasto.ocupacaoPercentual)}%`} />
              <DrawerMetric icon={CalendarDays} label="Data cadastro" value={formatDate(detailPasto.criadoEm)} />
              <DrawerMetric icon={LandPlot} label="Status cadastro" value={detailPasto.ativo ? 'Ativo' : 'Inativo'} />
            </div>

            <div className="pasture-drawer-notes">
              <span>Observacoes</span>
              <p>{detailPasto.descricao || 'Sem observacoes cadastradas.'}</p>
            </div>
          </div>

          <div className="pasture-details-secondary">
            <section className="pasture-animals-summary">
              <div className="pasture-section-title">
                <span>Animais alocados</span>
                <strong>{numberFormatter.format(detailPasto.quantidadeAnimais)} animais</strong>
              </div>

              {isLoading ? (
                <p className="pasture-details-empty">Carregando animais alocados...</p>
              ) : detalhes?.animaisAlocados.length ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Peso medio</th>
                        <th>Idade media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhes.animaisAlocados.map((grupo) => (
                        <tr key={grupo.categoria}>
                          <td>{grupo.categoria}</td>
                          <td>{numberFormatter.format(grupo.quantidade)}</td>
                          <td>{numberFormatter.format(grupo.pesoMedio)} kg</td>
                          <td>{grupo.idadeMedia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="pasture-details-empty">Nenhum animal ativo alocado neste pasto.</p>
              )}
            </section>

            <PastoAnimalsTable pastoId={detailPasto.id} />

            <div className="pasture-drawer-actions">
              <button type="button" className="secondary-action" onClick={() => onViewAnimals(detailPasto)}>
                <Eye size={16} aria-hidden="true" />
                Visualizar animais
              </button>
              <button type="button" className="secondary-action" onClick={() => onEdit(detailPasto)}>
                <Edit3 size={16} aria-hidden="true" />
                Editar pasto
              </button>
              <button type="button" className="secondary-action" disabled title="Interface preparada para movimentacao">
                <Repeat2 size={16} aria-hidden="true" />
                Mover animal
              </button>
              <button type="button" className="danger-action" disabled={!detailPasto.ativo} onClick={() => onDeactivate(detailPasto)}>
                <PowerOff size={16} aria-hidden="true" />
                Desativar pasto
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}

type DrawerMetricProps = {
  icon: typeof LandPlot
  label: string
  value: string
}

function DrawerMetric({ icon: Icon, label, value }: DrawerMetricProps) {
  return (
    <article>
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function formatDate(value?: string) {
  if (!value) {
    return 'Nao informada'
  }

  return dateFormatter.format(new Date(value))
}
