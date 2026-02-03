'use client'

import type { Token, ReaderSettings } from '@speedread/shared'
import { splitAtORP } from '@/lib/orp'
import { cn } from '@/lib/cn'

interface RSVPDisplayProps {
  token: Token | null
  settings: ReaderSettings
  isPlaying: boolean
  wpm: number
}

const fontSizeClasses: Record<ReaderSettings['fontSize'], string> = {
  sm: 'text-4xl md:text-5xl',
  md: 'text-5xl md:text-6xl',
  lg: 'text-6xl md:text-7xl',
  xl: 'text-7xl md:text-8xl',
}

export function RSVPDisplay({ token, settings, isPlaying, wpm }: RSVPDisplayProps): React.ReactElement {
  const [before, orp, after] = token ? splitAtORP(token.text) : ['', '', '']

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[hsl(var(--background))]">
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
        className="absolute left-0 right-0 top-[32%] h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--border)) 15%, hsl(var(--border)) 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom horizontal guide - full width with gradient fade */}
      <div
        className="absolute bottom-[32%] left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--border)) 15%, hsl(var(--border)) 85%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top vertical line - gradient fade from guide toward center */}
      <div
        className="absolute left-1/2 top-[32%] h-[10%] w-px -translate-x-1/2"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--border)) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom vertical line - gradient fade from guide toward center */}
      <div
        className="absolute bottom-[32%] left-1/2 h-[10%] w-px -translate-x-1/2"
        style={{
          background: 'linear-gradient(0deg, hsl(var(--border)) 0%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Word display - grid keeps ORP centered */}
      {token ? (
        <div
          className={cn('rsvp-word grid w-full max-w-[90vw] px-4 font-sans', fontSizeClasses[settings.fontSize])}
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
        <p className="select-none text-lg tracking-wide text-[hsl(var(--muted-foreground))]">
          Press space to start
        </p>
      )}

      {/* WPM indicator - refined positioning */}
      <div className="absolute bottom-6 right-8 select-none font-mono text-sm tracking-wider text-[hsl(var(--muted-foreground))] opacity-60">
        {wpm} <span className="text-xs uppercase">wpm</span>
      </div>
    </div>
  )
}
