import type { ReaderSettings } from '@speedread/shared'

export const fontSizeClasses: Record<ReaderSettings['fontSize'], string> = {
  sm: 'text-4xl md:text-5xl',
  md: 'text-5xl md:text-6xl',
  lg: 'text-6xl md:text-7xl',
  xl: 'text-7xl md:text-8xl',
}
