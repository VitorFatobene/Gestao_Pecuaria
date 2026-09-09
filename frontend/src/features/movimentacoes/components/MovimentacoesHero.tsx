import movimentacoesHero from '../../../assets/images/movimentacoes-hero.jpg'
import { PageHero } from '../../../components/PageHero'

export function MovimentacoesHero() {
  return (
    <PageHero
      label="Controle de permanência"
      title="Movimentações do rebanho"
      description="Acompanhe a entrada, saída e o tempo de permanência dos animais em cada pasto."
      image={movimentacoesHero}
    />
  )
}
