import { CheckCircle2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

type NotificationPopupProps = {
  message: string
  onClose: () => void
}

export function NotificationPopup({ message, onClose }: NotificationPopupProps) {
  const [isClosing, setIsClosing] = useState(false)

  const closeWithFade = useCallback(() => {
    setIsClosing(true)
    window.setTimeout(onClose, 220)
  }, [onClose])

  useEffect(() => {
    const timeoutId = window.setTimeout(closeWithFade, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [closeWithFade])

  return (
    <aside className={`notification-popup${isClosing ? ' is-closing' : ''}`} role="status" aria-live="polite">
      <CheckCircle2 size={20} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" onClick={closeWithFade} aria-label="Fechar notificacao">
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  )
}
