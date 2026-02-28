# Implementation Patterns

## OAuth Flow (end-to-end)

1. User clicks "Connect Calendar" in `CalendarConnectButton`
2. Client fetches `GET /api/calendar/connect` → gets `{ authUrl }`
3. Redirect to Google OAuth (`prompt: 'consent'` ensures refresh token)
4. Google redirects to `GET /api/calendar/callback?code=...`
5. Server exchanges code → gets `{ access_token, refresh_token, expiry_date }`
6. Server sets `calendar_refresh_token` httpOnly cookie (30 days)
7. Server redirects to `/?calendar_token=ACCESS_TOKEN`
8. `CalendarCallbackHandler` (via `useCalendarCallback`) reads URL param
9. Stores access token in Zustand, calls `POST /api/calendar/events`
10. If events fetch returns `expired: true`, calls `POST /api/calendar/refresh`, retries once

## Token Refresh Race Condition Note
Current implementation does NOT protect against concurrent refresh calls (multiple tabs). For production, implement a mutex or check if a refresh is already in-flight before calling the refresh endpoint.

## Schedule Analyzer Pure Functions
All three functions in `schedule-analyzer.ts` are pure (no side effects):
- `detectConflict(event, calendarEvents)` → ConflictResult
- `calculateCompatibility(event, calendarEvents)` → CompatibilityResult
- `findFreeTimeSlots(calendarEvents, date, minDuration?)` → TimeSlot[]
- `getFreeHoursForDay(calendarEvents, date)` → number

## Google API Error Handling
Token expiry strings to detect: `'invalid_grant'`, `'Token has been expired'`
Always check `error.message?.includes(...)` since googleapis wraps errors.

## Calendar Events Fetch Window
`POST /api/calendar/events` fetches events from `now` to `addDays(now, 30)`.
Cached in Zustand store; refetched only on new OAuth callback (no background polling).
