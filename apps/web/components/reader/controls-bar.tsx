'use client'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/cn'
import type { ReaderState } from '@speedread/shared'

interface ControlsBarProps {
  status: ReaderState
  wpm: number
  onToggle: () => void
  onRestart: () => void
  onPrev: () => void
  onNext: () => void
  onWpmChange: (delta: number) => void
  onSettingsToggle: () => void
  onExit: () => void
  visible: boolean
}

export function ControlsBar({
  status,
  wpm,
  onToggle,
  onRestart,
  onPrev,
  onNext,
  onWpmChange,
  onSettingsToggle,
  onExit,
  visible,
}: ControlsBarProps): React.ReactElement {
  const isPlaying = status === 'playing'
  const isFinished = status === 'finished'

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 transition-opacity duration-300',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {/* Left: Navigation */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onExit} title="Exit (Esc)">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRestart} title="Restart (r)">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </Button>
      </div>

      {/* Center: Playback controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={onPrev} title="Back 5 words (←)">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <Button variant="accent" size="icon-lg" onClick={onToggle} title="Play/Pause (Space)">
          {isPlaying ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : isFinished ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          )}
        </Button>

        <Button variant="ghost" size="icon-sm" onClick={onNext} title="Forward 5 words (→)">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Right: WPM and settings */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onWpmChange(-25)} title="Decrease WPM (↓)">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <span className="min-w-[4ch] text-center text-sm font-medium tabular-nums">{wpm}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => onWpmChange(25)} title="Increase WPM (↑)">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        <Button variant="ghost" size="icon-sm" onClick={onSettingsToggle} title="Settings (s)">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
