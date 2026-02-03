'use client'

import { useReducer, useCallback, useRef, useEffect } from 'react'
import type { Token, ReaderState, ReaderAction, ReaderSettings } from '@speedread/shared'
import { tokenDuration } from '@/lib/timing'

interface State {
  status: ReaderState
  tokens: Token[]
  currentIndex: number
  wpm: number
}

const initialState: State = {
  status: 'idle',
  tokens: [],
  currentIndex: 0,
  wpm: 400,
}

function reducer(state: State, action: ReaderAction): State {
  switch (action.type) {
    case 'load':
      return {
        ...state,
        status: 'idle',
        tokens: action.tokens,
        currentIndex: 0,
      }

    case 'play':
      if (state.tokens.length === 0) return state
      if (state.status === 'finished') {
        return { ...state, status: 'playing', currentIndex: 0 }
      }
      return { ...state, status: 'playing' }

    case 'pause':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state

    case 'toggle':
      if (state.tokens.length === 0) return state
      if (state.status === 'playing') return { ...state, status: 'paused' }
      if (state.status === 'finished') return { ...state, status: 'playing', currentIndex: 0 }
      return { ...state, status: 'playing' }

    case 'seek': {
      const index = Math.max(0, Math.min(action.index, state.tokens.length - 1))
      return { ...state, currentIndex: index, status: state.status === 'finished' ? 'paused' : state.status }
    }

    case 'next': {
      const count = action.count ?? 1
      const nextIndex = Math.min(state.currentIndex + count, state.tokens.length - 1)
      const isFinished = nextIndex >= state.tokens.length - 1 && state.status === 'playing'
      return {
        ...state,
        currentIndex: nextIndex,
        status: isFinished ? 'finished' : state.status,
      }
    }

    case 'prev': {
      const count = action.count ?? 1
      const prevIndex = Math.max(0, state.currentIndex - count)
      return { ...state, currentIndex: prevIndex, status: state.status === 'finished' ? 'paused' : state.status }
    }

    case 'jump-sentence': {
      if (action.direction === 'next') {
        // Find next sentence start
        for (let i = state.currentIndex + 1; i < state.tokens.length; i++) {
          if (state.tokens[i].meta.sentenceStart) {
            return { ...state, currentIndex: i }
          }
        }
        return state // No next sentence
      } else {
        // Find previous sentence start
        for (let i = state.currentIndex - 1; i >= 0; i--) {
          if (state.tokens[i].meta.sentenceStart) {
            return { ...state, currentIndex: i }
          }
        }
        return { ...state, currentIndex: 0 }
      }
    }

    case 'jump-sentences': {
      let newIndex = state.currentIndex
      let jumps = 0

      if (action.direction === 'next') {
        for (let i = state.currentIndex + 1; i < state.tokens.length && jumps < action.count; i++) {
          if (state.tokens[i].meta.sentenceStart) {
            newIndex = i
            jumps++
          }
        }
      } else {
        for (let i = state.currentIndex - 1; i >= 0 && jumps < action.count; i--) {
          if (state.tokens[i].meta.sentenceStart) {
            newIndex = i
            jumps++
          }
        }
        if (jumps === 0) newIndex = 0
      }

      return { ...state, currentIndex: newIndex, status: state.status === 'finished' ? 'paused' : state.status }
    }

    case 'jump-paragraph': {
      if (action.direction === 'next') {
        // Find next paragraph start
        for (let i = state.currentIndex + 1; i < state.tokens.length; i++) {
          if (state.tokens[i].meta.paragraphStart) {
            return { ...state, currentIndex: i }
          }
        }
        return state
      } else {
        // Find previous paragraph start
        for (let i = state.currentIndex - 1; i >= 0; i--) {
          if (state.tokens[i].meta.paragraphStart) {
            return { ...state, currentIndex: i }
          }
        }
        return { ...state, currentIndex: 0 }
      }
    }

    case 'restart':
      return { ...state, currentIndex: 0, status: 'paused' }

    case 'set-wpm':
      return { ...state, wpm: Math.max(100, Math.min(1000, action.wpm)) }

    default:
      return state
  }
}

export interface UseReaderReturn {
  status: ReaderState
  tokens: Token[]
  currentIndex: number
  currentToken: Token | null
  wpm: number
  load: (tokens: Token[]) => void
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (index: number) => void
  next: (count?: number) => void
  prev: (count?: number) => void
  jumpSentence: (direction: 'next' | 'prev') => void
  jumpSentences: (direction: 'next' | 'prev', count: number) => void
  jumpParagraph: (direction: 'next' | 'prev') => void
  restart: () => void
  setWpm: (wpm: number) => void
}

export function useReader(settings: ReaderSettings): UseReaderReturn {
  const [state, dispatch] = useReducer(reducer, { ...initialState, wpm: settings.wpm })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync WPM from settings
  useEffect(() => {
    dispatch({ type: 'set-wpm', wpm: settings.wpm })
  }, [settings.wpm])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Auto-advance when playing
  useEffect(() => {
    if (state.status !== 'playing' || state.tokens.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const currentToken = state.tokens[state.currentIndex]
    if (!currentToken) return

    const duration = tokenDuration(currentToken, { ...settings, wpm: state.wpm })

    timerRef.current = setTimeout(() => {
      dispatch({ type: 'next' })
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [state.status, state.currentIndex, state.tokens, state.wpm, settings])

  const currentToken = state.tokens[state.currentIndex] ?? null

  return {
    status: state.status,
    tokens: state.tokens,
    currentIndex: state.currentIndex,
    currentToken,
    wpm: state.wpm,
    load: useCallback((tokens: Token[]) => dispatch({ type: 'load', tokens }), []),
    play: useCallback(() => dispatch({ type: 'play' }), []),
    pause: useCallback(() => dispatch({ type: 'pause' }), []),
    toggle: useCallback(() => dispatch({ type: 'toggle' }), []),
    seek: useCallback((index: number) => dispatch({ type: 'seek', index }), []),
    next: useCallback((count?: number) => dispatch({ type: 'next', count }), []),
    prev: useCallback((count?: number) => dispatch({ type: 'prev', count }), []),
    jumpSentence: useCallback((direction: 'next' | 'prev') => dispatch({ type: 'jump-sentence', direction }), []),
    jumpSentences: useCallback((direction: 'next' | 'prev', count: number) => dispatch({ type: 'jump-sentences', direction, count }), []),
    jumpParagraph: useCallback((direction: 'next' | 'prev') => dispatch({ type: 'jump-paragraph', direction }), []),
    restart: useCallback(() => dispatch({ type: 'restart' }), []),
    setWpm: useCallback((wpm: number) => dispatch({ type: 'set-wpm', wpm }), []),
  }
}
