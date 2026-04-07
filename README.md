# Streakless

Streakless is a local-first habit tracker built around momentum, consistency, and low-pressure recovery. It avoids streak counters entirely. Missing a day softens momentum instead of wiping out progress.

## Features
- Today view with grouped habits, one-tap check-ins, optional notes, and undo
- Habit management with frequency options, negative habits, rest days, pause/resume, and archive
- Stats with a 12-week heatmap, 6-month bars, rolling consistency trend, and milestone badges
- Theme preference, JSON export/import, and full localStorage persistence
- Basic PWA support with manifest + service worker

## Run locally
```bash
npm install
npm run dev
```

App runs on `http://localhost:5174`.

## Build
```bash
npm run build
```

## Deploy
### Vercel
- Import the repo into Vercel
- Vercel will use the included `vercel.json`
- Build command: `npm run build`
- Output directory: `dist`

### Static hosting
Any host that can serve the `dist/` directory will work.
