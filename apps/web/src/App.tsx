export function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Pulseboard</p>
          <h1 className="hero-title">Communities with momentum</h1>
          <p className="hero-copy">
            Discover groups, join conversations, and keep meaningful work moving.
          </p>
        </div>
        <div className="topbar-actions">
          <button className="secondary-button" type="button">
            Log in
          </button>
          <button className="primary-button" type="button">
            Create account
          </button>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel hero-panel">
          <span className="status-pill">Backend ready</span>
          <h2 className="section-title">Frontend phase has started</h2>
          <p className="section-copy">
            The app shell is in place and ready for typed contract wiring, auth,
            communities, and discussion flows.
          </p>
        </section>

        <section className="panel">
          <h2 className="section-title">Next frontend slices</h2>
          <ul className="checklist">
            <li>Typed API client from the exported contract</li>
            <li>Authentication and session bootstrap</li>
            <li>Community and board navigation</li>
            <li>Post detail, comments, and moderation controls</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
