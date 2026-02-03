// Token represents a single display unit (word or chunk)
export interface Token {
  text: string
  index: number
  orpIndex: number
  timingMultiplier: number
  meta: TokenMeta
}

export interface TokenMeta {
  sentenceStart: boolean
  sentenceEnd: boolean
  paragraphStart: boolean
  paragraphEnd: boolean
  wordLength: number
}

// Reader settings persisted to localStorage
export interface ReaderSettings {
  wpm: number // 100-1000, default 300
  chunkSize: number // 1-5, default 1
  sentencePauseMultiplier: number // default 3
  paragraphPauseMultiplier: number // default 4
  commaPauseMultiplier: number // default 2
  adaptiveTiming: boolean // default true
  theme: 'light' | 'dark' | 'system' // default 'system'
  orpColor: string // default '#ef4444' (red-500)
  fontSize: 'sm' | 'md' | 'lg' | 'xl' // default 'lg'
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  chunkSize: 1,
  sentencePauseMultiplier: 3,
  paragraphPauseMultiplier: 4,
  commaPauseMultiplier: 2,
  adaptiveTiming: true,
  theme: 'system',
  orpColor: '#ef4444',
  fontSize: 'lg',
}

// Reader state machine
export type ReaderState = 'idle' | 'playing' | 'paused' | 'finished'

export type ReaderAction =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'toggle' }
  | { type: 'seek'; index: number }
  | { type: 'next'; count?: number }
  | { type: 'prev'; count?: number }
  | { type: 'jump-sentence'; direction: 'next' | 'prev' }
  | { type: 'jump-paragraph'; direction: 'next' | 'prev' }
  | { type: 'restart' }
  | { type: 'set-wpm'; wpm: number }
  | { type: 'load'; tokens: Token[] }

// API types for content storage
export interface StoredContent {
  text: string
  createdAt: number
  source?: string
}

export interface ContentSubmitRequest {
  text: string
  source?: string
}

export interface ContentSubmitResponse {
  uuid: string
  expiresAt: number
}

export interface ContentRetrieveResponse {
  text: string
  createdAt: number
  expiresAt: number
}

// Recent text entry stored in localStorage
export interface RecentText {
  id: string
  preview: string // first 100 chars
  wordCount: number
  createdAt: number
}
