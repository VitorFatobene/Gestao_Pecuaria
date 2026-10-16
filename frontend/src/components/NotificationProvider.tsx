import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

type Kind = 'success' | 'error' | 'warning' | 'info'
type Toast = { id: number; kind: Kind; title: string; message: string }
type NotificationContextValue = { notify: (kind: Kind, title: string, message: string) => void }
const NotificationContext = createContext<NotificationContextValue | null>(null)
const icons = { success: CheckCircle2, error: AlertCircle, warning: TriangleAlert, info: Info }

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])
  const notify = useCallback((kind: Kind, title: string, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, kind, title, message }].slice(-4))
    window.setTimeout(() => dismiss(id), kind === 'error' ? 7500 : 4000)
  }, [dismiss])
  return <NotificationContext.Provider value={{ notify }}>{children}{createPortal(<div className="toast-stack">{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />)}</div>, document.body)}</NotificationContext.Provider>
}
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) { const Icon = icons[toast.kind]; return <aside className={`app-toast app-toast--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><Icon aria-hidden="true" size={21}/><div><strong>{toast.title}</strong><p>{toast.message}</p></div><button onClick={onClose} type="button" aria-label="Fechar notificação"><X size={16}/></button></aside> }
export function useNotification() { const value = useContext(NotificationContext); if (!value) throw new Error('useNotification deve ser usado dentro de NotificationProvider'); return value }
