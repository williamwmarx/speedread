'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          className="h-64 w-full resize-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-base placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))]"
          autoFocus
        />
        {wordCount > 0 && (
          <span className="absolute bottom-3 right-3 text-sm text-[hsl(var(--muted-foreground))]">
            {wordCount} words
          </span>
        )}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={!text.trim()}>
        Start Reading
      </Button>
    </form>
  )
}
