# Calendar Integration Agent Memory

## Project: VibeCheck (Next.js 16, TypeScript strict, Turbopack)

### Key File Paths
- OAuth helpers: `src/lib/calendar.ts`
- Schedule analysis: `src/lib/schedule-analyzer.ts`
- Zustand store: `src/lib/store.ts`
- Event data + types: `src/lib/data.ts`
- OAuth callback hook: `src/hooks/useCalendarCallback.ts`
- Callback handler component: `src/components/features/CalendarCallbackHandler.tsx`
- API routes: `src/app/api/calendar/{connect,callback,events,add-event,refresh}/route.ts`

### Token Storage Strategy
- Access token: URL param after OAuth redirect → client picks up via `useCalendarCallback` → stored in Zustand (`calendarAccessToken`) → persisted to `localStorage` via `zustand/persist`
- Refresh token: httpOnly cookie `calendar_refresh_token` (30 days), set in callback route, never exposed to JS
- Refresh endpoint: `POST /api/calendar/refresh` reads the cookie, calls `refreshAccessToken()`, returns new `{ accessToken }`

### useSearchParams Suspense Pattern (Next.js 16)
Any hook that calls `useSearchParams()` must be in a component wrapped by `<Suspense>`. Pattern used:
1. Inner component calls the hook and renders `null`
2. Outer wrapper component renders `<Suspense fallback={null}><Inner /></Suspense>`
3. See `src/components/features/CalendarCallbackHandler.tsx`

### Event Data — startAt Field
`src/lib/data.ts` Event interface has `startAt: string` (ISO 8601 with TZ offset, e.g. `"2026-02-27T21:00:00-05:00"`). Use this for ALL date math. `date` and `time` are display-only strings.
- All 5 MOCK_EVENTS have `startAt` set relative to 2026-02-27 (project "today"), America/New_York (-05:00)

### Conflict Detection
- Standard overlap: `eventA.start < eventB.end && eventA.end > eventB.start`
- Assumes 2-hour event duration (addHours(startAt, 2))
- All comparisons done in UTC via `new Date(isoString)`

### RSVP → Calendar Auto-Add
`src/app/events/[id]/page.tsx` — when Join is clicked and `isCalendarConnected`, calls `POST /api/calendar/add-event` automatically. Shows inline "Added to your calendar!" message for 4 seconds. Non-blocking: RSVP succeeds even if calendar add fails.

### API Response Shape
`{ success: boolean, data?: T, error?: { code: string, message: string } }`

### Dependencies Available (no new installs needed)
- `date-fns` — `addHours`, `format`, `parseISO`
- `googleapis` — Google Calendar v3
- `zustand` + `zustand/middleware` (persist)
- `next/headers` (cookies()) for server-side cookie access

### Known Quirks
- `getTokensFromCode` returns `tokens.refresh_token` as `null` if user previously granted consent without `prompt: 'consent'`. Always use `prompt: 'consent'` in `getGoogleAuthURL`.
- `calendar.events.list` returns `items: undefined` when calendar is empty — always default to `[]`.

See `patterns.md` for detailed implementation notes.
