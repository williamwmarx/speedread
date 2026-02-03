# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

SpeedRead — an RSVP (Rapid Serial Visual Presentation) speed reading app. Words display one at a time centered on the Optimal Recognition Point (ORP) to minimize eye movement. All text processing is client-side; sharing uses short-lived server-stored links.

Live at **https://read.marx.sh**

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Web app dev server (Next.js + Turbopack)
bun run build            # Production build
bun run lint             # Lint all packages
bun run test             # Test all packages (no tests exist yet)
bun run api:dev          # Local Cloudflare Worker dev server
bun run api:deploy       # Deploy Worker to Cloudflare
```

## Architecture

Bun monorepo with three packages:

### `apps/web` — Next.js 15 App Router (React 19, TypeScript, Tailwind CSS 4)
- **`app/`** — Routes: `/` (text input), `/read` (RSVP reader), `/[uuid]` (shared content redirect)
- **`hooks/`** — Core state logic:
  - `use-reader.ts` — useReducer state machine (idle → playing → paused → finished) with auto-advance timing
  - `use-settings.ts` — Settings persistence to localStorage
  - `use-keyboard.ts` — Keyboard shortcut bindings
  - `use-recent-texts.ts` — localStorage history of read texts
  - `use-fit-font-size.ts` — Dynamic font scaling for long words
- **`lib/`** — Pure functions:
  - `parser.ts` — Text → Token[] (sentence/paragraph boundary detection, abbreviation awareness, chunking)
  - `timing.ts` — WPM-based duration with multipliers for word length, punctuation, sentence/paragraph ends
  - `orp.ts` — ORP index lookup table + word splitting into [before, highlight, after]
  - `font-sizes.ts` — Font size mappings
- **`components/`** — `reader/` (RSVP display, controls, settings, progress, preview), `input/` (text entry, recent texts), `ui/` (Radix-based primitives)
- React Compiler (experimental) enabled for auto-memoization

### `packages/api` — Cloudflare Worker
- Single file (`src/index.ts`): POST/GET/DELETE `/api/content` with KV storage
- Rate limiting (10 req/min per IP), 512KB max, 30-min TTL
- KV namespaces: `CONTENT_KV` (content), `RATE_LIMIT_KV` (rate tracking)
- CORS restricted to `https://read.marx.sh` in production

### `packages/shared` — Shared TypeScript types
- `Token`, `TokenMeta`, `ReaderSettings`, `ReaderState`, `ReaderAction`
- API request/response types (`StoredContent`, `ContentSubmitRequest/Response`, `ContentRetrieveResponse`)

## Key Patterns

- **State machine via useReducer** for reader playback — actions dispatched for play/pause/seek/navigate/speed changes
- **Token-based rendering** — text parsed once into Token[] with pre-computed ORP indices and timing multipliers; reader just indexes through the array
- **Timing multipliers** compound: base = 60000/WPM, then scaled by word length (1.0–1.4×), punctuation (2.0×), sentence end (2.5×), paragraph end (4.0×)
- **Share flow**: text → POST to API → UUID → `/{uuid}` route fetches content → redirects to `/read?text=...`

## Deployment

- Web app: Vercel (or similar, standard Next.js)
- API: Cloudflare Workers, auto-deployed via GitHub Actions on push to `main` when `packages/api/**` or `packages/shared/**` change
- Secrets needed: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
