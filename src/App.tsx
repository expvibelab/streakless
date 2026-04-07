import { useEffect, useMemo, useState } from 'react'
import './index.css'
import { Layout } from './components/Layout'
import { HabitsPage } from './pages/HabitsPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatsPage } from './pages/StatsPage'
import { TodayPage } from './pages/TodayPage'
import { loadData, saveData } from './lib/storage'
import { overallConsistency, todayProgress, totalCompletionsThisMonth } from './lib/metrics'
import { toDateKey } from './lib/date'
import type { AppData, CheckIn, Habit, LastAction, Page, ThemePreference } from './types'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [page, setPage] = useState<Page>('today')
  const [selectedHabitId, setSelectedHabitId] = useState('')
  const [lastAction, setLastAction] = useState<LastAction | null>(null)

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = data.theme === 'system' ? (systemDark ? 'dark' : 'light') : data.theme
    root.dataset.theme = resolved
  }, [data.theme])

  const activeTodayHabits = useMemo(
    () => data.habits.filter((habit) => !habit.archived && !habit.paused),
    [data.habits],
  )

  const consistency = overallConsistency(activeTodayHabits, data.checkIns)
  const progress = todayProgress(activeTodayHabits, data.checkIns)
  const monthTotal = totalCompletionsThisMonth(data.checkIns)

  function upsertHabit(input: Partial<Habit> & Omit<Habit, 'id' | 'createdAt' | 'paused' | 'archived'>) {
    setData((prev) => {
      if (input.id) {
        return {
          ...prev,
          habits: prev.habits.map((habit) => (habit.id === input.id ? { ...habit, ...input } : habit)),
        }
      }
      return {
        ...prev,
        habits: [
          {
            ...input,
            id: makeId(),
            createdAt: new Date().toISOString(),
            paused: false,
            archived: false,
          },
          ...prev.habits,
        ],
      }
    })
  }

  function deleteHabit(habitId: string) {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((habit) => habit.id !== habitId),
      checkIns: prev.checkIns.filter((checkIn) => checkIn.habitId !== habitId),
    }))
  }

  function addCheckIn(habitId: string, note?: string) {
    const date = toDateKey(new Date())
    if (data.checkIns.some((item) => item.habitId === habitId && item.date === date)) return
    const checkIn: CheckIn = { habitId, date, note, createdAt: new Date().toISOString() }
    setData((prev) => ({ ...prev, checkIns: [...prev.checkIns, checkIn] }))
    setLastAction({ type: 'checkin', checkIn })
  }

  function undoLastAction() {
    if (!lastAction) return
    setData((prev) => ({
      ...prev,
      checkIns: prev.checkIns.filter(
        (item) => !(item.habitId === lastAction.checkIn.habitId && item.createdAt === lastAction.checkIn.createdAt),
      ),
    }))
    setLastAction(null)
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `streakless-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importData(file: File, mode: 'merge' | 'replace') {
    file.text().then((text) => {
      const parsed = JSON.parse(text) as AppData
      setData((prev) =>
        mode === 'replace'
          ? parsed
          : {
              ...prev,
              habits: [...prev.habits, ...(parsed.habits ?? []).filter((habit) => !prev.habits.some((existing) => existing.id === habit.id))],
              checkIns: [...prev.checkIns, ...(parsed.checkIns ?? []).filter((entry) => !prev.checkIns.some((existing) => existing.createdAt === entry.createdAt))],
              theme: prev.theme,
              version: 1,
            },
      )
    })
  }

  function clearData() {
    if (!window.confirm('Clear all habits and check-ins?')) return
    if (!window.confirm('Really clear everything? This cannot be undone.')) return
    setData({ habits: [], checkIns: [], theme: data.theme, version: 1 })
    setLastAction(null)
  }

  function setTheme(theme: ThemePreference) {
    setData((prev) => ({ ...prev, theme }))
  }

  return (
    <Layout page={page} onChange={setPage}>
      {page === 'today' && (
        <TodayPage
          habits={activeTodayHabits}
          checkIns={data.checkIns}
          overallConsistency={consistency}
          monthTotal={monthTotal}
          todayDone={progress.done}
          todayTotal={progress.total}
          onCheckIn={addCheckIn}
          onUndo={undoLastAction}
          lastAction={lastAction}
        />
      )}
      {page === 'habits' && (
        <HabitsPage
          habits={data.habits}
          checkIns={data.checkIns}
          onSave={upsertHabit}
          onDelete={deleteHabit}
          onTogglePause={(habitId) => setData((prev) => ({ ...prev, habits: prev.habits.map((habit) => (habit.id === habitId ? { ...habit, paused: !habit.paused } : habit)) }))}
          onToggleArchive={(habitId) => setData((prev) => ({ ...prev, habits: prev.habits.map((habit) => (habit.id === habitId ? { ...habit, archived: !habit.archived } : habit)) }))}
        />
      )}
      {page === 'stats' && <StatsPage habits={data.habits} checkIns={data.checkIns} selectedHabitId={selectedHabitId} onSelectHabit={setSelectedHabitId} />}
      {page === 'settings' && <SettingsPage theme={data.theme} onTheme={setTheme} onExport={exportData} onImport={importData} onClear={clearData} data={data} />}
    </Layout>
  )
}

export default App
