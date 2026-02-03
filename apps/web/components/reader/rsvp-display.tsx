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
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Top horizontal guide - full width */}
      <div className="absolute left-0 right-0 top-[30%] h-px bg-[hsl(var(--border))]" aria-hidden="true" />

      {/* Bottom horizontal guide - full width */}
      <div className="absolute bottom-[30%] left-0 right-0 h-px bg-[hsl(var(--border))]" aria-hidden="true" />

      {/* Top vertical line from guide to word area */}
      <div className="absolute left-1/2 top-[30%] h-[12%] w-px -translate-x-1/2 bg-[hsl(var(--border))]" aria-hidden="true" />

      {/* Bottom vertical line from guide to word area */}
      <div className="absolute bottom-[30%] left-1/2 h-[12%] w-px -translate-x-1/2 bg-[hsl(var(--border))]" aria-hidden="true" />

      {/* Word display - grid keeps ORP centered */}
      {token ? (
        <div
          className={cn('rsvp-word grid font-serif', fontSizeClasses[settings.fontSize])}
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
          role="status"
          aria-live="off"
          aria-atomic="true"
        >
          <span className="text-right text-[hsl(var(--foreground))]">{before}</span>
          <span style={{ color: settings.orpColor }}>{orp}</span>
          <span className="text-left text-[hsl(var(--foreground))]">{after}</span>
        </div>
      ) : (
        <p className="text-[hsl(var(--muted-foreground))]">Press space to start</p>
      )}

      {/* WPM indicator - bottom right */}
      <div className="absolute bottom-4 right-6 text-lg tabular-nums text-[hsl(var(--muted-foreground))]">
        {wpm} wpm
      </div>
    </div>
  )
}
