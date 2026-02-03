import Link from 'next/link'

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-[hsl(var(--muted-foreground))]">Content not found or expired</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[hsl(var(--foreground))] px-4 font-medium text-[hsl(var(--background))] transition-colors hover:bg-[hsl(var(--foreground))]/90"
      >
        Go Home
      </Link>
    </main>
  )
}
