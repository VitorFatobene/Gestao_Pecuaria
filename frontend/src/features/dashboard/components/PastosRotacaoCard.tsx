import { AlertTriangle, CheckCircle2, Flame, Sprout } from 'lucide-react'
import { type PastoRotacao, type PastoRotacaoStatus } from '../dashboard.types'

type PastosRotacaoCardProps = {
  pastos: PastoRotacao[]
  isLoading?: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

const statusLabel: Record<PastoRotacaoStatus, string> = {
  NORMAL: 'Normal',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
}

const statusIcon = {
  NORMAL: CheckCircle2,
  ATENCAO: AlertTriangle,
  CRITICO: Flame,
}

export function PastosRotacaoCard({ pastos, isLoading = false }: PastosRotacaoCardProps) {
  return (
    <section className="dashboard-card manejo-panel">
      <div className="section-heading">
        <div>
          <span>Rotação</span>
          <h2>Situação dos pastos</h2>
        </div>
      </div>

      <div className="manejo-pasto-list">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <article className="manejo-pasto-item" key={index}>
              <i className="skeleton-line skeleton-title" />
              <i className="skeleton-line skeleton-text" />
            </article>
          ))}

        {!isLoading && pastos.length === 0 && (
          <p className="manejo-empty">Nenhum pasto ativo cadastrado.</p>
        )}

        {!isLoading &&
          pastos.map((pasto) => (
            <article className="manejo-pasto-item" key={pasto.nome}>
              <div className="manejo-pasto-main">
                <div className="manejo-item-icon">
                  <Sprout size={17} aria-hidden="true" />
                </div>
                <div>
                  <strong>{pasto.nome}</strong>
                  <p>
                    {numberFormatter.format(pasto.quantidadeAnimais)} animais · {formatDays(pasto.diasOcupacao)}
                  </p>
                </div>
              </div>
              <RotacaoStatusBadge status={pasto.status} />
            </article>
          ))}
      </div>
    </section>
  )
}

function RotacaoStatusBadge({ status }: { status: PastoRotacaoStatus }) {
  const Icon = statusIcon[status]

  return (
    <span className={`manejo-status-badge is-${status.toLowerCase()}`}>
      <Icon size={14} aria-hidden="true" />
      {statusLabel[status]}
    </span>
  )
}

function formatDays(days: number) {
  return days === 1 ? '1 dia' : `${numberFormatter.format(days)} dias`
}
