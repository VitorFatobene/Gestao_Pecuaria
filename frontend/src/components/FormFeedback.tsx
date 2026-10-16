import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export type FormFeedbackType = 'error' | 'success' | 'warning' | 'info'

type FormFeedbackProps = {
  type: FormFeedbackType
  title: string
  message: ReactNode
}

const icons = { error: AlertCircle, success: CheckCircle2, warning: TriangleAlert, info: Info }

/** Feedback rendered in the form flow, immediately before its action area. */
export function FormFeedback({ type, title, message }: FormFeedbackProps) {
  const Icon = icons[type]

  return (
    <aside className={`form-feedback form-feedback--${type}`} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}>
      <Icon size={21} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </aside>
  )
}
