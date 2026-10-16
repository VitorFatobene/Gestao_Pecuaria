import { type ReactNode } from 'react'

export type FieldRequirement = 'required' | 'optional' | 'calculated'

const labels: Record<FieldRequirement, string> = {
  required: 'Obrigatório',
  optional: 'Opcional',
  calculated: 'Calculado automaticamente',
}

export function FieldRequirementBadge({ type }: { type: FieldRequirement }) {
  return <span className={`field-requirement-badge field-requirement-badge--${type}`}>{labels[type]}</span>
}

export function FieldLabel({ children, requirement }: { children: ReactNode; requirement: FieldRequirement }) {
  return <span className="field-label-with-requirement"><span>{children}</span><FieldRequirementBadge type={requirement} /></span>
}

export function FieldRequirementLegend() {
  return (
    <aside className="field-requirement-legend" aria-label="Como preencher este formulário">
      <p>Preencha os campos marcados como obrigatório.</p>
      <div>
        <FieldRequirementBadge type="required" />
        <FieldRequirementBadge type="optional" />
        <FieldRequirementBadge type="calculated" />
      </div>
    </aside>
  )
}
