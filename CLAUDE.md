# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VibeCheck** — a Next.js event discovery platform centered around a fullscreen Mapbox map with a draggable bottom drawer showing event cards, vibe/mood-based filtering, and Google Calendar integration.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

There is no test suite configured.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=       # Mapbox public token (mapbox.com)
GOOGLE_CLIENT_ID=               # Google OAuth client ID
GOOGLE_CLIENT_SECRET=           # Google OAuth client secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI= # e.g. http://localhost:3000/api/calendar/callback
```

## Architecture

**Framework**: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand for state.

### Page Layout (Home `/`)
The homepage layers three elements absolutely over each other:
1. `MapWrapper` (full-screen Mapbox map) as the base layer
2. Floating top bar (`Navbar` + `FilterBar`) with gradient fade
3. `EventsDrawer` — a persistent `vaul` bottom drawer with snap points (0.25 / 0.85 / 1.0)

The `useCalendarCallback` hook runs on the homepage to handle the Google OAuth redirect and fetch calendar events.

### State Management (`src/lib/store.ts`)
Single Zustand store `useEventStore` with persistence (localStorage key: `vibecheck-storage`). Persisted fields: `myRsvps`, `isCalendarConnected`, `calendarAccessToken`. The store holds the event list, active filter, selected map pin, RSVP list, and calendar state.

### Data (`src/lib/data.ts`)
All events are currently **mock data** (`MOCK_EVENTS`). The `Event` type has `coordinates: [lat, lng]` (note: Mapbox uses `[lng, lat]` order — the map components swap these). Event types are: `Academic | Party | Chill | Music | Food | Networking`.

### Map (`src/components/features/Map/EventMap.tsx`)
Uses `react-map-gl/mapbox`. Custom Mapbox style: `mapbox://styles/aaryan1524/cmksv988k005h01rw1doja9ot`. Hover on a marker shows a popup; click navigates to the event detail page. The "locate me" button is triggered via a `locateTrigger` counter in the store (increment = fire effect).

`MapWrapper` wraps `EventMap` with `dynamic` import and `ssr: false` to avoid SSR issues with Mapbox.

### Google Calendar Integration
- **OAuth flow**: `GET /api/calendar/connect` → redirects user to Google → `GET /api/calendar/callback` redirects back to `/?calendar_token=...`
- **Token handling**: `useCalendarCallback` hook reads the token from URL, saves it to the store, and POSTs to `/api/calendar/events` to fetch upcoming events
- **Schedule analysis** (`src/lib/schedule-analyzer.ts`): `detectConflict` and `calculateCompatibility` compare a VibeCheck event against the user's calendar events to produce a 0–100 score and status (`perfect | good | warning | conflict`). Assumes 2-hour event duration. Shown in the event detail page via `ScheduleBadge`.

### UI Conventions
- `src/components/ui/` — shadcn-style primitives (Button, Badge, Card, Drawer, Input, Textarea, Avatar)
- `src/components/ui/liquid-glass.tsx` — glassmorphism wrapper used for the drawer and locate button
- `src/components/features/` — composite feature components
- Always `"use client"` for components using hooks or browser APIs
- Dark mode only (`<html className="dark">` in layout)
- Path alias `@/` maps to `src/`
