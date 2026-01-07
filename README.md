# Everything

A personal habit/goal tracker and central life database with gamification. Built as a mobile-first web application for tracking multiple aspects of daily life and staying motivated through achievements, streaks, and XP.

## Features

### Tracking Modules
- **Body Tracking**: Weight, body fat %, muscle %, and progress photos
- **Time Tracking**: Start/stop timer, manual entries, category-based tracking
- **Medication Tracking**: Schedule management, compliance tracking
- **Pushup Tracking**: Daily counts with yearly goal progress
- **Dog Walk Tracking**: Multi-dog walks with distance, duration, and health metrics
- **Oral Hygiene**: Morning/evening brush and floss tracking with calendar visualization

### Gamification System
- **Points**: Earn daily, weekly, monthly, and lifetime points
- **Streaks**: Perfect day, showed up, and module-specific streaks
- **XP & Levels**: Progress from Novice to Legend
- **Achievements**: Unlock badges for milestones and consistency
- **Streak Freezes**: Preserve streaks when life gets in the way

### Core Design Principles
- **Same-day only logging**: Ensures data honesty (no retroactive changes)
- **Mobile-first**: Bottom navigation, touch-friendly targets
- **Encouraging tone**: No shame, celebration of progress
- **Real data only**: No mock data - everything persists to PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **State**: React state / Context API

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL installed and running locally

### Installation

1. Clone the repository
2. Run the initialization script:
   ```bash
   ./init.sh
   ```

   Or manually:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
everything/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Initial data seeding
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and database client
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── uploads/             # Local photo storage (gitignored)
├── init.sh              # Setup script
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data
- `npx prisma studio` - Open Prisma database viewer

## Theme Support

Toggle between light and dark themes. The preference is persisted in local storage.

## API Routes

The app exposes REST APIs under `/api/` for each module:
- `/api/settings` - Application settings
- `/api/body/*` - Body metrics and photos
- `/api/time/*` - Time tracking
- `/api/medication/*` - Medication management
- `/api/pushups/*` - Pushup logging
- `/api/dogs/*` - Dog and walk management
- `/api/oral/*` - Oral hygiene tracking
- `/api/gamification/*` - Points, streaks, achievements, levels
- `/api/dashboard/*` - Home page and overview data
- `/api/export/*` - Data export (JSON/CSV)

## Development Notes

- All data operations enforce same-day validation
- Historical data is read-only through the UI
- Points and achievements are calculated in real-time
- Streaks are updated automatically at end of day

## License

Private - Personal use only
