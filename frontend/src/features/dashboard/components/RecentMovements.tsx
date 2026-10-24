import { ClipboardList } from 'lucide-react'
import { type RecentMovement } from '../dashboard.types'
import { type DashboardStatus } from '../dashboard.types'

type RecentMovementsProps = {
  items: RecentMovement[]
  status: DashboardStatus
}

export function RecentMovements({ items, status }: RecentMovementsProps) {
  const isLoading = status === 'loading'
  return (
    <section className="dashboard-card recent-movements-card">
      <div className="section-heading">
        <div>
          <h2>Movimentacoes recentes</h2>
        </div>
      </div>

      <div className="movement-list">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <article className="movement-item" key={index}>
              <div className="movement-icon is-muted" />
              <div>
                <i className="skeleton-line skeleton-title" />
                <i className="skeleton-line skeleton-text" />
              </div>
              <i className="skeleton-line skeleton-meta" />
            </article>
          ))}

        {status === 'error' && (
          <div className="recent-movements-state is-error" role="alert">
            <ClipboardList size={24} aria-hidden="true" />
            <div>
              <strong>Não foi possível carregar as movimentações.</strong>
              <p>Tente atualizar a página.</p>
            </div>
          </div>
        )}

        {status === 'success' && items.length === 0 && (
          <div className="recent-movements-state">
            <ClipboardList size={24} aria-hidden="true" />
            <div>
              <strong>Nenhuma movimentação ainda</strong>
              <p>As atividades realizadas no sistema aparecerão aqui.</p>
            </div>
          </div>
        )}

        {status === 'success' && items.map((item, index) => {
          const Icon = item.icon

          return (
            <article className="movement-item" key={`${item.title}-${index}`}>
              <div className={`movement-icon tone-${item.tone}`}>
                <Icon size={17} aria-hidden="true" />
              </div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <div className="movement-meta">
                <strong>{item.meta}</strong>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
