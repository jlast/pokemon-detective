import { useState, type FormEvent } from 'react'
import { submitGeneralFeedback, type GeneralFeedbackPayload } from '../api'

type FeedbackStatus = 'idle' | 'saving' | 'submitted' | 'error'

const feedbackOptions: Array<{
  value: GeneralFeedbackPayload['feedbackType']
  label: string
  description: string
}> = [
  {
    value: 'bug',
    label: 'Bug report',
    description: 'Something broke, looks wrong, or blocked your investigation.',
  },
  {
    value: 'feature',
    label: 'Feature idea',
    description: 'A new clue, quality-of-life tweak, or bigger game idea.',
  },
]

export function FeedbackRoute() {
  const [feedbackType, setFeedbackType] = useState<GeneralFeedbackPayload['feedbackType']>('bug')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const canSubmit = message.trim().length > 0 && status !== 'saving'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setStatus('saving')
    try {
      await submitGeneralFeedback({
        feedbackType,
        message: message.trim(),
        contact: contact.trim() || undefined,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      })
      setStatus('submitted')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="main-layout-single">
      <section className="notebook-card feedback-page">
        <div className="feedback-page__header">
          <div>
            <p className="eyebrow">Detective dispatch</p>
            <h2>Bugs & ideas</h2>
            <p className="subtle-text">Send a bug report or feature idea directly to the case desk.</p>
          </div>
          <span className="feedback-page__stamp" aria-hidden="true">Open file</span>
        </div>

        {status === 'submitted' ? (
          <div className="feedback-page__submitted" role="status">
            <strong>Report filed.</strong>
            <p>Thanks. Your note is in the evidence locker.</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setMessage('')
                setContact('')
                setStatus('idle')
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <fieldset className="feedback-form__types">
              <legend>What are you sending?</legend>
              {feedbackOptions.map((option) => (
                <label key={option.value} className={`feedback-type-card ${feedbackType === option.value ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="feedbackType"
                    value={option.value}
                    checked={feedbackType === option.value}
                    onChange={() => setFeedbackType(option.value)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <label className="feedback-form__field">
              <span>{feedbackType === 'bug' ? 'What went wrong?' : 'What should be added?'}</span>
              <textarea
                value={message}
                maxLength={2000}
                rows={7}
                placeholder={feedbackType === 'bug'
                  ? 'Tell us what happened, what you expected, and where you were in the case.'
                  : 'Describe the idea and why it would make PokéMystery better.'}
                required
                onChange={(event) => setMessage(event.target.value)}
              />
              <small>{message.length}/2000</small>
            </label>

            <label className="feedback-form__field">
              <span>Optional contact</span>
              <input
                type="text"
                value={contact}
                maxLength={250}
                placeholder="Email, Reddit username, or Discord handle"
                onChange={(event) => setContact(event.target.value)}
              />
            </label>

            <div className="feedback-form__actions">
              <button className="primary-button" type="submit" disabled={!canSubmit}>
                {status === 'saving' ? 'Filing report...' : 'Submit report'}
              </button>
              {status === 'error' ? (
                <span className="feedback-form__error" role="status">Could not submit. Try again?</span>
              ) : null}
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
