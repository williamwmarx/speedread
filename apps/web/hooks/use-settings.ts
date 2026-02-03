'use client'

import { useSyncExternalStore, useCallback } from 'react'
import type { ReaderSettings } from '@speedread/shared'
import { DEFAULT_SETTINGS } from '@speedread/shared'

const STORAGE_KEY = 'speedread-settings'

const listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((l) => l())
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// undefined (not null) forces first getSnapshot() call to read localStorage
let cachedRaw: string | null | undefined
let cachedSettings: ReaderSettings = DEFAULT_SETTINGS

function getSnapshot(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cachedSettings = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
    }
    return cachedSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

function getServerSnapshot(): ReaderSettings {
  return DEFAULT_SETTINGS
}

export function useSettings(): {
  settings: ReaderSettings
  updateSettings: (update: Partial<ReaderSettings>) => void
  resetSettings: () => void
} {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateSettings = useCallback((update: Partial<ReaderSettings>) => {
    const updated = { ...getSnapshot(), ...update }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // localStorage might be full or disabled
    }
    cachedRaw = undefined // invalidate cache
    emitChange()
  }, [])

  const resetSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
    } catch {
      // localStorage might be full or disabled
    }
    cachedRaw = undefined
    emitChange()
  }, [])

  return { settings, updateSettings, resetSettings }
}
