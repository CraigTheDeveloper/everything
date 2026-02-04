# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Everything is a personal habit/goal tracker with gamification. Single-user, mobile-first web app for tracking body metrics, time, medication, pushups, dog walks, and oral hygiene. Points, achievements, streaks, and XP maintain motivation.

## Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run seed             # Seed database
npm run db:push          # Sync Prisma schema to database
npm run db:generate      # Generate Prisma client
npm run db:studio        # Prisma Studio (database GUI)
```

Initial setup (manual - recommended):
```bash
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL="file:./dev.db" and configure Google OAuth credentials
npx prisma generate
npx prisma db push
npm run seed
```

Note: `init.sh` exists but expects PostgreSQL. The project uses SQLite by default (see `prisma/schema.prisma`).

## Architecture

**Stack**: Next.js 16 + TypeScript, Tailwind CSS 3.3 + shadcn/ui (Radix UI), Prisma + SQLite, Recharts 2.10, NextAuth 4.24 (Google OAuth), next-themes, date-fns

**Structure**:
- `src/app/(app)/` - Feature modules: body, time, medication, pushups, dogs, oral, achievements
- `src/app/(auth)/` - Authentication pages (login)
- `src/app/api/` - REST endpoints matching each module plus `/gamification/*`, `/auth/*`, `/export`
- `src/components/` - Navigation, theme providers, user menu
- `src/components/ui/` - shadcn/ui components (form-inputs, loading-states, progress-ring, toaster, avatar, dropdown-menu)
- `src/lib/utils.ts` - Utilities (see below)
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/auth.ts` - NextAuth configuration
- `prisma/schema.prisma` - Full database schema

**Pattern**: Client components (`'use client'`) fetch data via `useEffect` + API routes. No Context API; local state only.

## Core Business Rules

**Same-day only logging**: Users can only create/edit entries for today. This is enforced throughout:
- Use `isToday()` from `src/lib/utils.ts` for validation
- Date format: `yyyy-MM-dd` strings for comparisons
- Historical data is read-only

## Date Handling

**Local dates only** - no timezone/UTC conversion:
- Dates stored as local JS Date objects in SQLite
- API parameters use `yyyy-MM-dd` string format
- Date range queries use `gte` (start of day) and `lt` (start of next day)
- Local date construction: `new Date(year, month - 1, day)`
- Helper functions in API routes: `parseLocalDate()`, `getDateString()`, `formatDate()`

## Utility Functions

`src/lib/utils.ts` exports:
- `cn()` - Merge Tailwind classes
- `isToday()` - Check if date is today
- `getTodayDate()` - Get today at midnight
- `formatDate()` - Format date for display
- `xpForLevel()` - Calculate XP for level
- `getLevelTitle()` - Get level name
- `remainingDaysInYear()` - Days left in year
- `dayOfYear()` - Current day number (1-365/366)

## Gamification System

- **XP formula**: `Math.floor(100 * Math.pow(1.5, level - 1))`
- **Level titles**: Novice (1-4) -> Apprentice (5-9) -> Dedicated (10-14) -> Committed (15-19) -> Unstoppable (20-29) -> Master (30-39) -> Legend (40+)
- **Streaks**: Global (perfect_day, showed_up) + module-specific
- Points calculated in API routes, triggering achievement checks

## Database Models

Key models in `prisma/schema.prisma`:
- **Settings** - Theme and photo directory configuration
- **DailyLog** - Daily aggregate points and perfect day flag
- **BodyMetric/ProgressPhoto/BodyGoal** - Body tracking
- **TimeCategory/TimeActivity/TimeEntry/TimeGoal** - Time tracking
- **Medication/MedicationLog** - Medication with morning/afternoon/evening slots
- **PushupLog/PushupGoal** - Pushup tracking with yearly target
- **Dog/DogWalk/DogWalkDog** - Multi-dog walk sessions
- **OralHygieneLog** - Morning brush, evening brush, evening floss
- **Achievement/UserAchievement/Streak/Level/StreakFreeze** - Gamification

## Module Colors

Each module has accent colors defined in `tailwind.config.ts` (HSL values in `globals.css`):
- **Body** (purple): 270° 60%
- **Time** (blue): 221.2° 83.2%
- **Medication** (green): 142.1° 76.2%
- **Pushups** (orange): 24.6° 95%
- **Dogs** (gold/amber): 37.7° 92.1%
- **Oral** (cyan): 186.9° 71.6%

Custom animations defined in tailwind config: `pulse-scale`, `celebrate`

## API Conventions

- All modules under `/api/{module}/`
- Standard REST: GET for lists/details, POST for create, PUT/PATCH for update, DELETE for remove
- Same-day validation in mutation endpoints
- JSON responses with appropriate HTTP status codes
- Points/achievements recalculated after data changes

Additional endpoints:
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/export` - Export all user data
- `/api/uploads/[...path]` - Serve uploaded files

## Authentication

Uses NextAuth with **Google OAuth** provider. Configuration in `src/lib/auth.ts`.

**Key details**:
- Single-user enforcement via `AUTH_ALLOWED_EMAIL` whitelist in `.env`
- JWT session strategy with 30-day expiration
- Custom sign-in/error pages at `/login`
- Required env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_ALLOWED_EMAIL`
- Google Cloud Console redirect URI: `{NEXTAUTH_URL}/api/auth/callback/google`

## Theming

Dark/light mode support via next-themes. Theme provider in `src/components/theme-provider.tsx`, toggle in `src/components/theme-toggle.tsx`.

## Photo Storage

Progress photos stored in `/uploads/photos/` (gitignored). Database stores file paths. Three views per date: front, back, side.

## Environment Variables

Required in `.env`:
```
DATABASE_URL="file:./dev.db"          # SQLite (default) or PostgreSQL connection
AUTH_SECRET="..."                      # Generate with: openssl rand -base64 32
AUTH_GOOGLE_ID="..."                   # Google OAuth client ID
AUTH_GOOGLE_SECRET="..."               # Google OAuth client secret
AUTH_ALLOWED_EMAIL="user@example.com"  # Single allowed user email
NEXTAUTH_URL="http://localhost:3000"   # App URL (update for production)
```

## Windows Commands

When running Windows commands like `taskkill`, use double forward slashes for flags:
```bash
taskkill //PID 12345 //F
```
