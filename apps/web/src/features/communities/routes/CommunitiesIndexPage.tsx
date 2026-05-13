export function CommunitiesIndexPage() {
  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">Frontend scaffold</span>
        <h1 className="section-title">Community discovery starts here</h1>
        <p className="section-copy">
          Typed contract wiring, auth bootstrapping, and real community data are the next
          slice on top of this shell.
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">Planned frontend routes</h2>
        <ul className="checklist">
          <li>Authentication and session bootstrap</li>
          <li>Community index and detail pages</li>
          <li>Board feeds, post detail, and comments</li>
          <li>Moderation and account polish</li>
        </ul>
      </section>
    </>
  )
}
