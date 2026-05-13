import { Link, NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Pulseboard</p>
          <Link className="brand-link" to="/communities">
            Communities with momentum
          </Link>
          <p className="hero-copy">
            Discover groups, join conversations, and keep meaningful work moving.
          </p>
        </div>
        <nav className="topbar-actions nav-links" aria-label="Primary">
          <NavLink className="secondary-button nav-link" to="/communities">
            Communities
          </NavLink>
          <NavLink className="secondary-button nav-link" to="/login">
            Log in
          </NavLink>
          <NavLink className="primary-button nav-link" to="/register">
            Create account
          </NavLink>
        </nav>
      </header>

      <main className="content-grid">
        <Outlet />
      </main>
    </div>
  )
}
