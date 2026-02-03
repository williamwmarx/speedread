'use client'

import { useState, useEffect, useRef } from 'react'
import type { ReaderSettings } from '@speedread/shared'
import { fontSizeClasses } from '@/lib/font-sizes'

/** Returns a scaled font size in px if the longest word would overflow, or undefined if it fits. */
export function useFitFontSize(
  longestWord: string,
  fontSize: ReaderSettings['fontSize']
): number | undefined {
  const [override, setOverride] = useState<number | undefined>(undefined)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number>(0)

  /* eslint-disable react-hooks/set-state-in-effect -- DOM measurement requires setState in effect */
  useEffect(() => {
    if (!longestWord) {
      setOverride(undefined)
      return
    }

    // Create hidden measurement span with the same styles as the RSVP display
    const span = document.createElement('span')
    span.className = `rsvp-word font-sans ${fontSizeClasses[fontSize]}`
    span.style.position = 'absolute'
    span.style.visibility = 'hidden'
    span.style.whiteSpace = 'nowrap'
    span.style.pointerEvents = 'none'
    span.textContent = longestWord
    document.body.appendChild(span)
    spanRef.current = span

    function measure() {
      if (!spanRef.current) return
      const measured = spanRef.current.getBoundingClientRect().width
      // 90vw minus px-4 padding (1rem = 16px each side)
      const available = window.innerWidth * 0.9 - 32
      if (measured > available) {
        const computedPx = parseFloat(getComputedStyle(spanRef.current).fontSize)
        setOverride(computedPx * (available / measured))
      } else {
        setOverride(undefined)
      }
    }

    function onResize() {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafRef.current)
      if (spanRef.current) {
        document.body.removeChild(spanRef.current)
        spanRef.current = null
      }
    }
  }, [longestWord, fontSize])
  /* eslint-enable react-hooks/set-state-in-effect */

  return override
}
