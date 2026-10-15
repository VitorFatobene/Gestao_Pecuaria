import { formatarArrobas, formatarPesoKg } from '../utils/peso'

type WeightDisplayProps = {
  pesoKg: unknown
  className?: string
  emptyLabel?: string
}

export function WeightDisplay({ pesoKg, className, emptyLabel = 'Peso não informado' }: WeightDisplayProps) {
  const pesoFormatado = formatarPesoKg(pesoKg)
  const arrobasFormatadas = formatarArrobas(pesoKg)

  if (!pesoFormatado || !arrobasFormatadas) {
    return <span className={className}>{emptyLabel}</span>
  }

  return (
    <span className={`weight-display${className ? ` ${className}` : ''}`}>
      <span className="weight-display-primary">{pesoFormatado}</span>
      <span className="weight-display-secondary">{arrobasFormatadas}</span>
    </span>
  )
}
