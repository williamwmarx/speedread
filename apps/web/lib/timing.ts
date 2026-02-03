import type { Token, ReaderSettings } from '@speedread/shared'

/**
 * Calculate base word duration from WPM
 * @param wpm - Words per minute
 * @returns Duration in milliseconds
 */
export function baseDuration(wpm: number): number {
  return 60_000 / wpm
}

/**
 * Calculate adaptive timing multiplier based on word length
 * Longer words need more time to process
 * @param wordLength - Length of the word
 * @returns Multiplier (1.0 to 1.4)
 */
function adaptiveMultiplier(wordLength: number): number {
  if (wordLength <= 4) return 1.0
  if (wordLength <= 7) return 1.1
  if (wordLength <= 10) return 1.2
  if (wordLength <= 13) return 1.3
  return 1.4
}

/**
 * Calculate the display duration for a token
 * @param token - The token to display
 * @param settings - Reader settings
 * @returns Duration in milliseconds
 */
export function tokenDuration(token: Token, settings: ReaderSettings): number {
  const base = baseDuration(settings.wpm)
  let multiplier = token.timingMultiplier

  // Apply adaptive timing if enabled
  if (settings.adaptiveTiming) {
    multiplier *= adaptiveMultiplier(token.meta.wordLength)
  }

  // Apply pause multipliers for punctuation
  if (token.meta.paragraphEnd) {
    multiplier *= settings.paragraphPauseMultiplier
  } else if (token.meta.sentenceEnd) {
    multiplier *= settings.sentencePauseMultiplier
  }

  return Math.round(base * multiplier)
}

/**
 * Calculate total reading time for a list of tokens
 * @param tokens - All tokens
 * @param settings - Reader settings
 * @returns Total duration in milliseconds
 */
export function totalDuration(tokens: Token[], settings: ReaderSettings): number {
  return tokens.reduce((sum, token) => sum + tokenDuration(token, settings), 0)
}

/**
 * Format duration as human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "2m 30s" or "45s"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

/**
 * Calculate reading progress percentage
 * @param currentIndex - Current token index
 * @param totalTokens - Total number of tokens
 * @returns Percentage (0-100)
 */
export function progressPercent(currentIndex: number, totalTokens: number): number {
  if (totalTokens === 0) return 0
  return Math.round((currentIndex / totalTokens) * 100)
}
