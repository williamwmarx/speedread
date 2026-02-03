import { notFound, redirect } from 'next/navigation'
import type { ContentRetrieveResponse } from '@speedread/shared'

interface PageProps {
  params: Promise<{ uuid: string }>
}

async function fetchContent(uuid: string): Promise<ContentRetrieveResponse | null> {
  // In production, this would be the actual API URL
  const apiUrl = process.env.API_URL || 'https://read.marx.sh'

  try {
    const res = await fetch(`${apiUrl}/api/content/${uuid}`, {
      cache: 'no-store',
    })

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function UUIDPage({ params }: PageProps): Promise<never> {
  const { uuid } = await params

  // Validate UUID format
  const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  if (!uuidRegex.test(uuid)) {
    notFound()
  }

  const content = await fetchContent(uuid)

  if (!content) {
    notFound()
  }

  // Redirect to reader with text as query param
  // Using encodeURIComponent to handle special characters
  redirect(`/read?text=${encodeURIComponent(content.text)}`)
}

export function generateMetadata(): { title: string } {
  return {
    title: 'SpeedRead',
  }
}
