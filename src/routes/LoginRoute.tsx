interface LoginRouteProps {
  onLogin: () => void
}

export function LoginRoute({ onLogin }: LoginRouteProps) {
  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-note-card">
          <div className="login-note-card__tape" aria-hidden="true"></div>
          <h2 className="login-note-card__title">Save your detective progress</h2>
          <p className="login-note-card__desc">
            Sign in to keep your investigation available across devices.
          </p>

          <button type="button" className="google-login-button" onClick={onLogin}>
            <svg className="google-login-logo" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <p className="login-security-note">
            Your progress is securely linked to your Google account.
          </p>
        </div>

        <aside className="login-benefits-note">
          <h3 className="login-benefits-note__title">Why sign in?</h3>

          <div className="benefit-list">
            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#439663" />
                </svg>
              </span>
              <div>
                <strong>Save your case</strong>
                <span>Keep your current investigation, actions, and progress.</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#439663" />
                </svg>
              </span>
              <div>
                <strong>Keep evidence</strong>
                <span>Your discovered clues stay attached to your account.</span>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#439663" />
                </svg>
              </span>
              <div>
                <strong>Continue anywhere</strong>
                <span>Resume the same case on another device.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
