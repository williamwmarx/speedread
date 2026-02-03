import type { Token, TokenMeta } from '@speedread/shared'
import { calculateORP } from './orp'

// Common abbreviations that don't end sentences
const ABBREVIATIONS = new Set([
  'mr',
  'mrs',
  'ms',
  'dr',
  'prof',
  'sr',
  'jr',
  'vs',
  'etc',
  'inc',
  'ltd',
  'corp',
  'co',
  'st',
  'ave',
  'blvd',
  'dept',
  'est',
  'approx',
  'govt',
  'gen',
  'col',
  'lt',
  'sgt',
  'capt',
  'maj',
  'fig',
  'no',
  'vol',
  'rev',
  'ed',
  'pp',
  'aka',
  'ie',
  'eg',
  'cf',
  'al', // et al.
])

// Sentence-ending punctuation
const SENTENCE_END_PUNCT = /[.!?]$/
// Pause-inducing punctuation (commas, semicolons, colons)
const PAUSE_PUNCT = /[,;:]$/
// Clean word for abbreviation check (remove punctuation)
const CLEAN_WORD = /[.,!?;:'")\]]+$/

/**
 * Check if a word ends a sentence
 */
function isSentenceEnd(word: string, nextWord: string | undefined): boolean {
  if (!SENTENCE_END_PUNCT.test(word)) return false

  // Check if it's an abbreviation
  const cleanWord = word.replace(CLEAN_WORD, '').toLowerCase()
  if (ABBREVIATIONS.has(cleanWord)) return false

  // If next word starts with lowercase, probably not a sentence end
  // (handles cases like "U.S. government")
  if (nextWord && /^[a-z]/.test(nextWord)) return false

  return true
}

/**
 * Check if word has pause-inducing punctuation
 */
function hasPausePunct(word: string): boolean {
  return PAUSE_PUNCT.test(word)
}

/**
 * Calculate timing multiplier based on punctuation
 */
function timingMultiplier(word: string): number {
  if (hasPausePunct(word)) return 2.0
  return 1.0
}

/**
 * Split text into paragraphs
 */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Split paragraph into words, preserving punctuation
 */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/**
 * Parse text into tokens for RSVP display
 */
export function parseText(text: string): Token[] {
  const paragraphs = splitParagraphs(text)
  const tokens: Token[] = []
  let globalIndex = 0

  for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
    const words = splitWords(paragraphs[pIndex])
    const isLastParagraph = pIndex === paragraphs.length - 1

    for (let wIndex = 0; wIndex < words.length; wIndex++) {
      const word = words[wIndex]
      const nextWord = words[wIndex + 1]
      const isFirstWord = wIndex === 0
      const isLastWord = wIndex === words.length - 1
      const sentenceEnd = isSentenceEnd(word, nextWord)

      const meta: TokenMeta = {
        sentenceStart: isFirstWord || (wIndex > 0 && isSentenceEnd(words[wIndex - 1], word)),
        sentenceEnd: sentenceEnd || isLastWord,
        paragraphStart: isFirstWord,
        paragraphEnd: isLastWord && !isLastParagraph,
        wordLength: word.replace(/[^\w]/g, '').length,
      }

      tokens.push({
        text: word,
        index: globalIndex,
        orpIndex: calculateORP(word),
        timingMultiplier: timingMultiplier(word),
        meta,
      })

      globalIndex++
    }
  }

  return tokens
}

/**
 * Group tokens into chunks of specified size
 */
export function chunkTokens(tokens: Token[], chunkSize: number): Token[] {
  if (chunkSize <= 1) return tokens

  const chunked: Token[] = []

  for (let i = 0; i < tokens.length; i += chunkSize) {
    const chunk = tokens.slice(i, i + chunkSize)
    const combinedText = chunk.map((t) => t.text).join(' ')
    const lastToken = chunk[chunk.length - 1]

    // Use meta from last token in chunk (for pause behavior)
    chunked.push({
      text: combinedText,
      index: chunked.length,
      orpIndex: calculateORP(combinedText),
      timingMultiplier: Math.max(...chunk.map((t) => t.timingMultiplier)),
      meta: {
        ...lastToken.meta,
        paragraphStart: chunk[0].meta.paragraphStart,
        sentenceStart: chunk[0].meta.sentenceStart,
        wordLength: combinedText.replace(/[^\w\s]/g, '').length,
      },
    })
  }

  return chunked
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

/**
 * Create preview from text (first N characters)
 */
export function createPreview(text: string, maxLength = 100): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + '…'
}
