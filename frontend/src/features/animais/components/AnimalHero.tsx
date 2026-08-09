import { Plus } from 'lucide-react'
import { type CSSProperties } from 'react'
import heroBackground from '../../../assets/images/animals-hero.jpg'

type AnimalHeroProps = {
  onCreateAnimal: () => void
}

type AnimalHeroStyle = CSSProperties & {
  '--animals-hero-image': string
}

export function AnimalHero({ onCreateAnimal }: AnimalHeroProps) {
  return (
    <section
      className="animal-hero"
      style={{ '--animals-hero-image': `url(${heroBackground})` } as AnimalHeroStyle}
    >
      <div className="animal-hero-content">
        <span>Rebanho</span>
        <h1>Gestao de animais</h1>
        <p>Gerencie o cadastro, compra, localizacao e o status dos animais da sua fazenda.</p>
        <button type="button" className="animal-hero-action" onClick={onCreateAnimal}>
          <Plus size={18} aria-hidden="true" />
          <span>Cadastrar animal</span>
        </button>
      </div>
    </section>
  )
}
