export function StatCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <section className="glass stat-card">
      <p className="eyebrow">{title}</p>
      <h2>{value}</h2>
      <p className="muted">{detail}</p>
    </section>
  )
}
