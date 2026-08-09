import { type RecentMovement } from '../dashboard.types'

type RecentMovementsProps = {
  items: RecentMovement[]
  isLoading?: boolean
}

export function RecentMovements({ items, isLoading = false }: RecentMovementsProps) {
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

        {!isLoading && items.map((item, index) => {
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
