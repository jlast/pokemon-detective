import { useEffect, useState } from 'react'
import { getPokedex, type PokedexResponse } from '../api'
import { getShinySpriteUrl, pokemonData } from '../data/pokemon'

interface PokedexRouteProps {
  authed: boolean
  onLogin: () => void
}

export function PokedexRoute({ authed, onLogin }: PokedexRouteProps) {
  const [pokedex, setPokedex] = useState<PokedexResponse>({
    seenPokemonIds: [],
    unlockedPokemonIds: [],
    seenShinyPokemonIds: [],
    unlockedShinyPokemonIds: [],
  })
  const [loading, setLoading] = useState(authed)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!authed) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    void getPokedex()
      .then((data) => {
        if (!cancelled) setPokedex(data)
      })
      .catch((err) => {
        console.error('Failed to load Pokedex:', err)
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authed])

  if (!authed) {
    return (
      <div className="main-layout-single">
        <section className="notebook-card pokedex-page pokedex-empty-state">
          <p className="eyebrow">Pokedex archive</p>
          <h2>Login to track your discoveries</h2>
          <p className="subtle-text">
            Pokemon are marked seen or unlocked only after completed cases, so your Pokedex needs an account.
          </p>
          <button type="button" className="primary-button" onClick={onLogin}>
            Login
          </button>
        </section>
      </div>
    )
  }

  const seenIds = new Set(pokedex.seenPokemonIds)
  const unlockedIds = new Set(pokedex.unlockedPokemonIds)
  const seenShinyIds = new Set(pokedex.seenShinyPokemonIds)
  const unlockedShinyIds = new Set(pokedex.unlockedShinyPokemonIds)
  const seenCount = seenIds.size
  const unlockedCount = unlockedIds.size
  const shinyCount = seenShinyIds.size

  return (
    <div className="main-layout-single">
      <section className="notebook-card pokedex-page">
        <div className="pokedex-header">
          <div>
            <p className="eyebrow">Pokedex archive</p>
            <h2>Case discoveries</h2>
            <p className="subtle-text">
              Failed cases mark Pokemon as seen. Solved cases unlock their full records.
            </p>
          </div>
          <div className="pokedex-stats" aria-label="Pokedex progress">
            <span>{seenCount} seen</span>
            <span>{unlockedCount} unlocked</span>
            <span>{shinyCount} shiny</span>
          </div>
        </div>

        {loading ? (
          <p className="placeholder-page">Loading Pokedex records...</p>
        ) : error ? (
          <p className="placeholder-page">Could not load your Pokedex right now.</p>
        ) : (
          <div className="pokedex-grid">
            {pokemonData.map((pokemon) => {
              const unlocked = unlockedIds.has(pokemon.id)
              const seen = unlocked || seenIds.has(pokemon.id)
              const shinyUnlocked = unlockedShinyIds.has(pokemon.id)
              const shinySeen = shinyUnlocked || seenShinyIds.has(pokemon.id)
              const sprite = shinySeen ? getShinySpriteUrl(pokemon.id) : pokemon.sprite
              return (
                <article
                  key={pokemon.id}
                  className={`pokedex-card notebook-card${unlocked ? ' is-unlocked' : seen ? ' is-seen' : ' is-hidden'}${shinySeen ? ' is-shiny' : ''}`}
                >
                  <div className="pokedex-card__sprite-frame">
                    {seen ? (
                      <img
                        className="pokedex-card__sprite"
                        src={sprite}
                        alt={`${shinySeen ? 'Shiny ' : ''}${unlocked ? pokemon.name : `${pokemon.name}, seen but locked`}`}
                      />
                    ) : (
                      <span className="pokedex-card__unknown" aria-hidden="true">?</span>
                    )}
                  </div>
                  <div className="pokedex-card__body">
                    <span className="pokedex-card__number">#{String(pokemon.id).padStart(3, '0')}</span>
                    <h3>{seen ? pokemon.name : 'Unknown'}</h3>
                    {unlocked ? (
                      <>
                        {shinyUnlocked ? <span className="pokedex-card__badge">Shiny registered</span> : null}
                        <p>{pokemon.types.join(' / ')}</p>
                        <p>{pokemon.region}</p>
                      </>
                    ) : seen ? (
                      <p>{shinySeen ? 'Shiny seen' : 'Record locked'}</p>
                    ) : (
                      <p>Not encountered</p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
