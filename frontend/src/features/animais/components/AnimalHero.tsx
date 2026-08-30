import { PackagePlus, Plus } from 'lucide-react'
import { type CSSProperties } from 'react'
import heroBackground from '../../../assets/images/animals-hero.jpg'

type AnimalHeroProps = {
  onCreateAnimal: () => void
  onCreateLote: () => void
}

type AnimalHeroStyle = CSSProperties & {
  '--animals-hero-image': string
}

export function AnimalHero({ onCreateAnimal, onCreateLote }: AnimalHeroProps) {
  return (
    <section
      className="animal-hero"
      style={{ '--animals-hero-image': `url(${heroBackground})` } as AnimalHeroStyle}
    >
      <div className="animal-hero-content">
        <span>Rebanho</span>
        <h1>Gestão de animais</h1>
        <p>Consulte cadastro, compra, localização e status do rebanho com rapidez.</p>
        <div className="animal-hero-actions">
          <button type="button" className="animal-hero-action" onClick={onCreateAnimal}>
            <Plus size={18} aria-hidden="true" />
            <span>Cadastrar animal</span>
          </button>
          <button type="button" className="animal-hero-action" onClick={onCreateLote}>
            <PackagePlus size={18} aria-hidden="true" />
            <span>Criar lote</span>
          </button>
        </div>
      </div>
    </section>
  )
}
