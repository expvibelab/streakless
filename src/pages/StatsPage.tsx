import { BarChart, Heatmap, TrendLine } from '../components/Charts'
import { consistencyTrend, heatmapData, milestoneState, monthlyBars } from '../lib/metrics'
import type { CheckIn, Habit } from '../types'

export function StatsPage({ habits, checkIns, selectedHabitId, onSelectHabit }: { habits: Habit[]; checkIns: CheckIn[]; selectedHabitId: string; onSelectHabit: (value: string) => void }) {
  const heatmap = heatmapData(habits, checkIns, selectedHabitId || undefined)
  const bars = monthlyBars(checkIns)
  const trend = consistencyTrend(habits, checkIns)
  const milestones = milestoneState(habits, checkIns)

  return (
    <div className="page-stack">
      <section className="glass page-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Stats</p>
            <h2>Consistency patterns</h2>
          </div>
          <label>
            <span className="sr-only">Choose habit for heatmap</span>
            <select value={selectedHabitId} onChange={(event) => onSelectHabit(event.target.value)}>
              <option value="">Overall</option>
              {habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}
            </select>
          </label>
        </div>
        {checkIns.length === 0 ? (
          <div className="empty-state plain">
            <h2>Your stats will appear here once you start tracking.</h2>
            <p className="muted">Each check-in adds a little more signal to your momentum story.</p>
          </div>
        ) : (
          <Heatmap data={heatmap} />
        )}
      </section>

      <section className="glass page-section">
        <p className="eyebrow">Monthly completions</p>
        <h2>Last 6 months</h2>
        <BarChart data={bars} />
      </section>

      <section className="glass page-section">
        <p className="eyebrow">Trend</p>
        <h2>Rolling 30-day consistency</h2>
        <TrendLine data={trend} />
      </section>

      <section className="glass page-section">
        <p className="eyebrow">Milestones</p>
        <h2>Momentum markers</h2>
        <div className="badge-grid">
          {milestones.map((milestone) => (
            <div key={milestone.label} className={`badge ${milestone.earned ? 'earned' : ''}`}>
              <strong>{milestone.earned ? 'Unlocked' : 'In progress'}</strong>
              <span>{milestone.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
