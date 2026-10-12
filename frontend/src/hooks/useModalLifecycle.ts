import { useEffect, useRef } from 'react'

let activeBodyScrollLocks = 0
let previousBodyOverflow = ''
let previousDocumentOverflow = ''

export function useModalLifecycle(onClose: () => void) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (activeBodyScrollLocks === 0) {
      previousBodyOverflow = document.body.style.overflow
      previousDocumentOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
    }

    activeBodyScrollLocks += 1

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      activeBodyScrollLocks = Math.max(activeBodyScrollLocks - 1, 0)

      if (activeBodyScrollLocks === 0) {
        document.body.style.overflow = previousBodyOverflow
        document.documentElement.style.overflow = previousDocumentOverflow
        previousBodyOverflow = ''
        previousDocumentOverflow = ''
      }
    }
  }, [])
}
