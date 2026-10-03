function LoginPage({ loginForm, onFieldChange, onSubmit, loginError }) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">Caregiver access</p>
        <h1>Granny Recovery Tracker</h1>
        <p className="login-copy">
          A secure daily record for recovery observations, medication, and caregiver notes.
        </p>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="stacked-field">
            <span>Email</span>
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => onFieldChange('email', event.target.value)}
              placeholder="caregiver@example.com"
            />
          </label>

          <label className="stacked-field">
            <span>Password</span>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => onFieldChange('password', event.target.value)}
              placeholder="password123"
            />
          </label>

          {loginError && <p className="login-error">{loginError}</p>}

          <button type="submit" className="primary-button full-width">Sign in</button>
        </form>

        <div className="login-footer">
          <span>Demo account</span>
          <strong>caregiver@example.com</strong>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
