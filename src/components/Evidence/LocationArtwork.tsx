import { useEffect, useRef, useState } from 'react'

import { LocationVignette } from './LocationVignette'
import { getLocationVignette } from './locationVignettes'
import { chooseLocationScene, locationSceneNames, type LocationSceneId } from './locationArtworkSelection'

const assets = new Map<string, Promise<{ image: HTMLImageElement; map: DataView }>>()
function loadScene(scene: string) {
  let asset = assets.get(scene)
  if (!asset) {
    asset = Promise.all([
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error(`Location artwork missing: ${scene}`))
        image.src = `/location-art/${scene}/tiles.png`
      }),
      fetch(`/location-art/${scene}/tilemap.bin`).then(async response => {
        if (!response.ok) throw new Error(`Location tilemap missing: ${scene}`)
        return new DataView(await response.arrayBuffer())
      }),
    ]).then(([image, map]) => ({ image, map })).catch(error => {
      assets.delete(scene)
      throw error
    })
    assets.set(scene, asset)
  }
  return asset
}

export function LocationArtwork({ name, context = '', scene, className = '' }: {
  name: string; context?: string; scene?: LocationSceneId; className?: string
}) {
  const composition = getLocationVignette(name, context)
  const isComposition = composition !== null
  const slug = scene ?? chooseLocationScene(name, context)
  const source = locationSceneNames[slug]
  const canvas = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (isComposition) return
    let cancelled = false
    setFailed(false)
    void loadScene(slug).then(({ image, map }) => {
      if (cancelled) return
      const ctx = canvas.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, 240, 112)
      ctx.imageSmoothingEnabled = false
      const columns = image.width / 8
      // The actual scene is rows 3–16; rows 0–2 and 17–19 are the game title frame.
      for (let y = 3; y < 17; y++) for (let x = 0; x < 30; x++) {
        const entry = map.getUint16((y * 32 + x) * 2, true)
        const tile = entry & 0x3ff
        const flipX = Boolean(entry & 0x400), flipY = Boolean(entry & 0x800)
        ctx.save()
        ctx.translate(x * 8 + (flipX ? 8 : 0), (y - 3) * 8 + (flipY ? 8 : 0))
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
        ctx.drawImage(image, (tile % columns) * 8, Math.floor(tile / columns) * 8, 8, 8, 0, 0, 8, 8)
        ctx.restore()
      }
    }).catch(error => {
      if (!cancelled) { console.error(error); setFailed(true) }
    })
    return () => { cancelled = true }
  }, [slug, isComposition])
  if (composition) return <LocationVignette name={name} composition={composition} className={className} />
  return <div className={`location-game-art ${className}`} title={`${source} · Pokémon FireRed/LeafGreen`}>
    <canvas ref={canvas} width="240" height="112" role="img" aria-label={`Location illustration for ${name}: ${source}`} />
    {failed ? <span className="location-game-art__error">Location artwork unavailable</span> : null}
  </div>
}
