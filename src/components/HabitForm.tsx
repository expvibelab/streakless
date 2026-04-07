import { useEffect, useState } from 'react'
import { WEEKDAYS } from '../lib/date'
import type { FrequencyType, Habit, TimeOfDay } from '../types'

const initialForm = {
  name: '',
  emoji: '🌱',
  color: '#7c72ff',
  frequency: 'daily' as FrequencyType,
  targetCount: 3,
  timeOfDay: 'Anytime' as TimeOfDay,
  isNegative: false,
  restDays: [] as number[],
}

export function HabitForm({
  editing,
  onSave,
  onCancel,
}: {
  editing?: Habit | null
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'paused' | 'archived'> & Partial<Pick<Habit, 'id' | 'createdAt' | 'paused' | 'archived'>>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (!editing) return setForm(initialForm)
    setForm({
      name: editing.name,
      emoji: editing.emoji,
      color: editing.color,
      frequency: editing.frequency,
      targetCount: editing.targetCount,
      timeOfDay: editing.timeOfDay,
      isNegative: editing.isNegative,
      restDays: editing.restDays,
    })
  }, [editing])

  return (
    <form
      className="glass form-grid"
      onSubmit={(event) => {
        event.preventDefault()
        if (!form.name.trim()) return
        onSave({ ...editing, ...form, name: form.name.trim() })
        setForm(initialForm)
      }}
    >
      <div className="form-header">
        <div>
          <p className="eyebrow">{editing ? 'Edit habit' : 'Create habit'}</p>
          <h2>{editing ? 'Refine the habit' : 'Start small'}</h2>
        </div>
        {editing && (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <label>
        <span>Name</span>
        <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Walk after lunch" />
      </label>

      <div className="inline-fields">
        <label>
          <span>Emoji</span>
          <input value={form.emoji} maxLength={2} onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value || '🌱' }))} />
        </label>
        <label>
          <span>Color</span>
          <input type="color" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} />
        </label>
      </div>

      <div className="inline-fields">
        <label>
          <span>Frequency</span>
          <select value={form.frequency} onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value as FrequencyType }))}>
            <option value="daily">Daily</option>
            <option value="timesPerWeek">X times per week</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label>
          <span>{form.frequency === 'timesPerWeek' ? 'Times per week' : 'Target'}</span>
          <input type="number" min={1} max={7} value={form.targetCount} onChange={(e) => setForm((prev) => ({ ...prev, targetCount: Number(e.target.value) || 1 }))} />
        </label>
      </div>

      <div className="inline-fields">
        <label>
          <span>Time of day</span>
          <select value={form.timeOfDay} onChange={(e) => setForm((prev) => ({ ...prev, timeOfDay: e.target.value as TimeOfDay }))}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Anytime</option>
          </select>
        </label>
        <label className="toggle-row">
          <span>Negative habit</span>
          <button type="button" className={`toggle ${form.isNegative ? 'on' : ''}`} onClick={() => setForm((prev) => ({ ...prev, isNegative: !prev.isNegative }))}>
            {form.isNegative ? 'Days without it' : 'Track positive habit'}
          </button>
        </label>
      </div>

      <fieldset>
        <legend>Rest days</legend>
        <div className="chip-row">
          {WEEKDAYS.map((day, index) => {
            const selected = form.restDays.includes(index)
            return (
              <button
                key={day}
                type="button"
                className={`chip ${selected ? 'selected' : ''}`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    restDays: selected ? prev.restDays.filter((value) => value !== index) : [...prev.restDays, index],
                  }))
                }
              >
                {day}
              </button>
            )
          })}
        </div>
      </fieldset>

      <button type="submit" className="primary-button">{editing ? 'Save changes' : 'Add habit'}</button>
    </form>
  )
}
