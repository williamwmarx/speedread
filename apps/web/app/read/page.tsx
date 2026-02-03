'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { RSVPDisplay } from '@/components/reader/rsvp-display'
import { ControlsBar } from '@/components/reader/controls-bar'
import { ProgressBar } from '@/components/reader/progress-bar'
import { SettingsPanel } from '@/components/reader/settings-panel'
import { useReader } from '@/hooks/use-reader'
import { useSettings } from '@/hooks/use-settings'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useRecentTexts } from '@/hooks/use-recent-texts'
import { parseText, chunkTokens } from '@/lib/parser'
import { cn } from '@/lib/cn'

function ReaderContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()

  const { settings, updateSettings } = useSettings()
  const { getText } = useRecentTexts()
  const reader = useReader(settings)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Load text from localStorage
  useEffect(() => {
    const id = searchParams.get('id')
    const text = searchParams.get('text')

    let content: string | null = null
    if (id) {
      content = getText(id)
    } else if (text) {
      content = text
    }

    if (!content) {
      router.replace('/')
      return
    }

    const tokens = parseText(content)
    const chunked = chunkTokens(tokens, settings.chunkSize)
    reader.load(chunked)
  }, [searchParams, getText, router, settings.chunkSize])

  // Handle chunk size changes - re-parse tokens
  useEffect(() => {
    if (reader.tokens.length === 0) return

    // We need the original text to re-chunk - for now just use single tokens
    // This is a simplified implementation
  }, [settings.chunkSize])

  // Auto-hide controls after 2s of playing
  useEffect(() => {
    if (reader.status !== 'playing') {
      setControlsVisible(true)
      return
    }

    const timer = setTimeout(() => {
      if (Date.now() - lastActivity > 2000) {
        setControlsVisible(false)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [reader.status, lastActivity])

  // Show controls on mouse move
  useEffect(() => {
    function handleActivity() {
      setLastActivity(Date.now())
      setControlsVisible(true)
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [])

  // Pause on window blur
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && reader.status === 'playing') {
        reader.pause()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [reader])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  // Speed presets
  const SPEED_PRESETS = [400, 600]
  const cycleSpeed = useCallback(() => {
    const currentIndex = SPEED_PRESETS.indexOf(reader.wpm)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SPEED_PRESETS.length
    const newWpm = SPEED_PRESETS[nextIndex]
    reader.setWpm(newWpm)
    updateSettings({ wpm: newWpm })
  }, [reader, updateSettings])

  // Keyboard shortcuts
  useKeyboard({
    reader,
    onToggleSettings: () => setSettingsOpen((prev) => !prev),
    onToggleDarkMode: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    onExit: () => router.push('/'),
    onToggleFullscreen: toggleFullscreen,
    onCycleSpeed: cycleSpeed,
    enabled: !settingsOpen,
  })

  // Set WPM from preset
  const handleWpmSet = useCallback(
    (wpm: number) => {
      reader.setWpm(wpm)
      updateSettings({ wpm })
    },
    [reader, updateSettings]
  )

  return (
    <div className="flex h-svh flex-col">
      {/* Main display area */}
      <div className="relative flex-1">
        <RSVPDisplay
          token={reader.currentToken}
          settings={settings}
          isPlaying={reader.status === 'playing'}
          wpm={reader.wpm}
          onToggle={reader.toggle}
          onJumpSentences={reader.jumpSentences}
        />
      </div>

      {/* Bottom controls */}
      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
        <ProgressBar
          tokens={reader.tokens}
          currentIndex={reader.currentIndex}
          settings={settings}
          onSeek={reader.seek}
          className="mb-4"
        />

        <ControlsBar
          status={reader.status}
          wpm={reader.wpm}
          onToggle={reader.toggle}
          onRestart={reader.restart}
          onPrev={() => reader.prev(5)}
          onNext={() => reader.next(5)}
          onWpmSet={handleWpmSet}
          onSettingsToggle={() => setSettingsOpen(true)}
          onExit={() => router.push('/')}
          visible={controlsVisible || settingsOpen}
        />
      </div>

      {/* Settings panel */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={updateSettings}
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
      />

      {/* Backdrop when settings open */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-out-expo',
          settingsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setSettingsOpen(false)}
        aria-hidden="true"
      />
    </div>
  )
}

export default function ReadPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex h-svh items-center justify-center">
          <p className="text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  )
}
