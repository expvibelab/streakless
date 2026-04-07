export type ThemePreference = 'system' | 'light' | 'dark'
export type Page = 'today' | 'habits' | 'stats' | 'settings'
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime'
export type FrequencyType = 'daily' | 'weekly' | 'timesPerWeek' | 'monthly'

export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  frequency: FrequencyType
  targetCount: number
  timeOfDay: TimeOfDay
  isNegative: boolean
  restDays: number[]
  paused: boolean
  archived: boolean
  createdAt: string
}

export interface CheckIn {
  habitId: string
  date: string
  note?: string
  createdAt: string
}

export interface AppData {
  habits: Habit[]
  checkIns: CheckIn[]
  theme: ThemePreference
  version: number
}

export interface LastAction {
  type: 'checkin'
  checkIn: CheckIn
}
