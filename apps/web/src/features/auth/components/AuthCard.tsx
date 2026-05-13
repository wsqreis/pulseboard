export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="panel hero-panel full-width-panel auth-panel">
      <span className="status-pill">{eyebrow}</span>
      <h1 className="section-title">{title}</h1>
      <p className="section-copy auth-copy">{description}</p>
      <div className="auth-form-shell">{children}</div>
    </section>
  )
}
