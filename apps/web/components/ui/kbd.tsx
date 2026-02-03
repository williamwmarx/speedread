import { cn } from '@/lib/cn'

interface KbdProps {
  children: React.ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps): React.ReactElement {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 font-mono text-xs text-[hsl(var(--muted-foreground))]',
        className
      )}
    >
      {children}
    </kbd>
  )
}
