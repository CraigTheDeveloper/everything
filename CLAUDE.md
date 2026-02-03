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

Initial setup: `./init.sh` or manually run `npm install && cp .env.example .env && npx prisma generate && npx prisma db push && npm run seed`

## Architecture

**Stack**: Next.js 14 + TypeScript, Tailwind CSS + shadcn/ui, Prisma + SQLite, Recharts

**Structure**:
- `src/app/(pages)/` - Feature modules: body, time, medication, pushups, dogs, oral, achievements
- `src/app/api/` - REST endpoints matching each module plus `/gamification/*` and `/dashboard/*`
- `src/components/ui/` - shadcn/ui components (form-inputs, loading-states, progress-ring, toaster)
- `src/lib/utils.ts` - Utilities: `cn()`, `isToday()`, `xpForLevel()`, `getLevelTitle()`
- `prisma/schema.prisma` - Full database schema

**Pattern**: Client components (`'use client'`) fetch data via `useEffect` + API routes. No Context API; local state only.

## Core Business Rules

**Same-day only logging**: Users can only create/edit entries for today. This is enforced throughout:
- Use `isToday()` from `src/lib/utils.ts` for validation
- Date format: `yyyy-MM-dd` strings for comparisons
- Historical data is read-only

## Gamification System

- **XP formula**: `Math.floor(100 * Math.pow(1.5, level - 1))`
- **Level titles**: Novice (1-4) → Apprentice (5-9) → Dedicated (10-14) → Committed (15-19) → Unstoppable (20-29) → Master (30-39) → Legend (40+)
- **Streaks**: Global (perfect_day, showed_up) + module-specific
- Points calculated in API routes, triggering achievement checks

## Database Models

Key models in `prisma/schema.prisma`:
- **DailyLog** - Daily aggregate points and perfect day flag
- **BodyMetric/ProgressPhoto/BodyGoal** - Body tracking
- **TimeCategory/TimeActivity/TimeEntry/TimeGoal** - Time tracking
- **Medication/MedicationLog** - Medication with morning/afternoon/evening slots
- **PushupLog/PushupGoal** - Pushup tracking with yearly target
- **Dog/DogWalk/DogWalkDog** - Multi-dog walk sessions
- **OralHygieneLog** - Morning brush, evening brush, evening floss
- **Achievement/UserAchievement/Streak/Level/StreakFreeze** - Gamification

## Module Colors

Each module has accent colors defined in `tailwind.config.ts`:
- Body (green), Time (blue), Medication (purple), Pushups (orange), Dogs (teal), Oral (pink)

## API Conventions

- All modules under `/api/{module}/`
- Standard REST: GET for lists/details, POST for create, PUT/PATCH for update, DELETE for remove
- Same-day validation in mutation endpoints
- JSON responses with appropriate HTTP status codes
- Points/achievements recalculated after data changes

## Photo Storage

Progress photos stored in `/uploads/photos/` (gitignored). Database stores file paths. Three views per date: front, back, side.

## Windows Commands

When running Windows commands like `taskkill`, use double forward slashes for flags:
```bash
taskkill //PID 12345 //F
```
