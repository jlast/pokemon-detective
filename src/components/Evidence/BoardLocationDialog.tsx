import { CloseIcon } from '../CloseIcon'
import { useEffect, useId, useRef, type ReactNode } from 'react'

export function BoardLocationDialog({ title, subtitle, onClose, children, footer, headerNavigation, closeLabel = 'Close location and return to board', className = '' }: {
  title: string
  closeLabel?: string
  className?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  headerNavigation?: ReactNode
}) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
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
  useEffect(() => {
    if (dialog.current) dialog.current.scrollTop = 0
    if (body.current) body.current.scrollTop = 0
  }, [title])
  return (
    <dialog ref={dialog} className={`board-location-dialog ${footer ? 'board-location-dialog--with-footer' : ''} ${className}`} aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="board-location-dialog__paper">
        <div className="board-location-dialog__heading">
          <div className="board-location-dialog__heading-copy"><h2 id={titleId}>{title}</h2>
            {headerNavigation}
            {subtitle ? <p className="board-location-dialog__meta">{subtitle}</p> : null}</div>
          <button ref={close} type="button" className="popup-close board-location-dialog__close" onClick={onClose}
            aria-label={closeLabel}><CloseIcon /></button>
        </div>
        <div ref={body} className="board-location-dialog__body">{children}</div>
        {footer ? <div className="board-location-dialog__footer">{footer}</div> : null}
      </div>
    </dialog>
  )
}
