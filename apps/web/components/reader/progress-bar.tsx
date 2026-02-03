'use client'

import { cn } from '@/lib/cn'
import { formatDuration, totalDuration, progressPercent } from '@/lib/timing'
import type { Token, ReaderSettings } from '@speedread/shared'

interface ProgressBarProps {
  tokens: Token[]
  currentIndex: number
  settings: ReaderSettings
  onSeek: (index: number) => void
  className?: string
}

export function ProgressBar({
  tokens,
  currentIndex,
  settings,
  onSeek,
  className,
}: ProgressBarProps): React.ReactElement {
  const percent = progressPercent(currentIndex, tokens.length)
  const remaining = totalDuration(tokens.slice(currentIndex), settings)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickPercent = x / rect.width
    const newIndex = Math.floor(clickPercent * tokens.length)
    onSeek(Math.max(0, Math.min(newIndex, tokens.length - 1)))
  }

  return (
    <div className={cn('w-full space-y-1', className)}>
      {/* Progress track */}
      <div
        className="group relative h-2 w-full cursor-pointer overflow-hidden rounded-full bg-[hsl(var(--muted))]"
        onClick={handleClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Reading progress"
        tabIndex={0}
      >
        <div
          className="h-full bg-accent transition-all duration-100 ease-out"
          style={{ width: `${percent}%` }}
        />
        {/* Hover indicator */}
        <div className="absolute inset-0 bg-accent/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span className="tabular-nums">
          {currentIndex + 1} / {tokens.length} words
        </span>
        <span className="tabular-nums">{formatDuration(remaining)} left</span>
      </div>
    </div>
  )
}
