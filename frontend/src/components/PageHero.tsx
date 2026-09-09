import { type CSSProperties, type ReactNode } from 'react'

type PageHeroProps = {
  label: string
  title: string
  description: string
  image: string
  action?: ReactNode
  className?: string
}

type PageHeroStyle = CSSProperties & {
  '--page-hero-image': string
}

export function PageHero({ label, title, description, image, action, className }: PageHeroProps) {
  const classes = ['page-hero', className].filter(Boolean).join(' ')

  return (
    <section className={classes} style={{ '--page-hero-image': `url(${image})` } as PageHeroStyle}>
      <div className="page-hero-content">
        <span>{label}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {action && <div className="page-hero-actions">{action}</div>}
      </div>
    </section>
  )
}
