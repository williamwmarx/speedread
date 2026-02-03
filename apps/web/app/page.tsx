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
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">SpeedRead</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">Read faster with RSVP</p>
      </header>

      <TextInput onSubmit={handleSubmit} className="mb-8" />

      <RecentTexts
        texts={recentTexts}
        onSelect={handleSelectRecent}
        onRemove={removeText}
        onClearAll={clearAll}
      />

      <footer className="mt-auto pt-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
        <p>Paste text or share from another app to start reading</p>
      </footer>
    </main>
  )
}
