# SpeedRead

A speed reading app using [Rapid Serial Visual Presentation (RSVP)](https://en.wikipedia.org/wiki/Rapid_serial_visual_presentation). Words are displayed one at a time, centered on the [Optimal Recognition Point](https://en.wikipedia.org/wiki/Optimal_recognition_point) — the position where the eye naturally fixates — to minimize eye movement and maximize reading speed.

All text processing happens client-side. Content can optionally be shared via short-lived server-stored links.

## Features

- Adjustable reading speed (100–1000 WPM)
- Chunked display (1–3 words at a time)
- Adaptive timing for long words and punctuation
- Keyboard shortcuts and gesture controls
- Dark/light theme
- Shareable links with auto-expiring storage

## Getting Started

```bash
bun install

# Run the web app
bun run dev

# Run the API locally
bun run api:dev
```

## License

[Apache License 2.0](LICENSE.md)
