import { Clock3, PawPrint } from 'lucide-react'
import { type AnimalPermanencia } from '../dashboard.types'

type AnimaisMaiorPermanenciaProps = {
  animais: AnimalPermanencia[]
  isLoading?: boolean
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function AnimaisMaiorPermanencia({ animais, isLoading = false }: AnimaisMaiorPermanenciaProps) {
  return (
    <section className="dashboard-card manejo-panel">
      <div className="section-heading">
        <div>
          <span>Manejo de pastagens</span>
          <h2>Animais com maior permanência</h2>
        </div>
      </div>

      <div className="manejo-animal-list">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <article className="manejo-animal-item" key={index}>
              <div className="manejo-item-icon is-muted" />
              <div>
                <i className="skeleton-line skeleton-title" />
                <i className="skeleton-line skeleton-text" />
              </div>
              <i className="skeleton-line skeleton-meta" />
            </article>
          ))}

        {!isLoading && animais.length === 0 && (
          <p className="manejo-empty">Nenhum animal em pasto atualmente.</p>
        )}

        {!isLoading &&
          animais.map((animal) => (
            <article className="manejo-animal-item" key={`${animal.codigoAnimal}-${animal.pasto}`}>
              <div className="manejo-item-icon">
                <PawPrint size={17} aria-hidden="true" />
              </div>
              <div>
                <strong>{animal.codigoAnimal}</strong>
                <p>{animal.pasto}</p>
              </div>
              <span className="manejo-days-badge">
                <Clock3 size={14} aria-hidden="true" />
                {formatDays(animal.diasNoPasto)}
              </span>
            </article>
          ))}
      </div>
    </section>
  )
}

function formatDays(days: number) {
  return days === 1 ? '1 dia' : `${numberFormatter.format(days)} dias`
}
