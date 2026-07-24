import { Link } from 'react-router-dom'
import { type QuickAction } from '../types/dashboard.types'

type QuickActionsProps = {
  items: QuickAction[]
}

export function QuickActions({ items }: QuickActionsProps) {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <div>
          <h2>Atalhos rapidos</h2>
          <p>Acesse tarefas frequentes</p>
        </div>
      </div>

      <div className="quick-actions">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link className="quick-action" key={item.label} to={item.path}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
