import type { AppData, ThemePreference } from '../types'

export function SettingsPage({
  theme,
  onTheme,
  onExport,
  onImport,
  onClear,
  data,
}: {
  theme: ThemePreference
  onTheme: (theme: ThemePreference) => void
  onExport: () => void
  onImport: (file: File, mode: 'merge' | 'replace') => void
  onClear: () => void
  data: AppData
}) {
  return (
    <div className="page-stack">
      <section className="glass page-section">
        <p className="eyebrow">Theme</p>
        <h2>Choose your look</h2>
        <div className="chip-row">
          {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => (
            <button key={option} className={`chip ${theme === option ? 'selected' : ''}`} onClick={() => onTheme(option)}>
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="glass page-section">
        <p className="eyebrow">Data</p>
        <h2>Export or import</h2>
        <div className="action-row wrap">
          <button className="primary-button" onClick={onExport}>Export JSON</button>
          <label className="primary-button secondary upload-button">
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const mode = window.confirm('Choose OK to merge with current data. Choose Cancel to replace everything.') ? 'merge' : 'replace'
                onImport(file, mode)
                event.currentTarget.value = ''
              }}
            />
          </label>
        </div>
        <p className="muted">Current snapshot: {data.habits.length} habits, {data.checkIns.length} check-ins.</p>
      </section>

      <section className="glass page-section">
        <p className="eyebrow">Reset</p>
        <h2>Clear all data</h2>
        <p className="muted">There is a double confirmation before anything is removed.</p>
        <button className="ghost-button danger" onClick={onClear}>Clear everything</button>
      </section>

      <section className="glass page-section">
        <p className="eyebrow">About</p>
        <h2>Streakless</h2>
        <p className="muted">Version 1.0.0 · A habit tracker built around consistency, momentum, and low-pressure recovery.</p>
      </section>
    </div>
  )
}
