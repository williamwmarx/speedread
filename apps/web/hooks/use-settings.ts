'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ReaderSettings } from '@speedread/shared'
import { DEFAULT_SETTINGS } from '@speedread/shared'

const STORAGE_KEY = 'speedread-settings'

function loadSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_SETTINGS

    const parsed = JSON.parse(stored) as Partial<ReaderSettings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: ReaderSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage might be full or disabled
  }
}

export function useSettings(): {
  settings: ReaderSettings
  updateSettings: (update: Partial<ReaderSettings>) => void
  resetSettings: () => void
} {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings())
    setMounted(true)
  }, [])

  // Save settings when they change (but not on initial mount)
  useEffect(() => {
    if (mounted) {
      saveSettings(settings)
    }
  }, [settings, mounted])

  const updateSettings = useCallback((update: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...update }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return { settings, updateSettings, resetSettings }
}
