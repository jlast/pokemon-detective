import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getPokedex, type PokedexResponse } from '../api'
import { EvidenceBadgeList } from '../components/Evidence/EvidenceBadge'
import { getShinySpriteUrl, pokemonData } from '../data/pokemon'
import { TODAY_PATH } from '../paths'

type PokedexFilter = 'seen' | 'unlocked' | 'shiny'

interface PokedexRouteProps {
  authed: boolean
  onLogin: () => void
}

export function PokedexRoute({ authed, onLogin }: PokedexRouteProps) {
  const [pokedex, setPokedex] = useState<PokedexResponse>({
    seenPokemonIds: [], unlockedPokemonIds: [], seenShinyPokemonIds: [], unlockedShinyPokemonIds: [],
  })
  const [loading, setLoading] = useState(authed)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<PokedexFilter | null>('seen')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!authed) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(false)
    void getPokedex()
      .then(data => { if (!cancelled) setPokedex(data) })
      .catch(err => {
        console.error('Failed to load Pokedex:', err)
        if (!cancelled) setError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [authed, retry])

  if (!authed) {
    return <div className="main-layout-single">
      <section className="pokedex-page pokedex-binder pokedex-binder--closed">
        <div className="pokedex-binder__rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="pokedex-binder__empty">
          <h2>Pokédex</h2>
          <p>Sign in to save Pokémon from completed cases.</p>
          <button type="button" className="primary-button" onClick={onLogin}>Sign in to open your Pokédex</button>
        </div>
      </section>
    </div>
  }

  const seenIds = new Set(pokedex.seenPokemonIds)
  const unlockedIds = new Set(pokedex.unlockedPokemonIds)
  const seenShinyIds = new Set(pokedex.seenShinyPokemonIds)
  const unlockedShinyIds = new Set(pokedex.unlockedShinyPokemonIds)
  const registeredPokemon = pokemonData.filter(pokemon => seenIds.has(pokemon.id) || unlockedIds.has(pokemon.id)
    || seenShinyIds.has(pokemon.id) || unlockedShinyIds.has(pokemon.id))
  const shinyCount = new Set([...seenShinyIds, ...unlockedShinyIds]).size
  const counts = { seen: seenIds.size, unlocked: unlockedIds.size, shiny: shinyCount }
  const statFilteredPokemon = activeFilter === 'seen' ? registeredPokemon.filter(pokemon => seenIds.has(pokemon.id))
    : activeFilter === 'unlocked' ? registeredPokemon.filter(pokemon => unlockedIds.has(pokemon.id))
    : activeFilter === 'shiny' ? registeredPokemon.filter(pokemon => seenShinyIds.has(pokemon.id) || unlockedShinyIds.has(pokemon.id))
    : registeredPokemon
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredPokemon = normalizedSearchTerm
    ? statFilteredPokemon.filter(pokemon => pokemon.name.toLowerCase().includes(normalizedSearchTerm)) : statFilteredPokemon
  const clearFilters = () => { setSearchTerm(''); setActiveFilter(null) }

  return <div className="main-layout-single">
    <section className="pokedex-page pokedex-binder" aria-labelledby="pokedex-binder-title">
      <div className="pokedex-binder__rings" aria-hidden="true"><span /><span /><span /></div>
      <header className="pokedex-binder__header">
        <h2 id="pokedex-binder-title">Pokédex</h2>
        <span>{unlockedIds.size} unlocked</span>
      </header>
      <div className="pokedex-binder__toolbar">
        <div className="pokedex-binder__filters" role="group" aria-label="Filter Pokédex records">
          <button type="button" data-filter="all" aria-pressed={activeFilter === null} onClick={() => setActiveFilter(null)}>All <span>{registeredPokemon.length}</span></button>
          {(['seen', 'unlocked', 'shiny'] as const).map(filter => <button key={filter} type="button" data-filter={filter}
            aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>
            {filter[0].toUpperCase() + filter.slice(1)} <span>{counts[filter]}</span>
          </button>)}
        </div>
        <label className="pokedex-binder__search">
          <span className="sr-only">Search Pokémon by name</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
          <input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)}
            placeholder="Find a Pokémon…" autoComplete="off" />
        </label>
      </div>

      {loading ? <div className="pokedex-binder__empty" role="status">
        <img src="/clue-sprites/journal.png" width="56" height="56" alt="" />
        <p>Loading Pokédex…</p>
      </div> : error ? <div className="pokedex-binder__empty" role="alert">
        <p>Could not open your Pokédex right now.</p>
        <button className="secondary-button" type="button" onClick={() => setRetry(value => value + 1)}>Try again</button>
      </div> : registeredPokemon.length === 0 ? <div className="pokedex-binder__empty">
        <img src="/clue-sprites/wide-lens.png" width="64" height="64" alt="" />
        <h3>No Pokémon registered yet.</h3>
        <p>Complete a case to add Pokémon.</p>
        <Link className="primary-button" to={TODAY_PATH}>Open today’s case <span aria-hidden="true">→</span></Link>
      </div> : filteredPokemon.length === 0 ? <div className="pokedex-binder__empty">
        <h3>{normalizedSearchTerm ? 'No matching records.' : 'No records here yet.'}</h3>
        <p>{activeFilter === 'shiny' && !normalizedSearchTerm ? 'No shiny encounters recorded yet.' : 'Try a different name or collection filter.'}</p>
        <button className="secondary-button" type="button" onClick={clearFilters}>Show all records</button>
      </div> : <>
        <p className="sr-only" role="status">{filteredPokemon.length} {filteredPokemon.length === 1 ? 'record' : 'records'}</p>
        <div className="pokedex-grid">
          {filteredPokemon.map((pokemon, index) => {
            const unlocked = unlockedIds.has(pokemon.id)
            const shinySeen = unlockedShinyIds.has(pokemon.id) || seenShinyIds.has(pokemon.id)
            return <div key={pokemon.id} className="pokedex-binder__pocket"><article style={{ '--photo-tilt': `${[-.8, .6, -.4, .8, -.6, .4][index % 6]}deg` } as CSSProperties} className={`pokedex-card${unlocked ? ' is-unlocked' : ' is-seen'}${shinySeen ? ' is-shiny' : ''}`}>
              <div className="pokedex-card__sprite-frame">
                {shinySeen ? <span className="pokedex-card__shiny-mark" aria-label="Shiny encounter">Shiny</span> : null}
                <img className="pokedex-card__sprite" src={shinySeen ? getShinySpriteUrl(pokemon.id) : pokemon.sprite}
                  alt={`${shinySeen ? 'Shiny ' : ''}${pokemon.name}`} width="112" height="112" loading="lazy" decoding="async" />
                <span className="pokedex-card__status">{unlocked ? 'Unlocked' : 'Seen'}</span>
              </div>
              <div className="pokedex-card__body">
                <div className="pokedex-card__name"><h3>{pokemon.name}</h3><span className="pokedex-card__number">#{String(pokemon.id).padStart(3, '0')}</span></div>
                {unlocked ? <>
                  <EvidenceBadgeList badges={pokemon.types.map(type => ({ text: type[0].toUpperCase() + type.slice(1), type }))} />
                  <p className="pokedex-card__region">{pokemon.region}</p>
                </> : <p className="pokedex-card__locked">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                  Record locked
                </p>}
              </div>
            </article></div>
          })}
        </div>
      </>}
    </section>
  </div>
}
