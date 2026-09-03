import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { backfillPuzzleHistory, getPuzzleHistory, type PuzzleHistoryItem, type PuzzleHistoryResponse } from '../api'
import { TODAY_PATH } from '../paths'

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
  const navigate = useNavigate()
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
        void backfillPuzzleHistory()
          .then((backfill) => {
            if (cancelled || backfill.generatedCaseIds.length === 0) return
            return getPuzzleHistory().then((data) => {
              if (!cancelled) setHistory(data)
            })
          })
          .catch((err) => console.error('Failed to backfill puzzle history:', err))
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
        <section className="notebook-card history-page history-empty-state">
          <p className="eyebrow">Case archive</p>
          <h2>Sign in to save puzzle history</h2>
          <p className="subtle-text">
            Completed cases are linked to your detective profile so you can review your solve record later.
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
      <section className="notebook-card history-page">
        <div className="history-header">
          <div>
            <p className="eyebrow">Case archive</p>
            <h2>Puzzle history</h2>
            <p className="subtle-text">
              Review previous daily puzzles saved to your detective profile.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="placeholder-page">Loading case archive...</p>
        ) : error ? (
          <p className="placeholder-page">Could not load your puzzle history right now.</p>
        ) : historyGroups.length === 0 ? (
          <p className="placeholder-page">No archived cases yet. Open today's puzzle to start your archive.</p>
        ) : (
          <div className="history-list">
            {historyGroups.map((group) => (
              <article key={group.dateKey} className="history-day-card">
                <header className="history-day-card__date">
                  <span>{formatCaseDate(group.dateKey)}</span>
                </header>
                <div className="history-day-card__cases">
                  {group.items.map((item) => (
                    <div key={item.caseId} className={`history-case-row history-case-row--${item.status}`}>
                      <div className="history-card__body">
                        <h3>{item.caseTitle}</h3>
                        {item.culpritPokemonId && item.culpritPokemonName ? (
                          <p>
                            Culprit: <strong>{item.culpritPokemonName}</strong>
                          </p>
                        ) : item.status !== 'playing' ? (
                          <p>Legacy record saved before detailed history was available.</p>
                        ) : null}
                      </div>
                      <div className="history-card__meta" aria-label={`${item.caseTitle} details`}>
                        <span className={`history-difficulty ${getDifficultyClassName(item.difficulty)}`}>{formatDifficulty(item.difficulty)}</span>
                        <span className="history-status">{getStatusLabel(item.status)}</span>
                        <button
                          type="button"
                          className={`history-card__play ${item.status === 'playing' ? 'history-card__play--case' : 'history-card__play--debrief'}`}
                          onClick={() => navigate(`${TODAY_PATH}?case=${encodeURIComponent(item.caseId)}`)}
                        >
                          {getCaseActionLabel(item.status)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
