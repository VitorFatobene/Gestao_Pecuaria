import { Plus } from 'lucide-react'
import heroBackground from '../../../assets/images/pastos-hero.jpg'
import { PageHero } from '../../../components/PageHero'

type PastureHeroProps = {
  onCreatePasture: () => void
}

export function PastureHero({ onCreatePasture }: PastureHeroProps) {
  return (
    <PageHero
      label="Manejo"
      title="Gestão de pastos"
      description="Veja ocupação, permanência e rotação para decidir o próximo manejo com segurança."
      image={heroBackground}
      action={
        <button type="button" className="page-hero-action" onClick={onCreatePasture}>
          <Plus size={18} aria-hidden="true" />
          <span>Cadastrar pasto</span>
        </button>
      }
    />
  )
}
