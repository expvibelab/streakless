import type { AppData } from '../types'

export const STORAGE_KEY = 'streakless.app.data'

export const defaultData: AppData = {
  habits: [],
  checkIns: [],
  theme: 'system',
  version: 1,
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      habits: parsed.habits ?? [],
      checkIns: parsed.checkIns ?? [],
      theme: parsed.theme ?? 'system',
      version: parsed.version ?? 1,
    }
  } catch {
    return defaultData
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
