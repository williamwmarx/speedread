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

  // Visual feedback for double-tap
  const [feedbackZone, setFeedbackZone] = useState<TapZone | null>(null)

  const getZone = useCallback((clientX: number, containerWidth: number): TapZone => {
    const third = containerWidth / 3
    if (clientX < third) return 'left'
    if (clientX > third * 2) return 'right'
    return 'center'
  }, [])

  const showFeedback = useCallback((zone: TapZone) => {
    setFeedbackZone(zone)
    setTimeout(() => setFeedbackZone(null), 200)
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
          showFeedback('left')
          onJumpSentences('prev', 3)
        } else if (zone === 'right') {
          showFeedback('right')
          onJumpSentences('next', 3)
        } else {
          // Double-click center = toggle (same as single)
          onToggle()
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
          onToggle()
        }
        // Single click on left/right does nothing (wait for double)
        lastClickRef.current = null
        clickTimeoutRef.current = null
      }, 300)
    },
    [getZone, onToggle, onJumpSentences, showFeedback]
  )

  return (
    <div
      className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-[hsl(var(--background))]"
      onClick={handleClick}
    >
      {/* Double-tap feedback overlays */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/10 transition-opacity duration-200',
          feedbackZone === 'left' ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-white/10 transition-opacity duration-200',
          feedbackZone === 'right' ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

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
