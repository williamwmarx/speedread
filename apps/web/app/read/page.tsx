'use client'

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { RSVPDisplay } from '@/components/reader/rsvp-display'
import { ControlsBar } from '@/components/reader/controls-bar'
import { ProgressBar } from '@/components/reader/progress-bar'
import { SettingsPanel } from '@/components/reader/settings-panel'
import { TextPreview } from '@/components/reader/text-preview'
import { useReader } from '@/hooks/use-reader'
import { useSettings } from '@/hooks/use-settings'
import { useKeyboard } from '@/hooks/use-keyboard'
import { useRecentTexts } from '@/hooks/use-recent-texts'
import { parseText, chunkTokens } from '@/lib/parser'
import { cn } from '@/lib/cn'

const SPEED_PRESETS = [400, 600]

function ReaderContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()

  const { settings, updateSettings } = useSettings()
  const { getText } = useRecentTexts()
  const reader = useReader(settings)

  const longestWord = useMemo(
    () => reader.tokens.reduce((max, t) => (t.text.length > max.length ? t.text : max), ''),
    [reader.tokens]
  )

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [lastActivity, setLastActivity] = useState(() => Date.now())

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reader.load is stable (useCallback with [] deps) but the reader object is a new ref each render
  }, [searchParams, getText, router, settings.chunkSize])

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

  const cycleSpeed = useCallback(() => {
    const currentIndex = SPEED_PRESETS.indexOf(reader.wpm)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SPEED_PRESETS.length
    const newWpm = SPEED_PRESETS[nextIndex]
    reader.setWpm(newWpm)
    updateSettings({ wpm: newWpm })
  }, [reader, updateSettings])

  // Toggle text preview (playback continues normally)
  const togglePreview = useCallback(() => {
    setPreviewOpen((prev) => !prev)
  }, [])

  const handlePreviewSeek = useCallback(
    (index: number) => {
      reader.seek(index)
    },
    [reader]
  )

  // Keyboard shortcuts
  useKeyboard({
    reader,
    onToggleSettings: () => setSettingsOpen((prev) => !prev),
    onTogglePreview: togglePreview,
    onToggleDarkMode: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    onExit: () => router.push('/'),
    onToggleFullscreen: toggleFullscreen,
    onCycleSpeed: cycleSpeed,
    previewOpen,
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
          longestWord={longestWord}
          onToggle={reader.toggle}
          onJumpSentences={reader.jumpSentences}
        />

        {/* Text preview toggle */}
        <button
          onClick={togglePreview}
          className="absolute right-4 top-4 rounded-md p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
          title="Text preview (t)"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
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

      {/* Text preview overlay */}
      <TextPreview
        tokens={reader.tokens}
        currentIndex={reader.currentIndex}
        open={previewOpen}
        onClose={togglePreview}
        onSeek={handlePreviewSeek}
      />

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
