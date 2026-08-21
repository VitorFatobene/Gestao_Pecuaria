import { type LucideIcon } from 'lucide-react'

type ManejoResumoCardProps = {
  title: string
  value: string
  detail: string
  icon: LucideIcon
  isLoading?: boolean
}

export function ManejoResumoCard({ title, value, detail, icon: Icon, isLoading = false }: ManejoResumoCardProps) {
  return (
    <article className="manejo-resumo-card">
      <div className="manejo-resumo-icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <span>{title}</span>
        {isLoading ? <i className="skeleton-line skeleton-value" /> : <strong>{value}</strong>}
        {isLoading ? <i className="skeleton-line skeleton-text" /> : <p>{detail}</p>}
      </div>
    </article>
  )
}
