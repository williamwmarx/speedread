'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { Token } from '@speedread/shared'
import { cn } from '@/lib/cn'

interface TextPreviewProps {
  tokens: Token[]
  currentIndex: number
  open: boolean
  onClose: () => void
  onSeek: (index: number) => void
}

function groupIntoParagraphs(tokens: Token[]): Token[][] {
  const paragraphs: Token[][] = []
  let current: Token[] = []

  for (const token of tokens) {
    if (token.meta.paragraphStart && current.length > 0) {
      paragraphs.push(current)
      current = []
    }
    current.push(token)
  }
  if (current.length > 0) paragraphs.push(current)

  return paragraphs
}

export function TextPreview({
  tokens,
  currentIndex,
  open,
  onClose,
  onSeek,
}: TextPreviewProps): React.ReactElement {
  const activeRef = useRef<HTMLSpanElement>(null)
  const justOpenedRef = useRef(false)

  // Track when panel opens for smooth vs instant scroll
  useEffect(() => {
    if (open) justOpenedRef.current = true
  }, [open])

  // Scroll active word into view
  useEffect(() => {
    if (!open || !activeRef.current) return
    const behavior = justOpenedRef.current ? 'smooth' : 'auto'
    justOpenedRef.current = false
    activeRef.current.scrollIntoView({ block: 'center', behavior })
  }, [open, currentIndex])

  const handleWordClick = useCallback(
    (index: number) => {
      onSeek(index)
      onClose()
    },
    [onSeek, onClose]
  )

  const paragraphs = useMemo(() => groupIntoParagraphs(tokens), [tokens])

  if (!open) return <></>

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="text-lg font-semibold">Text Preview</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable text body */}
        <div className="overflow-y-auto px-6 py-4 text-sm leading-normal">
          {paragraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className="mb-2 last:mb-0">
              {paragraph.map((token) => {
                const isActive = token.index === currentIndex
                return (
                  <span
                    key={token.index}
                    ref={isActive ? activeRef : undefined}
                    onClick={() => handleWordClick(token.index)}
                    className={cn(
                      'cursor-pointer rounded-sm px-[1px] hover:bg-[hsl(var(--muted))]',
                      isActive && 'font-bold text-[hsl(var(--accent))]'
                    )}
                  >
                    {token.text}{' '}
                  </span>
                )
              })}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
