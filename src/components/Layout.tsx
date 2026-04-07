import type { Page } from '../types'

const tabs: Array<{ id: Page; label: string; icon: string }> = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'habits', label: 'Habits', icon: '🪴' },
  { id: 'stats', label: 'Stats', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export function Layout({
  page,
  onChange,
  children,
}: {
  page: Page
  onChange: (page: Page) => void
  children: React.ReactNode
}) {
  return (
    <div className="shell">
      <aside className="sidebar glass">
        <div>
          <div className="brand-mark">✨</div>
          <h1>Streakless</h1>
          <p className="muted">Momentum over pressure. Consistency over guilt.</p>
        </div>
        <nav className="nav-stack" aria-label="Primary">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-button ${page === tab.id ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">{children}</main>

      <nav className="bottom-nav glass" aria-label="Bottom navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-tab ${page === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
