import { Beef, Map, PowerOff, Tag, UsersRound } from 'lucide-react'
import { type FinanceiroResumo } from '../types/financeiro.types'

type AnimalStatusSummaryProps = {
  resumo: FinanceiroResumo
}

export function AnimalStatusSummary({ resumo }: AnimalStatusSummaryProps) {
  const items = [
    {
      label: 'Animais Cadastrados',
      value: resumo.totalAnimaisCadastrados,
      icon: Beef,
      className: 'is-total',
    },
    {
      label: 'Ativos',
      value: resumo.totalAnimaisAtivos,
      icon: UsersRound,
      className: 'is-active',
    },
    {
      label: 'Vendidos',
      value: resumo.totalAnimaisVendidos,
      icon: Tag,
      className: 'is-sold',
    },
    {
      label: 'Inativos',
      value: resumo.totalAnimaisInativos,
      icon: PowerOff,
      className: 'is-inactive',
    },
    {
      label: 'Total de Pastos',
      value: resumo.totalPastosCadastrados,
      icon: Map,
      className: 'is-pasture',
    },
  ]

  return (
    <section className="financeiro-panel">
      <div className="section-heading">
        <div>
          <h2>Resumo operacional</h2>
          <p>Animais e pastos considerados no consolidado</p>
        </div>
      </div>

      <div className="animal-status-summary-grid">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <article className="animal-status-summary-card" key={item.label}>
              <div className={`animal-status-summary-icon ${item.className}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value.toLocaleString('pt-BR')}</strong>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
