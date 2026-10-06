import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  ReceiptText,
  WalletCards,
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
  const profitStatus = getProfitStatus(resumo.saldoRealizado)
  const ProfitIcon = profitStatus.icon

  return (
    <section className="financeiro-summary-grid" aria-label="Resumo financeiro principal">
      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-revenue">
          <Banknote size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Recebido</span>
          <strong>{currencyFormatter.format(resumo.receitasRealizadas)}</strong>
          <p>Pagamentos de vendas quitados</p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-pending">
          <WalletCards size={20} aria-hidden="true" />
        </div>
        <div>
          <span>A receber</span>
          <strong>{currencyFormatter.format(resumo.receitasAReceber)}</strong>
          <p>Parcelas de vendas pendentes</p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-expense">
          <ReceiptText size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Pago</span>
          <strong>{currencyFormatter.format(resumo.despesasRealizadas)}</strong>
          <p>Parcelas de contas quitadas</p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-expense">
          <ReceiptText size={20} aria-hidden="true" />
        </div>
        <div>
          <span>A pagar</span>
          <strong>{currencyFormatter.format(resumo.despesasAPagar)}</strong>
          <p>{currencyFormatter.format(resumo.despesasVencidas)} vencidos</p>
        </div>
      </article>

      <article className={`financeiro-summary-card profit-card ${profitStatus.className}`}>
        <div className="financeiro-summary-icon">
          <CircleDollarSign size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Saldo realizado</span>
          <strong>{currencyFormatter.format(resumo.saldoRealizado)}</strong>
          <p>
            <ProfitIcon size={15} aria-hidden="true" />
            Caixa confirmado
          </p>
        </div>
      </article>

      <article className="financeiro-summary-card">
        <div className="financeiro-summary-icon is-sales">
          <CircleDollarSign size={20} aria-hidden="true" />
        </div>
        <div>
          <span>Saldo projetado</span>
          <strong>{currencyFormatter.format(resumo.saldoProjetado)}</strong>
          <p>Inclui pendências a receber e pagar</p>
        </div>
      </article>
    </section>
  )
}
