import { Beef, CircleDollarSign, ShoppingCart } from 'lucide-react'
import { type MovimentacaoRecente } from '../types/dashboard.types'

type RecentMovementsProps = {
  items: MovimentacaoRecente[]
}

const movementIcons = {
  COMPRA: CircleDollarSign,
  TROCA_PASTO: Beef,
  VENDA: ShoppingCart,
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

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
        {items.map((item, index) => {
          const Icon = movementIcons[item.tipo as keyof typeof movementIcons] ?? Beef

          return (
            <article className="movement-item" key={`${item.tipo}-${item.data}-${index}`}>
              <div className="movement-icon">
                <Icon size={17} aria-hidden="true" />
              </div>
              <div>
                <strong>{formatMovementTitle(item.tipo)}</strong>
                <p>{item.descricao}</p>
              </div>
              <div className="movement-meta">
                <span>{formatDate(item.data)}</span>
                {item.valor != null && <strong>{currencyFormatter.format(item.valor)}</strong>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function formatMovementTitle(tipo: string) {
  const titles: Record<string, string> = {
    COMPRA: 'Compra registrada',
    TROCA_PASTO: 'Troca de pasto',
    VENDA: 'Venda registrada',
  }

  return titles[tipo] ?? 'Movimentacao'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T00:00:00`))
}
