import { useEffect, useId, useRef, type ReactNode } from 'react'

export function BoardLocationDialog({ title, subtitle, onClose, children, closeLabel = 'Close location and return to board', className = '' }: {
  title: string
  closeLabel?: string
  className?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    close.current?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])
  useEffect(() => { if (dialog.current) dialog.current.scrollTop = 0 }, [title])
  return (
    <dialog ref={dialog} className={`board-location-dialog ${className}`} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="board-location-dialog__paper">
        <div className="board-location-dialog__heading">
          <div>            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p className="board-location-dialog__meta">{subtitle}</p> : null}</div>
          <button ref={close} type="button" className="board-location-dialog__close" onClick={onClose}
            aria-label={closeLabel}>×</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
