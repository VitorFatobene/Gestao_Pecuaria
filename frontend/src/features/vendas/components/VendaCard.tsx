import { CalendarDays, CircleDollarSign, Scale } from 'lucide-react'
import { type Venda } from '../types/venda.types'

type VendaCardProps = {
  venda: Venda
}

const numberFormatter = new Intl.NumberFormat('pt-BR')
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function VendaCard({ venda }: VendaCardProps) {
  return (
    <article className="venda-card">
      <div className="venda-card-header">
        <div>
          <span>Venda #{venda.id}</span>
          <h2>Animal {venda.codigoAnimal}</h2>
        </div>
        <strong>{currencyFormatter.format(venda.valorVenda)}</strong>
      </div>

      <dl className="venda-card-facts">
        <div>
          <dt>Comprador</dt>
          <dd>{venda.nomeComprador}</dd>
        </div>
        <div>
          <dt>
            <CalendarDays size={14} aria-hidden="true" />
            Data
          </dt>
          <dd>{dateFormatter.format(new Date(`${venda.dataVenda}T00:00:00Z`))}</dd>
        </div>
        <div>
          <dt>
            <Scale size={14} aria-hidden="true" />
            Peso
          </dt>
          <dd>{numberFormatter.format(venda.pesoKgVenda)} kg</dd>
        </div>
        <div>
          <dt>
            <CircleDollarSign size={14} aria-hidden="true" />
            Arroba
          </dt>
          <dd>{numberFormatter.format(venda.pesoArrobaVenda)} @</dd>
        </div>
      </dl>
    </article>
  )
}
