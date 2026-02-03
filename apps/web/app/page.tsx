'use client'

import { useRouter } from 'next/navigation'
import { TextInput } from '@/components/input/text-input'
import { RecentTexts } from '@/components/input/recent-texts'
import { useRecentTexts } from '@/hooks/use-recent-texts'

export default function HomePage(): React.ReactElement {
  const router = useRouter()
  const { recentTexts, addText, removeText, clearAll, getText } = useRecentTexts()

  function handleSubmit(text: string) {
    const id = addText(text)
    router.push(`/read?id=${id}`)
  }

  function handleSelectRecent(id: string) {
    const text = getText(id)
    if (text) {
      router.push(`/read?id=${id}`)
    }
  }

  return (
    <main className="flex min-h-svh flex-col items-center px-4 pb-24 pt-[18vh]">
      <div className="w-full max-w-xl">
        {/* Header */}
        <header className="animate-fade-up mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Speed<span className="text-accent">Read</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Read faster with{' '}
            <a
              href="https://en.wikipedia.org/wiki/Rapid_serial_visual_presentation"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[hsl(var(--foreground))]"
            >
              RSVP
            </a>
            . Private by design. Open source. Read the code{' '}
            <a
              href="https://github.com/williamwmarx/speedread"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[hsl(var(--foreground))]"
            >
              on GitHub
            </a>
            .
          </p>
        </header>

        {/* Decorative line echoing reader guide lines */}
        <div
          className="animate-fade-up mx-auto mb-10 h-px w-full max-w-xs"
          style={{
            animationDelay: '80ms',
            background:
              'linear-gradient(90deg, transparent 0%, hsl(var(--border)) 30%, hsl(var(--border)) 70%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Text input */}
        <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
          <TextInput onSubmit={handleSubmit} className="mb-8" />
        </div>

        {/* Recent texts */}
        <div className="animate-fade-up" style={{ animationDelay: '220ms' }}>
          <RecentTexts
            texts={recentTexts}
            onSelect={handleSelectRecent}
            onRemove={removeText}
            onClearAll={clearAll}
          />
        </div>
      </div>
    </main>
  )
}
