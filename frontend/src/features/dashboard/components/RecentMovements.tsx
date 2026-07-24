import { Beef, CircleDollarSign, ShoppingCart } from 'lucide-react'
import { type RecentMovement } from '../types/dashboard.types'

type RecentMovementsProps = {
  items: RecentMovement[]
}

const movementIcons = {
  animal: Beef,
  sale: ShoppingCart,
  finance: CircleDollarSign,
}

export function RecentMovements({ items }: RecentMovementsProps) {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <div>
          <h2>Movimentacoes recentes</h2>
          <p>Ultimas atualizacoes operacionais</p>
        </div>
      </div>

      <div className="movement-list">
        {items.map((item) => {
          const Icon = movementIcons[item.type]

          return (
            <article className="movement-item" key={item.id}>
              <div className="movement-icon">
                <Icon size={17} aria-hidden="true" />
              </div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <div className="movement-meta">
                <span>{item.date}</span>
                {item.amount && <strong>{item.amount}</strong>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
