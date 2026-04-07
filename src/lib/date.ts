export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function fromDateKey(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function startOfWeek(date: Date) {
  return addDays(date, -date.getDay())
}

export function getLastNDates(days: number, end = new Date()) {
  return Array.from({ length: days }, (_, index) => addDays(end, -(days - index - 1)))
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function shortMonth(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short' })
}

export function isSameMonth(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}
