import { PackagePlus } from 'lucide-react'
import lotesHero from '../../../assets/images/lotes-hero.jpg'
import { PageHero } from '../../../components/PageHero'

type LotesHeroProps = {
  onCreateLote: () => void
}

export function LotesHero({ onCreateLote }: LotesHeroProps) {
  return (
    <PageHero
      label="Organização do rebanho"
      title="Gestão de lotes"
      description="Organize grupos de animais para manejo, acompanhamento e preparação para venda."
      image={lotesHero}
      action={
        <button type="button" className="page-hero-action" onClick={onCreateLote}>
          <PackagePlus size={18} aria-hidden="true" />
          <span>Criar lote</span>
        </button>
      }
    />
  )
}
