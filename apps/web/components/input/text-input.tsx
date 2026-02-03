'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

interface TextInputProps {
  onSubmit: (text: string) => void
  className?: string
}

export function TextInput({ onSubmit, className }: TextInputProps): React.ReactElement {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      onSubmit(trimmed)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          className="h-48 w-full resize-none rounded-lg border border-[hsl(var(--border))] bg-transparent p-4 text-sm leading-relaxed placeholder:text-[hsl(var(--muted-foreground))]/60 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          autoFocus
        />
        {wordCount > 0 && (
          <span className="absolute bottom-3 right-3 font-mono text-xs text-[hsl(var(--muted-foreground))]/70">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-40"
      >
        Start Reading
      </button>
    </form>
  )
}
