import type { ReactNode } from 'react'

interface PostItProps {
  title: string
  children: ReactNode
}

export function PostIt({ title, children }: PostItProps) {
  return (
    <section className="post-it-note" aria-labelledby="post-it-title">
      <strong id="post-it-title" className="post-it-title">
        {title}
      </strong>
      <div className="post-it-copy">{children}</div>
    </section>
  )
}
