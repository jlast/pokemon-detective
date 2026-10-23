import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { backfillPuzzleHistory, getPuzzleHistory, type PuzzleHistoryItem, type PuzzleHistoryResponse } from '../api'
import { TODAY_PATH } from '../paths'
import { pokemonData } from '../data/pokemon'

interface HistoryRouteProps {
  authed: boolean
  onLogin: () => void
}

const emptyHistory: PuzzleHistoryResponse = {
  items: [],
  solvedCount: 0,
  failedCount: 0,
  unsolvedCount: 0,
  currentStreak: 0,
}

const getCaseDateKey = (caseId: string): string => {
  const dateKey = caseId.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : caseId
}

const isDailyDifficultyCaseId = (caseId: string): boolean => /^\d{4}-\d{2}-\d{2}-(easy|hard)$/.test(caseId)
const isLegacyDailyCaseId = (caseId: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(caseId)

const formatCaseDate = (dateKey: string): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return dateKey
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date)
}

const getGroupedHistoryItems = (items: PuzzleHistoryItem[]) => {
  const groups = new Map<string, PuzzleHistoryItem[]>()

  for (const item of items.filter((item) => isDailyDifficultyCaseId(item.caseId) || isLegacyDailyCaseId(item.caseId))) {
    const dateKey = getCaseDateKey(item.caseId)
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), item])
  }

  return [...groups.entries()].map(([dateKey, items]) => ({
    dateKey,
    items: [...(items.some((item) => isDailyDifficultyCaseId(item.caseId))
      ? items.filter((item) => isDailyDifficultyCaseId(item.caseId))
      : items
    )].sort((left, right) => {
      const difficultyOrder = { easy: 0, hard: 1 }
      const leftOrder = difficultyOrder[left.difficulty as keyof typeof difficultyOrder] ?? 2
      const rightOrder = difficultyOrder[right.difficulty as keyof typeof difficultyOrder] ?? 2
      return leftOrder - rightOrder
    }),
  }))
}

const formatDifficulty = (difficulty: string | undefined): string => (
  difficulty ? difficulty[0].toUpperCase() + difficulty.slice(1) : 'Unknown'
)

const getDifficultyClassName = (difficulty: string | undefined): string => {
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') return `history-difficulty--${difficulty}`
  return 'history-difficulty--unknown'
}

const getStatusLabel = (status: 'playing' | 'solved' | 'failed') => {
  if (status === 'playing') return 'Unsolved'
  return status === 'solved' ? 'Solved' : 'Failed'
}

const getCaseActionLabel = (status: 'playing' | 'solved' | 'failed') => (
  status === 'solved' || status === 'failed' ? 'View debrief' : 'Play case'
)

export function HistoryRoute({ authed, onLogin }: HistoryRouteProps) {
  const [history, setHistory] = useState<PuzzleHistoryResponse>(emptyHistory)
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

    void getPuzzleHistory()
      .then((data) => {
        if (!cancelled) setHistory(data)
        void (async () => {
          try {
            for (let attempt = 0; attempt < 30; attempt += 1) {
              const backfill = await backfillPuzzleHistory()
              if (cancelled || backfill.generatedCaseIds.length === 0) return

              const history = await getPuzzleHistory()
              if (cancelled) return
              setHistory(history)

              if (backfill.complete) return
            }
          } catch (err) {
            console.error('Failed to backfill puzzle history:', err)
          }
        })()
      })
      .catch((err) => {
        console.error('Failed to load puzzle history:', err)
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
        <section className="history-page case-archive history-empty-state">
          <h2>Archived cases</h2>
          <p className="subtle-text">
            Sign in to revisit your cases and their evidence.
          </p>
          <button type="button" className="primary-button" onClick={onLogin}>
            Sign in
          </button>
        </section>
      </div>
    )
  }

  const historyGroups = getGroupedHistoryItems(history.items)

  return (
    <div className="main-layout-single">
      <section className="history-page case-archive">
        <div className="history-header">
          <div>
            <h2>Archived cases</h2>
          </div>
        </div>

        {loading ? (
          <p className="archive-message" role="status">Opening the archive…</p>
        ) : error ? (
          <p className="archive-message" role="alert">Could not open your archive right now. Please try again.</p>
        ) : historyGroups.length === 0 ? (
          <div className="archive-message">
            <p>No cases filed yet.</p>
            <Link className="history-card__play" to={TODAY_PATH}>Open today’s case <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
          <div className="history-list">
            {historyGroups.map((group) => (
              <article key={group.dateKey} className="history-day-card">
                <header className="history-day-card__date">
                  <h3>{formatCaseDate(group.dateKey)}</h3>
                </header>
                <div className="history-day-card__cases">
                  {group.items.map((item) => {
                    const culprit = item.status !== 'playing' && item.culpritPokemonId
                      ? pokemonData.find(pokemon => pokemon.id === item.culpritPokemonId) : undefined
                    return <div key={item.caseId} className={`history-case-row history-case-row--${item.status}`}>
                      <div className={`archive-portrait${culprit ? '' : ' archive-portrait--file'}`} aria-hidden="true">
                        <img src={culprit?.sprite ?? '/clue-sprites/journal.png'} alt="" width="64" height="64" loading="lazy" />
                      </div>
                      <div className="history-card__body">
                        <h4>{item.caseTitle}</h4>
                        {item.status !== 'playing' && item.culpritPokemonName ? (
                          <p>Culprit: {item.culpritPokemonName}</p>
                        ) : null}
                        <div className="archive-case-details">
                          <span className={`archive-difficulty ${getDifficultyClassName(item.difficulty)}`}>{formatDifficulty(item.difficulty)}</span>
                          <span className="archive-status">{getStatusLabel(item.status)}</span>
                        </div>
                      </div>
                      <Link
                        className={`history-card__play ${item.status === 'playing' ? 'history-card__play--case' : 'history-card__play--debrief'}`}
                        to={`${TODAY_PATH}?case=${encodeURIComponent(item.caseId)}`}
                        aria-label={`${getCaseActionLabel(item.status)}: ${item.caseTitle}`}
                      >
                        {getCaseActionLabel(item.status)} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
