import { Link } from 'react-router-dom'

export function CommunitiesIndexPage() {
  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">Public entry</span>
        <h1 className="section-title">Community discovery starts here</h1>
        <p className="section-copy">
          The app now has live auth entry routes and a session shell, ready for the next
          slice of real community data.
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">Start with the right flow</h2>
        <ul className="checklist">
          <li>Create an account and enter the app immediately</li>
          <li>Verify email and recover passwords from dedicated routes</li>
          <li>Return to community discovery after session bootstrap</li>
          <li>Move next into live communities, boards, posts, and comments</li>
        </ul>
        <div className="inline-links">
          <Link className="text-link" to="/register">
            Create account
          </Link>
          <Link className="text-link" to="/login">
            Log in
          </Link>
        </div>
      </section>
    </>
  )
}
