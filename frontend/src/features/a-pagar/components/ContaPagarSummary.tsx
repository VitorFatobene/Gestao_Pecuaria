import { AlertTriangle, CalendarClock, CheckCircle2, WalletCards } from 'lucide-react'
import { type ContaPagarResumo } from '../types/contaPagar.types'
import { formatCurrency } from '../utils/contaPagarFormatters'

type ContaPagarSummaryProps = {
  resumo: ContaPagarResumo | null
  isLoading: boolean
}

export function ContaPagarSummary({ resumo, isLoading }: ContaPagarSummaryProps) {
  const cards = [
    {
      label: 'Total a pagar',
      value: resumo?.totalAPagar,
      helper: 'Parcelas em aberto',
      icon: WalletCards,
      tone: 'default',
    },
    {
      label: 'Vencido',
      value: resumo?.totalVencido,
      helper:
        resumo?.quantidadeVencidas === 1
          ? '1 parcela vencida'
          : `${resumo?.quantidadeVencidas ?? 0} parcelas vencidas`,
      icon: AlertTriangle,
      tone: 'danger',
    },
    {
      label: 'Próximos 7 dias',
      value: resumo?.totalProximos7Dias,
      helper: 'Vencimentos próximos',
      icon: CalendarClock,
      tone: 'warning',
    },
    {
      label: 'Pago neste mês',
      value: resumo?.totalPagoMesAtual,
      helper: 'Baixas registradas',
      icon: CheckCircle2,
      tone: 'success',
    },
  ] as const

  return (
    <section className="conta-pagar-summary-grid" aria-label="Resumo de contas a pagar">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article className={`conta-pagar-summary-card is-${card.tone}`} key={card.label}>
            <div className="conta-pagar-summary-icon">
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <span>{card.label}</span>
              {isLoading ? <i className="skeleton-line skeleton-value" /> : <strong>{formatCurrency(card.value)}</strong>}
              <p>{card.helper}</p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
