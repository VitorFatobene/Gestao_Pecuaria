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
        <h1>Gestão de pastos</h1>
        <p>
          Veja ocupação, permanência e rotação para decidir o próximo manejo com segurança.
        </p>
        <button type="button" className="pasture-hero-action" onClick={onCreatePasture}>
          <Plus size={18} aria-hidden="true" />
          <span>Cadastrar pasto</span>
        </button>
      </div>
    </section>
  )
}
