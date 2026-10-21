export function PuzzleLoading({ archived = false }: { archived?: boolean }) {
  return <section className="notebook-card puzzle-loading" aria-busy="true" aria-labelledby="puzzle-loading-title">
    <div className="puzzle-loading__illustration" aria-hidden="true">
      <div className="puzzle-loading__folder" />
      <div className="puzzle-loading__paper"><span>CASE FILE</span><i /><i /><i />
        <b>CONFIDENTIAL</b></div>
      <img src="/clue-sprites/wide-lens.png" alt="" width="80" height="80" />
    </div>
    <span className="puzzle-loading__eyebrow">PokéMystery investigation bureau</span>
    <h2 id="puzzle-loading-title">{archived ? 'Reopening the case file' : 'A new mystery awaits'}</h2>
    <p className="puzzle-loading__description">Gathering the report. Lining up the suspects.</p>
    <div className="puzzle-loading__status" role="status">
      <span className="puzzle-loading__dots" aria-hidden="true"><i /><i /><i /></span>
      {archived ? 'Loading archived puzzle…' : 'Loading today’s puzzle…'}
    </div>
    <div className="puzzle-loading__files" aria-hidden="true">
      {[0, 1, 2].map(index => <div className="puzzle-loading__file" key={index}><span /><i /><i /></div>)}
    </div>
  </section>
}
