import { useEffect, useRef, type ReactNode } from 'react'

export function BoardLocationDialog({ title, subtitle, onClose, children }: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
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
  return (
    <dialog ref={dialog} className="board-location-dialog" aria-labelledby="board-location-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="board-location-dialog__paper">
        <div className="board-location-dialog__heading">
          <div><span className="board-location-dialog__eyebrow">Location file</span>
            <h2 id="board-location-title">{title}</h2>
            {subtitle ? <p className="board-location-dialog__meta">{subtitle}</p> : null}</div>
          <button ref={close} type="button" className="board-location-dialog__close" onClick={onClose}
            aria-label="Close location and return to board">×</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
