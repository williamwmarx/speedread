'use client'

import type { RecentText } from '@speedread/shared'
import { cn } from '@/lib/cn'

interface RecentTextsProps {
  texts: RecentText[]
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  className?: string
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function RecentTexts({
  texts,
  onSelect,
  onRemove,
  onClearAll,
  className,
}: RecentTextsProps): React.ReactElement | null {
  if (texts.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))]/70">
          Recent
        </h2>
        <button
          onClick={onClearAll}
          className="text-xs text-[hsl(var(--muted-foreground))]/70 transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Clear all
        </button>
      </div>
      <ul className="space-y-1">
        {texts.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <button onClick={() => onSelect(item.id)} className="flex-1 text-left">
              <p className="line-clamp-1 text-sm text-[hsl(var(--foreground))]">{item.preview}</p>
              <p className="mt-0.5 font-mono text-xs text-[hsl(var(--muted-foreground))]/60">
                {item.wordCount} words · {formatDate(item.createdAt)}
              </p>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
              className="rounded p-1 text-[hsl(var(--muted-foreground))]/40 opacity-0 transition-all hover:text-[hsl(var(--foreground))] group-hover:opacity-100"
              title="Remove"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
