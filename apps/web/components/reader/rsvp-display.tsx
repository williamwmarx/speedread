'use client'

import type { Token, ReaderSettings } from '@speedread/shared'
import { splitAtORP } from '@/lib/orp'
import { cn } from '@/lib/cn'

interface RSVPDisplayProps {
  token: Token | null
  settings: ReaderSettings
  isPlaying: boolean
}

const fontSizeClasses: Record<ReaderSettings['fontSize'], string> = {
  sm: 'text-3xl md:text-4xl',
  md: 'text-4xl md:text-5xl',
  lg: 'text-5xl md:text-6xl',
  xl: 'text-6xl md:text-7xl',
}

export function RSVPDisplay({ token, settings, isPlaying }: RSVPDisplayProps): React.ReactElement {
  if (!token) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[hsl(var(--muted-foreground))]">Press space to start</p>
      </div>
    )
  }

  const [before, orp, after] = splitAtORP(token.text)

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Center guide line */}
      <div className="absolute top-1/2 h-px w-8 -translate-y-8 bg-[hsl(var(--border))]" aria-hidden="true" />
      <div className="absolute top-1/2 h-px w-8 translate-y-8 bg-[hsl(var(--border))]" aria-hidden="true" />

      {/* Word display */}
      <div
        className={cn('rsvp-word font-medium tracking-wide', fontSizeClasses[settings.fontSize])}
        role="status"
        aria-live="off"
        aria-atomic="true"
      >
        <span className="text-[hsl(var(--foreground))]">{before}</span>
        <span style={{ color: settings.orpColor }}>{orp}</span>
        <span className="text-[hsl(var(--foreground))]">{after}</span>
      </div>

      {/* Status indicator - subtle pulse when playing */}
      <div className={cn('absolute bottom-8 h-1 w-1 rounded-full bg-accent', isPlaying && 'animate-pulse')} />
    </div>
  )
}
