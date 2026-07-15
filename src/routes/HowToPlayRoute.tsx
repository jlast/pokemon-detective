const playSteps = [
  {
    title: 'Read the case file',
    body: 'Start with the scene report and the suspect lineup. The culprit is one of the listed Pokemon, and the story gives you the first hints about what to investigate.',
  },
  {
    title: 'Search locations',
    body: 'Open the investigation board, choose a location, then pick one action. Each search spends one investigation and may reveal evidence, witness notes, or a dead end.',
  },
  {
    title: 'Inspect suspects',
    body: 'Compare clues against each suspect file. Check appearance, records, habitat, and ability notes, then mark Pokemon as suspect or ruled out as your theory changes.',
  },
  {
    title: 'Make an accusation',
    body: 'When the evidence points to one Pokemon, accuse them from their suspect file. You have three attempts, so use your notes before committing.',
  },
]

const detectiveTips = [
  'Evidence usually clears more suspects than it condemns. Look for Pokemon that do not fit the clue.',
  'A dead-end search still teaches you where the answer probably is not.',
  'Use ruled-out markers aggressively. They make the final accusation much safer.',
  'Login to keep Pokedex progress across cases. Failed cases mark Pokemon as seen; solved cases unlock full records.',
]

export function HowToPlayRoute() {
  return (
    <div className="main-layout-single">
      <section className="notebook-card how-to-play-page">
        <div className="how-to-play-hero">
          <div>
            <p className="eyebrow">Field manual</p>
            <h2>How to play</h2>
            <p className="subtle-text">
              Pokemon Detective is a daily deduction case. Search the scene, cross-check clues, and identify the culprit before your accusation attempts run out.
            </p>
          </div>

          <div className="how-to-play-case-note" aria-label="Case limits">
            <span className="how-to-play-case-note__label">Remember</span>
            <strong>Investigations are limited.</strong>
            <span>Every location action matters. Gather enough proof before you accuse.</span>
          </div>
        </div>

        <div className="how-to-play-steps" aria-label="How to play steps">
          {playSteps.map((step, index) => (
            <article key={step.title} className="how-to-play-step">
              <span className="how-to-play-step__number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="how-to-play-tips">
          <div>
            <p className="eyebrow">Detective habits</p>
            <h3>How to solve more cases</h3>
          </div>
          <ul>
            {detectiveTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
