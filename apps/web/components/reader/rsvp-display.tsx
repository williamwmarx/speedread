'use client'

import { useRef, useCallback, useState } from 'react'
import type { Token, ReaderSettings } from '@speedread/shared'
import { splitAtORP } from '@/lib/orp'
import { cn } from '@/lib/cn'

interface RSVPDisplayProps {
  token: Token | null
  settings: ReaderSettings
  isPlaying: boolean
  wpm: number
  onToggle: () => void
  onJumpSentences: (direction: 'next' | 'prev', count: number) => void
}

const fontSizeClasses: Record<ReaderSettings['fontSize'], string> = {
  sm: 'text-4xl md:text-5xl',
  md: 'text-5xl md:text-6xl',
  lg: 'text-6xl md:text-7xl',
  xl: 'text-7xl md:text-8xl',
}

type TapZone = 'left' | 'center' | 'right'
type FeedbackType = 'play' | 'pause' | 'rewind' | 'forward' | null

export function RSVPDisplay({
  token,
  settings,
  isPlaying,
  wpm,
  onToggle,
  onJumpSentences,
}: RSVPDisplayProps): React.ReactElement {
  const [before, orp, after] = token ? splitAtORP(token.text) : ['', '', '']

  // Track clicks for single/double click detection
  const lastClickRef = useRef<{ time: number; zone: TapZone } | null>(null)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Visual feedback state
  const [feedback, setFeedback] = useState<FeedbackType>(null)

  const getZone = useCallback((clientX: number, containerWidth: number): TapZone => {
    const third = containerWidth / 3
    if (clientX < third) return 'left'
    if (clientX > third * 2) return 'right'
    return 'center'
  }, [])

  const showFeedback = useCallback((type: FeedbackType, action?: () => void, immediate = false) => {
    setFeedback(type)
    // Hide overlay after 500ms
    setTimeout(() => setFeedback(null), 500)
    // Fire action - immediate for pause, delayed for play
    if (action) {
      if (immediate) {
        action()
      } else {
        setTimeout(action, 700)
      }
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const zone = getZone(e.clientX - rect.left, rect.width)
      const now = Date.now()

      // Check for double-click (within 300ms, same zone)
      if (
        lastClickRef.current &&
        now - lastClickRef.current.time < 300 &&
        lastClickRef.current.zone === zone
      ) {
        // Double-click detected
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
          clickTimeoutRef.current = null
        }
        lastClickRef.current = null

        if (zone === 'left') {
          showFeedback('rewind', () => onJumpSentences('prev', 3), true)
        } else if (zone === 'right') {
          showFeedback('forward', () => onJumpSentences('next', 3), true)
        } else {
          // Double-click center = toggle (same as single)
          // Pause immediately, delay play
          showFeedback(isPlaying ? 'pause' : 'play', onToggle, isPlaying)
        }
        return
      }

      // First click - store and wait to see if it's a double
      lastClickRef.current = { time: now, zone }

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }

      clickTimeoutRef.current = setTimeout(() => {
        // Single click confirmed
        if (zone === 'center') {
          // Pause immediately, delay play
          showFeedback(isPlaying ? 'pause' : 'play', onToggle, isPlaying)
        }
        // Single click on left/right does nothing (wait for double)
        lastClickRef.current = null
        clickTimeoutRef.current = null
      }, 300)
    },
    [getZone, onToggle, onJumpSentences, showFeedback, isPlaying]
  )

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-[hsl(var(--background))]"
      onClick={handleClick}
    >
      {/* Rewind feedback - curved on right edge */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 flex w-1/3 items-center justify-center bg-[hsl(var(--foreground))]/10 transition-opacity duration-300',
          feedback === 'rewind' ? 'opacity-100' : 'opacity-0'
        )}
        style={{ borderRadius: '0 50% 50% 0' }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-1 text-[hsl(var(--foreground))]/70">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
          <span className="text-sm font-medium">3</span>
        </div>
      </div>

      {/* Forward feedback - curved on left edge */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 flex w-1/3 items-center justify-center bg-[hsl(var(--foreground))]/10 transition-opacity duration-300',
          feedback === 'forward' ? 'opacity-100' : 'opacity-0'
        )}
        style={{ borderRadius: '50% 0 0 50%' }}
        aria-hidden="true"
      >
        <div className="flex items-center gap-1 text-[hsl(var(--foreground))]/70">
          <span className="text-sm font-medium">3</span>
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </div>
      </div>

      {/* Play/Pause feedback - center with backdrop blur */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300',
          feedback === 'play' || feedback === 'pause' ? 'opacity-100' : 'opacity-0 backdrop-blur-none'
        )}
        aria-hidden="true"
      >
        <div className="rounded-full bg-[hsl(var(--background))]/80 p-6 shadow-lg">
          {feedback === 'play' ? (
            <svg className="h-16 w-16 text-[hsl(var(--foreground))]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="h-16 w-16 text-[hsl(var(--foreground))]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Subtle radial gradient for depth - draws eye to center */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(var(--background)) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Top horizontal guide - full width with gradient fade at edges */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-[32%] h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--border)) 15%, hsl(var(--border)) 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom horizontal guide - full width with gradient fade */}
      <div
        className="pointer-events-none absolute bottom-[32%] left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--border)) 15%, hsl(var(--border)) 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top vertical line - gradient fade from guide toward center */}
      <div
        className="pointer-events-none absolute left-1/2 top-[32%] h-[10%] w-px -translate-x-1/2"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--border)) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom vertical line - gradient fade from guide toward center */}
      <div
        className="pointer-events-none absolute bottom-[32%] left-1/2 h-[10%] w-px -translate-x-1/2"
        style={{
          background: 'linear-gradient(0deg, hsl(var(--border)) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Word display - grid keeps ORP centered */}
      {token ? (
        <div
          className={cn('rsvp-word pointer-events-none grid w-full max-w-[90vw] px-4 font-sans', fontSizeClasses[settings.fontSize])}
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
          role="status"
          aria-live="off"
          aria-atomic="true"
        >
          <span className="select-none text-right text-[hsl(var(--foreground))]">{before}</span>
          <span
            className="relative select-none"
            style={{ color: settings.orpColor }}
          >
            {/* Subtle glow behind ORP character */}
            <span
              className="absolute inset-0 blur-sm"
              style={{ color: settings.orpColor, opacity: 0.4 }}
              aria-hidden="true"
            >
              {orp}
            </span>
            {orp}
          </span>
          <span className="select-none text-left text-[hsl(var(--foreground))]">{after}</span>
        </div>
      ) : (
        <p className="pointer-events-none select-none text-lg tracking-wide text-[hsl(var(--muted-foreground))]">
          Press space to start
        </p>
      )}

      {/* WPM indicator - refined positioning */}
      <div className="pointer-events-none absolute bottom-6 right-8 select-none font-mono text-sm tracking-wider text-[hsl(var(--muted-foreground))] opacity-60">
        {wpm} <span className="text-xs uppercase">wpm</span>
      </div>
    </div>
  )
}
