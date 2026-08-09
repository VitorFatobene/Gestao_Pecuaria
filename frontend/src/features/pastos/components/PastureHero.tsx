import { Plus } from 'lucide-react'
import { type CSSProperties } from 'react'
import heroBackground from '../../../assets/images/pastos-hero.jpg'

type PastureHeroProps = {
  onCreatePasture: () => void
}

type PastureHeroStyle = CSSProperties & {
  '--pasture-hero-image': string
}

export function PastureHero({ onCreatePasture }: PastureHeroProps) {
  return (
    <section
      className="pasture-hero"
      style={{ '--pasture-hero-image': `url(${heroBackground})` } as PastureHeroStyle}
    >
      <div className="pasture-hero-content">
        <span>Manejo</span>
        <h1>Gestao de pastos</h1>
        <p>
          Planeje e acompanhe o uso dos pastos para garantir o melhor aproveitamento da pastagem e o bem-estar do
          rebanho.
        </p>
        <button type="button" className="pasture-hero-action" onClick={onCreatePasture}>
          <Plus size={18} aria-hidden="true" />
          <span>Cadastrar pasto</span>
        </button>
      </div>
    </section>
  )
}
