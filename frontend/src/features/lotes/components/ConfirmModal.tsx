import { AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ConfirmModalProps = {
  title: string
  message: string
  confirmLabel: string
  tone?: 'danger' | 'success'
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  tone = 'danger',
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  const modal = (
    <div className="animal-drawer-overlay" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon is-${tone}`}>
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <button type="button" className="modal-close-button" onClick={onCancel} aria-label="Fechar modal" disabled={isLoading}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <h2 id="confirm-modal-title">{title}</h2>
        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button type="button" className="secondary-action" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'danger-confirm-action' : 'primary-action'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
