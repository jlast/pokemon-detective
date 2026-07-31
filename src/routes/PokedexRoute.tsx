import { useEffect, useState } from 'react'
import { getPokedex, type PokedexResponse } from '../api'
import { getShinySpriteUrl, pokemonData } from '../data/pokemon'

type PokedexFilter = 'seen' | 'unlocked' | 'shiny'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<PokedexFilter | null>('seen')

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
          <p className="eyebrow">Pokédex archive</p>
          <h2>Sign in to track your discoveries</h2>
          <p className="subtle-text">
            Pokemon are marked seen or unlocked only after completed cases, so your Pokédex needs an account.
          </p>
          <button type="button" className="primary-button" onClick={onLogin}>
            Sign in
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
  const registeredPokemon = pokemonData.filter((pokemon) => (
    seenIds.has(pokemon.id) ||
    unlockedIds.has(pokemon.id) ||
    seenShinyIds.has(pokemon.id) ||
    unlockedShinyIds.has(pokemon.id)
  ))
  const statFilteredPokemon = activeFilter === 'seen'
    ? registeredPokemon.filter((pokemon) => seenIds.has(pokemon.id))
    : activeFilter === 'unlocked'
      ? registeredPokemon.filter((pokemon) => unlockedIds.has(pokemon.id))
      : activeFilter === 'shiny'
        ? registeredPokemon.filter((pokemon) => seenShinyIds.has(pokemon.id) || unlockedShinyIds.has(pokemon.id))
        : registeredPokemon
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredPokemon = normalizedSearchTerm
    ? statFilteredPokemon.filter((pokemon) => pokemon.name.toLowerCase().includes(normalizedSearchTerm))
    : statFilteredPokemon

  const toggleFilter = (filter: PokedexFilter) => {
    setActiveFilter((currentFilter) => currentFilter === filter ? null : filter)
  }

  return (
    <div className="main-layout-single">
      <section className="notebook-card pokedex-page">
        <div className="pokedex-header">
          <div>
            <p className="eyebrow">Pokédex archive</p>
            <h2>Case discoveries</h2>
            <p className="subtle-text">
              Failed cases mark Pokemon as seen. Solved cases unlock their full records.
            </p>
          </div>
          <div className="pokedex-stats" aria-label="Pokédex filters">
            <button
              type="button"
              className={activeFilter === 'seen' ? 'is-active' : undefined}
              aria-pressed={activeFilter === 'seen'}
              onClick={() => toggleFilter('seen')}
            >
              {seenCount} seen
            </button>
            <button
              type="button"
              className={activeFilter === 'unlocked' ? 'is-active' : undefined}
              aria-pressed={activeFilter === 'unlocked'}
              onClick={() => toggleFilter('unlocked')}
            >
              {unlockedCount} unlocked
            </button>
            <button
              type="button"
              className={activeFilter === 'shiny' ? 'is-active' : undefined}
              aria-pressed={activeFilter === 'shiny'}
              onClick={() => toggleFilter('shiny')}
            >
              {shinyCount} shiny
            </button>
          </div>
        </div>

        <label className="pokedex-search">
          <span>Search by name</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search Pokemon"
            autoComplete="off"
          />
        </label>

        {loading ? (
          <p className="placeholder-page">Loading Pokédex records...</p>
        ) : error ? (
          <p className="placeholder-page">Could not load your Pokédex right now.</p>
        ) : registeredPokemon.length === 0 ? (
          <p className="placeholder-page">No Pokemon registered yet. Complete a case to add Pokemon to your Pokédex.</p>
        ) : filteredPokemon.length === 0 ? (
          <p className="placeholder-page">{normalizedSearchTerm ? 'No Pokemon match your search.' : 'No Pokemon match this filter.'}</p>
        ) : (
          <div className="pokedex-grid">
            {filteredPokemon.map((pokemon) => {
              const unlocked = unlockedIds.has(pokemon.id)
              const seen = unlocked || seenIds.has(pokemon.id) || seenShinyIds.has(pokemon.id)
              const shinyUnlocked = unlockedShinyIds.has(pokemon.id)
              const shinySeen = shinyUnlocked || seenShinyIds.has(pokemon.id)
              const sprite = shinySeen ? getShinySpriteUrl(pokemon.id) : pokemon.sprite
              return (
                <article
                  key={pokemon.id}
                  className={`pokedex-card notebook-card${unlocked ? ' is-unlocked' : seen ? ' is-seen' : ' is-hidden'}${shinySeen ? ' is-shiny' : ''}`}
                >
                  <div className="pokedex-card__sprite-frame">
                    <img
                      className="pokedex-card__sprite"
                      src={sprite}
                      alt={`${shinySeen ? 'Shiny ' : ''}${unlocked ? pokemon.name : `${pokemon.name}, seen but locked`}`}
                    />
                  </div>
                  <div className="pokedex-card__body">
                    <span className="pokedex-card__number">#{String(pokemon.id).padStart(3, '0')}</span>
                    <h3>{pokemon.name}</h3>
                    {unlocked ? (
                      <>
                        <p>{pokemon.types.join(' / ')}</p>
                        <p>{pokemon.region}</p>
                      </>
                    ) : (
                      <p>{shinySeen ? 'Shiny seen' : 'Record locked'}</p>
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
