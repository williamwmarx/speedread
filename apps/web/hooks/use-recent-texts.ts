'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RecentText } from '@speedread/shared'
import { createPreview, countWords } from '@/lib/parser'

const STORAGE_KEY = 'speedread-recent-texts'
const MAX_RECENT = 10

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function loadRecent(): RecentText[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecent(texts: RecentText[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(texts))
  } catch {
    // localStorage might be full or disabled
  }
}

export interface UseRecentTextsReturn {
  recentTexts: RecentText[]
  addText: (text: string) => string
  removeText: (id: string) => void
  clearAll: () => void
  getText: (id: string) => string | null
}

export function useRecentTexts(): UseRecentTextsReturn {
  const [recentTexts, setRecentTexts] = useState<RecentText[]>([])

  // Load on mount
  useEffect(() => {
    setRecentTexts(loadRecent())
  }, [])

  const addText = useCallback((text: string): string => {
    const id = generateId()
    const newEntry: RecentText = {
      id,
      preview: createPreview(text),
      wordCount: countWords(text),
      createdAt: Date.now(),
    }

    // Store full text separately
    try {
      localStorage.setItem(`speedread-text-${id}`, text)
    } catch {
      // If can't store, return id anyway
    }

    setRecentTexts((prev) => {
      const updated = [newEntry, ...prev].slice(0, MAX_RECENT)
      saveRecent(updated)
      return updated
    })

    return id
  }, [])

  const removeText = useCallback((id: string) => {
    try {
      localStorage.removeItem(`speedread-text-${id}`)
    } catch {
      // Ignore
    }

    setRecentTexts((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      saveRecent(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    recentTexts.forEach((t) => {
      try {
        localStorage.removeItem(`speedread-text-${t.id}`)
      } catch {
        // Ignore
      }
    })

    setRecentTexts([])
    saveRecent([])
  }, [recentTexts])

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
