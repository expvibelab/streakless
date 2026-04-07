import { useMemo, useState } from 'react'
import { completedOnDate, habitMomentum, missedConsecutiveDays } from '../lib/metrics'
import { toDateKey } from '../lib/date'
import type { CheckIn, Habit, LastAction } from '../types'
import { StatCard } from '../components/StatCard'

const groups = ['Morning', 'Afternoon', 'Evening', 'Anytime'] as const

export function TodayPage({
  habits,
  checkIns,
  overallConsistency,
  monthTotal,
  todayDone,
  todayTotal,
  onCheckIn,
  onUndo,
  lastAction,
}: {
  habits: Habit[]
  checkIns: CheckIn[]
  overallConsistency: number
  monthTotal: number
  todayDone: number
  todayTotal: number
  onCheckIn: (habitId: string, note?: string) => void
  onUndo: () => void
  lastAction: LastAction | null
}) {
  const [openNote, setOpenNote] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const today = toDateKey(new Date())

  const nudges = useMemo(
    () => habits.filter((habit) => missedConsecutiveDays(habit, checkIns) >= 3),
    [habits, checkIns],
  )

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard title="Today's progress" value={`${todayDone}/${todayTotal || 0}`} detail="Small wins still count." />
        <StatCard title="Rolling consistency" value={`${Math.round(overallConsistency * 100)}%`} detail="Average over the last 30 days." />
        <StatCard title="This month" value={`${monthTotal}`} detail="Total check-ins so far." />
      </section>

      {nudges.length > 0 && (
        <section className="glass banner">
          <p className="eyebrow">Gentle nudge</p>
          <strong>{nudges[0].emoji} {nudges[0].name}</strong>
          <p className="muted">It has been quiet for a few days. A small version still counts today.</p>
        </section>
      )}

      {groups.map((group) => {
        const items = habits.filter((habit) => habit.timeOfDay === group)
        if (!items.length) return null
        return (
          <section key={group} className="page-section">
            <div className="section-header">
              <div>
                <p className="eyebrow">{group}</p>
                <h2>{group} habits</h2>
              </div>
            </div>
            <div className="habit-list">
              {items.map((habit) => {
                const done = completedOnDate(checkIns, habit.id, today)
                const momentum = habitMomentum(habit, checkIns)
                return (
                  <article key={habit.id} className={`glass today-card ${done ? 'done' : ''}`} style={{ '--habit-color': habit.color } as React.CSSProperties}>
                    <div className="today-row">
                      <div>
                        <p className="habit-emoji">{habit.emoji}</p>
                        <h3>{habit.isNegative ? `Day without ${habit.name}` : habit.name}</h3>
                        <p className="muted">Momentum {Math.round(momentum * 100)}%</p>
                      </div>
                      <button className={`check-button ${done ? 'checked' : ''}`} onClick={() => onCheckIn(habit.id, notes[habit.id])}>
                        {done ? 'Shown up' : 'Check in'}
                      </button>
                    </div>
                    <div className="today-actions">
                      <button className="text-button" onClick={() => setOpenNote(openNote === habit.id ? null : habit.id)}>
                        {openNote === habit.id ? 'Hide note' : 'Add note'}
                      </button>
                    </div>
                    {openNote === habit.id && (
                      <textarea
                        value={notes[habit.id] ?? ''}
                        placeholder="Optional note for today"
                        onChange={(event) => setNotes((prev) => ({ ...prev, [habit.id]: event.target.value }))}
                      />
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

      {habits.length === 0 && (
        <section className="glass empty-state">
          <h2>No habits yet. Start with something small.</h2>
          <p className="muted">Create one habit on the Habits page, then come back here to start showing up.</p>
        </section>
      )}

      {lastAction && (
        <button className="undo-fab" onClick={onUndo}>Undo last check-in</button>
      )}
    </div>
  )
}
