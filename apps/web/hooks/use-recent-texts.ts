'use client'

import { useSyncExternalStore, useCallback } from 'react'
import type { RecentText } from '@speedread/shared'
import { createPreview, countWords } from '@/lib/parser'

const STORAGE_KEY = 'speedread-recent-texts'
const MAX_RECENT = 10

const listeners = new Set<() => void>()

function emitChange(): void {
  listeners.forEach((l) => l())
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

const EMPTY: RecentText[] = []
// undefined (not null) forces first getSnapshot() call to read localStorage
let cachedRaw: string | null | undefined
let cachedTexts: RecentText[] = EMPTY

function getSnapshot(): RecentText[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cachedTexts = raw ? JSON.parse(raw) : []
    }
    return cachedTexts
  } catch {
    return EMPTY
  }
}

function getServerSnapshot(): RecentText[] {
  return EMPTY
}

function saveRecent(texts: RecentText[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
  } catch {
    // localStorage might be full or disabled
  }
  cachedRaw = undefined // invalidate cache
  emitChange()
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export interface UseRecentTextsReturn {
  recentTexts: RecentText[]
  addText: (text: string) => string
  removeText: (id: string) => void
  clearAll: () => void
  getText: (id: string) => string | null
}

export function useRecentTexts(): UseRecentTextsReturn {
  const recentTexts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const addText = useCallback((text: string): string => {
    const id = generateId()
    const newEntry: RecentText = {
      id,
      preview: createPreview(text),
      wordCount: countWords(text),
      createdAt: Date.now(),
    }

    try {
      localStorage.setItem(`speedread-text-${id}`, text)
    } catch {
      // If can't store, return id anyway
    }

    const updated = [newEntry, ...getSnapshot()].slice(0, MAX_RECENT)
    saveRecent(updated)
    return id
  }, [])

  const removeText = useCallback((id: string) => {
    try {
      localStorage.removeItem(`speedread-text-${id}`)
    } catch {
      // Ignore
    }

    const updated = getSnapshot().filter((t) => t.id !== id)
    saveRecent(updated)
  }, [])

  const clearAll = useCallback(() => {
    getSnapshot().forEach((t) => {
      try {
        localStorage.removeItem(`speedread-text-${t.id}`)
      } catch {
        // Ignore
      }
    })
    saveRecent([])
  }, [])

  const getText = useCallback((id: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(`speedread-text-${id}`)
    } catch {
      return null
    }
  }, [])

  return { recentTexts, addText, removeText, clearAll, getText }
}
