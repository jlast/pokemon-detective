import type { LocationVignette as Vignette } from './locationVignettes'

export function LocationVignette({ name, composition, className = '' }: {
  name: string; composition: Vignette; className?: string
}) {
  const footprint = /gravel|quarry/i.test(name) ? 'claw-print' : 'paw-print'
  return <div className={`location-game-art ${className}`}>
    <div className={`location-vignette location-vignette--${composition.layout} location-vignette--${composition.palette}`}
      role="img" aria-label={`Close-up illustration of ${name}`}>
      <div className="location-vignette__wall" aria-hidden="true" />
      <div className="location-vignette__furniture" aria-hidden="true"><i /><i /><i /></div>
      {composition.layout === 'tracks' ? <div className="location-vignette__tracks" aria-hidden="true">
        {[0, 1, 2, 3].map(index => <span key={index} className={`location-vignette__footprint location-vignette__footprint--${index}`}>
          <img src={`/location-props/${footprint}.png`} width="32" height="32" alt="" draggable={false} />
        </span>)}
      </div> : null}
      {composition.sprites.map((sprite, index) => <img key={`${sprite}-${index}`} className={`location-vignette__prop location-vignette__prop--${index}`}
        src={`/clue-sprites/${sprite}.png`} width="48" height="48" alt="" aria-hidden="true" draggable={false} />)}
      {composition.layout === 'jar' ? <span className="location-vignette__crumbs" aria-hidden="true" /> : null}
    </div>
  </div>
}
