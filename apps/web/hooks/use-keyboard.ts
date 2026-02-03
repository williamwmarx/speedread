'use client'

import { useEffect } from 'react'
import type { UseReaderReturn } from './use-reader'

interface UseKeyboardOptions {
  reader: UseReaderReturn
  onToggleSettings: () => void
  onTogglePreview: () => void
  onToggleDarkMode: () => void
  onExit: () => void
  onToggleFullscreen: () => void
  onCycleSpeed: () => void
  previewOpen?: boolean
  enabled?: boolean
}

export function useKeyboard({
  reader,
  onToggleSettings,
  onTogglePreview,
  onToggleDarkMode,
  onExit,
  onToggleFullscreen,
  onCycleSpeed,
  previewOpen = false,
  enabled = true,
}: UseKeyboardOptions): void {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // When preview is open, only t and Escape are active
      if (previewOpen) {
        if (e.key === 't' || e.key === 'Escape') {
          e.preventDefault()
          onTogglePreview()
        }
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          reader.toggle()
          break

        case 'ArrowLeft':
          e.preventDefault()
          reader.prev(5)
          break

        case 'ArrowRight':
          e.preventDefault()
          reader.next(5)
          break

        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault()
          onCycleSpeed()
          break

        case 'r':
          e.preventDefault()
          reader.restart()
          break

        case 's':
          e.preventDefault()
          onToggleSettings()
          break

        case 't':
          e.preventDefault()
          onTogglePreview()
          break

        case 'd':
          e.preventDefault()
          onToggleDarkMode()
          break

        case 'Escape':
          e.preventDefault()
          onExit()
          break

        case 'f':
          e.preventDefault()
          onToggleFullscreen()
          break

        case '[':
          e.preventDefault()
          reader.jumpSentence('prev')
          break

        case ']':
          e.preventDefault()
          reader.jumpSentence('next')
          break

        case '{':
          e.preventDefault()
          reader.jumpParagraph('prev')
          break

        case '}':
          e.preventDefault()
          reader.jumpParagraph('next')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [reader, onToggleSettings, onTogglePreview, onToggleDarkMode, onExit, onToggleFullscreen, onCycleSpeed, previewOpen, enabled])
}
