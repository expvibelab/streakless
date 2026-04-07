import { useState } from 'react'
import { HabitForm } from '../components/HabitForm'
import { habitConsistency, habitMomentum } from '../lib/metrics'
import type { CheckIn, Habit } from '../types'

export function HabitsPage({
  habits,
  checkIns,
  onSave,
  onDelete,
  onTogglePause,
  onToggleArchive,
}: {
  habits: Habit[]
  checkIns: CheckIn[]
  onSave: (habit: Partial<Habit> & Omit<Habit, 'id' | 'createdAt' | 'paused' | 'archived'>) => void
  onDelete: (habitId: string) => void
  onTogglePause: (habitId: string) => void
  onToggleArchive: (habitId: string) => void
}) {
  const [editing, setEditing] = useState<Habit | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const activeHabits = habits.filter((habit) => !habit.archived)
  const archivedHabits = habits.filter((habit) => habit.archived)

  return (
    <div className="page-stack">
      <HabitForm
        editing={editing}
        onCancel={() => setEditing(null)}
        onSave={(habit) => {
          onSave(habit as Partial<Habit> & Omit<Habit, 'id' | 'createdAt' | 'paused' | 'archived'>)
          setEditing(null)
        }}
      />

      <section className="page-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Habits</p>
            <h2>All active habits</h2>
          </div>
        </div>

        {activeHabits.length === 0 ? (
          <section className="glass empty-state">
            <h2>No habits yet. Start with something small.</h2>
            <p className="muted">A tiny habit with a gentle rhythm is better than an ambitious one you avoid.</p>
          </section>
        ) : (
          <div className="habit-list">
            {activeHabits.map((habit) => (
              <article key={habit.id} className="glass manage-card" style={{ borderColor: `${habit.color}55` }}>
                <div className="today-row">
                  <div>
                    <p className="habit-emoji">{habit.emoji}</p>
                    <h3>{habit.name}</h3>
                    <p className="muted">{Math.round(habitConsistency(habit, checkIns) * 100)}% consistency · {Math.round(habitMomentum(habit, checkIns) * 100)}% momentum</p>
                  </div>
                  <span className="swatch" style={{ background: habit.color }} />
                </div>
                <div className="meta-wrap muted">
                  <span>{habit.frequency === 'timesPerWeek' ? `${habit.targetCount}x per week` : habit.frequency}</span>
                  <span>{habit.timeOfDay}</span>
                  <span>{habit.isNegative ? 'Negative habit' : 'Positive habit'}</span>
                  <span>{habit.paused ? 'Paused' : 'Active'}</span>
                </div>
                <div className="action-row">
                  <button className="ghost-button" onClick={() => setEditing(habit)}>Edit</button>
                  <button className="ghost-button" onClick={() => onTogglePause(habit.id)}>{habit.paused ? 'Resume' : 'Pause'}</button>
                  <button className="ghost-button" onClick={() => onToggleArchive(habit.id)}>Archive</button>
                  <button className="ghost-button danger" onClick={() => onDelete(habit.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <button className="collapse-button" onClick={() => setShowArchived((prev) => !prev)}>
          {showArchived ? 'Hide archived habits' : `Show archived habits (${archivedHabits.length})`}
        </button>
        {showArchived && archivedHabits.length > 0 && (
          <div className="habit-list archived-list">
            {archivedHabits.map((habit) => (
              <article key={habit.id} className="glass manage-card archived">
                <div className="today-row">
                  <div>
                    <h3>{habit.emoji} {habit.name}</h3>
                    <p className="muted">Archived, history kept intact.</p>
                  </div>
                </div>
                <div className="action-row">
                  <button className="ghost-button" onClick={() => onToggleArchive(habit.id)}>Restore</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
