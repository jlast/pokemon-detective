import type { ReminderPreferencesResponse } from '../api'

interface SettingsRouteProps {
  authed: boolean
  reminderPreferences: ReminderPreferencesResponse
  reminderStatus: 'idle' | 'loading' | 'saving' | 'error'
  onLogin: () => void
  onUpdateReminderPreferences: (preferences: ReminderPreferencesResponse) => void
}

export function SettingsRoute({
  authed,
  reminderPreferences,
  reminderStatus,
  onLogin,
  onUpdateReminderPreferences,
}: SettingsRouteProps) {
  const reminderDisabled = reminderStatus === 'loading' || reminderStatus === 'saving'

  if (!authed) {
    return (
      <div className="main-layout-single">
        <section className="notebook-card settings-page settings-page--signed-out">
          <p className="eyebrow">Detective settings</p>
          <h2>Email reminders</h2>
          <p className="subtle-text">Sign in to manage case reminder emails.</p>
          <button type="button" className="primary-button" onClick={onLogin}>Sign in to continue</button>
        </section>
      </div>
    )
  }

  return (
    <div className="main-layout-single">
      <section className="notebook-card settings-page">
        <div className="settings-page__header">
          <div>
            <p className="eyebrow">Detective settings</p>
            <h2>Email reminders</h2>
            <p className="subtle-text">Choose which PokeMystery emails arrive in your inbox.</p>
          </div>
          <span className="settings-page__stamp" aria-hidden="true">Mail desk</span>
        </div>

        <div className="settings-page__cards" aria-busy={reminderDisabled}>
          <label className="reminder-settings-card settings-page__reminder-card">
            <span className="reminder-settings-card__icon" aria-hidden="true">Mail</span>
            <span className="reminder-settings-card__copy">
              <strong>Daily case reminder</strong>
              <small>Get an email when a new daily case is available.</small>
            </span>
            <span className="reminder-settings-card__control">
              <input
                className="reminder-settings-card__input"
                type="checkbox"
                checked={reminderPreferences.dailyReminderEmails}
                disabled={reminderDisabled}
                onChange={(event) => onUpdateReminderPreferences({
                  ...reminderPreferences,
                  dailyReminderEmails: event.currentTarget.checked,
                })}
              />
              <span className="reminder-settings-card__switch" aria-hidden="true" />
            </span>
          </label>

          <label className="reminder-settings-card settings-page__reminder-card">
            <span className="reminder-settings-card__icon" aria-hidden="true">8h</span>
            <span className="reminder-settings-card__copy">
              <strong>Unfinished case reminder</strong>
              <small>Get an email 8 hours before the day ends if today's case is not done.</small>
            </span>
            <span className="reminder-settings-card__control">
              <input
                className="reminder-settings-card__input"
                type="checkbox"
                checked={reminderPreferences.unfinishedCaseReminderEmails}
                disabled={reminderDisabled}
                onChange={(event) => onUpdateReminderPreferences({
                  ...reminderPreferences,
                  unfinishedCaseReminderEmails: event.currentTarget.checked,
                })}
              />
              <span className="reminder-settings-card__switch" aria-hidden="true" />
            </span>
          </label>

          <label className="reminder-settings-card settings-page__reminder-card">
            <span className="reminder-settings-card__icon" aria-hidden="true">News</span>
            <span className="reminder-settings-card__copy">
              <strong>News and updates</strong>
              <small>Get occasional emails about new PokeMystery features and releases.</small>
            </span>
            <span className="reminder-settings-card__control">
              <input
                className="reminder-settings-card__input"
                type="checkbox"
                checked={reminderPreferences.newsAndUpdatesEmails}
                disabled={reminderDisabled}
                onChange={(event) => onUpdateReminderPreferences({
                  ...reminderPreferences,
                  newsAndUpdatesEmails: event.currentTarget.checked,
                })}
              />
              <span className="reminder-settings-card__switch" aria-hidden="true" />
            </span>
          </label>
        </div>

        {reminderStatus === 'error' ? (
          <p className="settings-page__error" role="status">Could not save reminder settings.</p>
        ) : null}
      </section>
    </div>
  )
}
