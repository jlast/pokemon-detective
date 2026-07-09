interface LoginRouteProps {
  onLogin: () => void
}

export function LoginRoute({ onLogin }: LoginRouteProps) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon" aria-hidden="true">
          <span className="hat"></span>
          <span className="glass"></span>
        </div>
        <h1 className="login-title">Pokemon Detective</h1>
        <p className="login-subtitle">Sign in to save your progress</p>
        <button type="button" className="login-google-button" onClick={onLogin}>
          <span className="login-google-icon">G</span>
          Login with Google
        </button>
        <p className="login-note">
          Your progress is saved to your account so you can continue on any device.
        </p>
      </div>
    </div>
  )
}
