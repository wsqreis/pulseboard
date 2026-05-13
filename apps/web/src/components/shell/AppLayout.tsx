import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuthBootstrap } from '../../features/auth/useAuthBootstrap'
import { useAuthSession } from '../../features/auth/useAuthSession'

export function AppLayout() {
  const { clearSession, currentUser } = useAuthSession()
  const authBootstrap = useAuthBootstrap()

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
          {authBootstrap.isLoading ? <span className="inline-note">Loading session…</span> : null}
          {currentUser === null ? (
            <>
              <NavLink className="secondary-button nav-link" to="/login">
                Log in
              </NavLink>
              <NavLink className="primary-button nav-link" to="/register">
                Create account
              </NavLink>
            </>
          ) : (
            <>
              <span className="inline-note">{currentUser.display_name}</span>
              <button className="secondary-button nav-link" onClick={clearSession} type="button">
                Log out
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="content-grid">
        <Outlet />
      </main>
    </div>
  )
}
