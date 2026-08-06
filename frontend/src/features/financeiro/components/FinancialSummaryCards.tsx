import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  ReceiptText,
  ShoppingCart,
} from 'lucide-react'
import { type FinanceiroResumo } from '../types/financeiro.types'

type FinancialSummaryCardsProps = {
  resumo: FinanceiroResumo
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function getProfitStatus(lucroTotal: number) {
  if (lucroTotal > 0) {
    return {
      className: 'is-positive',
      label: 'Lucro positivo',
      icon: ArrowUpRight,
    }
  }

  if (lucroTotal < 0) {
    return {
      className: 'is-negative',
      label: 'Prejuizo',
      icon: ArrowDownRight,
    }
  }

  return {
    className: 'is-neutral',
    label: 'Equilibrio financeiro',
    icon: ArrowRight,
  }
}

export function FinancialSummaryCards({ resumo }: FinancialSummaryCardsProps) {
  const profitStatus = getProfitStatus(resumo.lucroTotal)
  const ProfitIcon = profitStatus.icon

  return (
    <section className="financeiro-summary-grid" aria-label="Resumo financeiro principal">
      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-expense">
          <ReceiptText size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Total Gasto</span>
          <strong>{currencyFormatter.format(resumo.totalGasto)}</strong>
          <p>Compras, fretes e custos registrados</p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-revenue">
          <Banknote size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Ganho Total</span>
          <strong>{currencyFormatter.format(resumo.ganhoTotal)}</strong>
          <p>Receita acumulada com vendas</p>
        </div>
      </article>

      <article className={`financeiro-summary-card profit-card ${profitStatus.className}`}>
        <div className="financeiro-summary-icon">
          <CircleDollarSign size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Lucro Total</span>
          <strong>{currencyFormatter.format(resumo.lucroTotal)}</strong>
          <p>
            <ProfitIcon size={15} aria-hidden="true" />
            {profitStatus.label}
          </p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-sales">
          <ShoppingCart size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Vendas Realizadas</span>
          <strong>{resumo.totalVendasRealizadas.toLocaleString('pt-BR')}</strong>
          <p>Animais vendidos no periodo consolidado</p>
        </div>
      </article>
    </section>
  )
}
