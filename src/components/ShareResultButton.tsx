import { useState } from 'react'
import { trackEvent } from '../analytics'

const FALLBACK_SHARE_URL = 'https://pokemon-detective.com/today'

const getShareUrl = () => {
  if (typeof window === 'undefined') return FALLBACK_SHARE_URL
  return `${window.location.origin}/today`
}

const buildShareLines = ({
  caseId,
  isSolved,
  playerGuessCount,
  caseStreak,
}: {
  caseId: string
  isSolved: boolean
  playerGuessCount?: number
  caseStreak: number
}) => {
  const lines = [`Pokémon Detective #${caseId}`]

  if (isSolved && playerGuessCount != null) {
    lines.push(`Solved in ${playerGuessCount} ${playerGuessCount === 1 ? 'guess' : 'guesses'}`)
  } else if (isSolved) {
    lines.push('Case solved today')
  } else {
    lines.push('Case unsolved today')
  }

  if (caseStreak > 0) {
    lines.push(`Streak: ${caseStreak}`)
  }

  return [...lines, '', 'Can you solve today\'s case?']
}

interface ShareResultButtonProps {
  caseId: string
  isSolved: boolean
  playerGuessCount?: number
  caseStreak: number
}

export function ShareResultButton({
  caseId,
  isSolved,
  playerGuessCount,
  caseStreak,
}: ShareResultButtonProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle')
  const shareAnalyticsParams = {
    case_id: caseId,
    case_status: isSolved ? 'solved' : 'failed',
    guesses: playerGuessCount,
    streak_days: caseStreak > 0 ? caseStreak : undefined,
  }

  const copyShareText = async (shareText: string) => {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(shareText)
    trackEvent('share_result_copied', shareAnalyticsParams)
    setShareStatus('copied')
  }

  const getSharePayload = () => {
    const shareUrl = getShareUrl()
    const lines = buildShareLines({
      caseId,
      isSolved,
      playerGuessCount,
      caseStreak,
    })

    return {
      nativeText: [...lines, shareUrl].join('\n'),
      clipboardText: [...lines, shareUrl].join('\n'),
    }
  }

  const handleShareResult = async () => {
    const { nativeText, clipboardText } = getSharePayload()

    trackEvent('share_result_clicked', shareAnalyticsParams)
    setShareStatus('sharing')

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Pokémon Detective',
          text: nativeText,
        })
        trackEvent('share_result_native_opened', shareAnalyticsParams)
        setShareStatus('idle')
        return
      }

      await copyShareText(clipboardText)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setShareStatus('idle')
        return
      }

      try {
        await copyShareText(clipboardText)
      } catch {
        setShareStatus('error')
      }
    }
  }

  return (
    <>
      <button
        className="case-share-button"
        type="button"
        aria-label="Share result"
        title="Share result"
        onClick={handleShareResult}
        disabled={shareStatus === 'sharing'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M18 16.1c-.76 0-1.44.3-1.96.77L8.91 12.7a3.3 3.3 0 0 0 0-1.39l7.05-4.13A2.99 2.99 0 1 0 15 5c0 .23.03.45.08.66L8.03 9.79a3 3 0 1 0 0 4.42l7.12 4.18c-.04.19-.06.4-.06.61a2.91 2.91 0 1 0 2.91-2.9Z" />
        </svg>
        <span className="sr-only">{shareStatus === 'sharing' ? 'Sharing result' : 'Share result'}</span>
      </button>

      {shareStatus === 'copied' ? <span className="case-share-status" role="status">Copied result!</span> : null}
      {shareStatus === 'error' ? <span className="case-share-status case-share-status--error" role="status">Could not share. Try again?</span> : null}
    </>
  )
}
