# Next.js Build Validator Memory

## Project: VibeCheck (event_finder)

### Build Setup
- Package manager: npm
- Build command: `npm run build`
- Next.js version: 16.1.4 with Turbopack
- TypeScript is configured — `npx tsc --noEmit` works without extra flags
- `.env.local` is required for environment variables (build may succeed without it locally)

### Route Structure (as of 2026-02-27)
Static: `/`, `/_not-found`, `/create`, `/profile`, `/search`
Dynamic: `/api/auth/[...nextauth]`, `/api/calendar/add-event`, `/api/calendar/callback`, `/api/calendar/connect`, `/api/calendar/events`, `/api/calendar/refresh`, `/events/[id]`

### Build Performance Baseline
- Turbopack compile time: ~5.9s
- Static page generation: ~116ms for 12 pages

### Notes
- No test suite configured (per CLAUDE.md)
- Dark mode only project; Mapbox SSR is handled with dynamic import + `ssr: false`
- First clean build observed on branch `Aaryan_updates`
