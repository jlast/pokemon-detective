import { useState } from 'react'
import { pokemonData } from '../../data/pokemon'

export function WitnessLineup({ pokemonIds }: { pokemonIds: number[] }) {
  const [flipped] = useState(() => new Set(pokemonIds.filter(() => Math.random() < 0.5)))
  const witnesses = [...new Set(pokemonIds)].map(id => pokemonData.find(pokemon => pokemon.id === id))
    .filter(pokemon => pokemon !== undefined)
  return <div className="location-game-art">
    <div className="case-witness-scene" role="img" aria-label={`Case witnesses: ${witnesses.map(pokemon => pokemon.name).join(', ')}`}>
      <div className="case-witness-scene__backdrop" aria-hidden="true" />
      <div className="case-witness-scene__group" aria-hidden="true">
        {witnesses.map(pokemon => <span className="case-witness-scene__pokemon" key={pokemon.id}>
          <img src={pokemon.sprite} alt="" width="96" height="96" draggable={false}
            style={{ transform: flipped.has(pokemon.id) ? 'scaleX(-1)' : undefined }} />
        </span>)}
      </div>
    </div>
  </div>
}
