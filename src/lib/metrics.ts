import type { CheckIn, Habit } from '../types'
import { addDays, fromDateKey, getLastNDates, isSameMonth, monthLabel, toDateKey } from './date'

function checkInsForHabit(checkIns: CheckIn[], habitId: string) {
  return checkIns.filter((item) => item.habitId === habitId)
}

export function isRestDay(habit: Habit, date: Date) {
  return habit.restDays.includes(date.getDay())
}

export function isExpectedOnDate(habit: Habit, date: Date) {
  if (habit.archived || habit.paused) return false
  if (isRestDay(habit, date)) return false

  switch (habit.frequency) {
    case 'daily':
      return true
    case 'weekly':
      return date.getDay() === fromDateKey(habit.createdAt.slice(0, 10)).getDay()
    case 'monthly':
      return date.getDate() === fromDateKey(habit.createdAt.slice(0, 10)).getDate()
    case 'timesPerWeek':
      return true
    default:
      return true
  }
}

export function completedOnDate(checkIns: CheckIn[], habitId: string, dateKey: string) {
  return checkIns.some((item) => item.habitId === habitId && item.date === dateKey)
}

export function countCompletionsOnDate(checkIns: CheckIn[], habit: Habit, dateKey: string) {
  const sameDay = checkIns.filter((item) => item.habitId === habit.id && item.date === dateKey).length
  if (habit.frequency === 'timesPerWeek') return Math.min(sameDay, 1)
  return sameDay > 0 ? 1 : 0
}

export function habitConsistency(habit: Habit, checkIns: CheckIn[], days = 30) {
  const dates = getLastNDates(days)
  let expected = 0
  let completed = 0
  let weeklyWindowCount = 0
  let weeklyWindowDone = 0

  for (const date of dates) {
    const dateKey = toDateKey(date)
    if (habit.frequency === 'timesPerWeek') {
      if (date.getDay() === 0) {
        weeklyWindowCount = 0
        weeklyWindowDone = 0
      }
      if (!isRestDay(habit, date)) {
        weeklyWindowCount += 1
        if (completedOnDate(checkIns, habit.id, dateKey)) weeklyWindowDone += 1
      }
      if (date.getDay() === 6 || dateKey === toDateKey(dates[dates.length - 1])) {
        expected += Math.min(habit.targetCount, weeklyWindowCount)
        completed += Math.min(habit.targetCount, weeklyWindowDone)
      }
      continue
    }

    if (!isExpectedOnDate(habit, date)) continue
    expected += 1
    completed += countCompletionsOnDate(checkIns, habit, dateKey)
  }

  if (expected === 0) return 0
  return completed / expected
}

export function missedExpectedDays(habit: Habit, checkIns: CheckIn[], days = 30) {
  const dates = getLastNDates(days)
  let missed = 0
  for (const date of dates) {
    const key = toDateKey(date)
    if (habit.frequency === 'timesPerWeek') continue
    if (isExpectedOnDate(habit, date) && !completedOnDate(checkIns, habit.id, key)) missed += 1
  }
  return missed
}

export function habitMomentum(habit: Habit, checkIns: CheckIn[]) {
  const consistency = habitConsistency(habit, checkIns)
  const missed = missedExpectedDays(habit, checkIns)
  const completions = checkInsForHabit(checkIns, habit.id).length
  const recovered = Math.min(1, consistency + completions * 0.003)
  return Math.max(0.05, recovered * Math.pow(0.95, missed))
}

export function overallConsistency(habits: Habit[], checkIns: CheckIn[]) {
  const active = habits.filter((habit) => !habit.archived && !habit.paused)
  if (!active.length) return 0
  return active.reduce((sum, habit) => sum + habitConsistency(habit, checkIns), 0) / active.length
}

export function todayProgress(habits: Habit[], checkIns: CheckIn[]) {
  const today = toDateKey(new Date())
  const todaysHabits = habits.filter((habit) => !habit.archived && !habit.paused && isExpectedOnDate(habit, new Date()))
  const done = todaysHabits.filter((habit) => completedOnDate(checkIns, habit.id, today)).length
  return { done, total: todaysHabits.length }
}

export function totalCompletionsThisMonth(checkIns: CheckIn[]) {
  const now = new Date()
  return checkIns.filter((item) => isSameMonth(fromDateKey(item.date), now)).length
}

export function missedConsecutiveDays(habit: Habit, checkIns: CheckIn[]) {
  let missed = 0
  let cursor = addDays(new Date(), -1)
  while (missed < 30) {
    if (!isExpectedOnDate(habit, cursor)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (completedOnDate(checkIns, habit.id, toDateKey(cursor))) return missed
    missed += 1
    cursor = addDays(cursor, -1)
  }
  return missed
}

export function heatmapData(habits: Habit[], checkIns: CheckIn[], habitId?: string) {
  return getLastNDates(84).map((date) => {
    const dateKey = toDateKey(date)
    const relevant = habitId ? habits.filter((habit) => habit.id === habitId) : habits.filter((habit) => !habit.archived)
    const expectedHabits = relevant.filter((habit) => isExpectedOnDate(habit, date))
    const completed = expectedHabits.filter((habit) => completedOnDate(checkIns, habit.id, dateKey)).length
    const ratio = expectedHabits.length ? completed / expectedHabits.length : 0
    return { dateKey, ratio, label: `${date.toLocaleDateString()}: ${Math.round(ratio * 100)}%`, week: Math.floor((84 - 1 - (83 - getLastNDates(84).findIndex((d) => toDateKey(d) === dateKey))) / 7) }
  })
}

export function monthlyBars(checkIns: CheckIn[]) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const total = checkIns.filter((item) => isSameMonth(fromDateKey(item.date), date)).length
    return { label: monthLabel(date), short: monthLabel(date).split(' ')[0], total }
  })
}

export function consistencyTrend(habits: Habit[], checkIns: CheckIn[]) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = addDays(new Date(), -(11 - index) * 7)
    const ratios = habits.filter((habit) => !habit.archived).map((habit) => habitConsistencyAtDate(habit, checkIns, date))
    const value = ratios.length ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length : 0
    return { label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value }
  })
}

function habitConsistencyAtDate(habit: Habit, checkIns: CheckIn[], endDate: Date) {
  const dates = getLastNDates(30, endDate)
  let expected = 0
  let completed = 0
  for (const date of dates) {
    if (!isExpectedOnDate(habit, date)) continue
    expected += 1
    completed += completedOnDate(checkIns, habit.id, toDateKey(date)) ? 1 : 0
  }
  return expected ? completed / expected : 0
}

export function milestoneState(habits: Habit[], checkIns: CheckIn[]) {
  const total = checkIns.length
  const weekOver80 = habits.some((habit) => habitConsistency(habit, checkIns, 7) >= 0.8)
  const monthOver80 = habits.some((habit) => habitConsistency(habit, checkIns, 30) >= 0.8)
  return [
    { label: '50 total completions', earned: total >= 50 },
    { label: '100 completions', earned: total >= 100 },
    { label: 'First week over 80%', earned: weekOver80 },
    { label: 'First month over 80%', earned: monthOver80 },
  ]
}
