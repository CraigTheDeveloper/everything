'use client'

import { format } from 'date-fns'

export default function Home() {
  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Everything</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Daily Points Card */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Daily Points</h2>
          <p className="text-4xl font-bold text-primary">0</p>
        </div>

        {/* Module Progress Grid */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Today's Progress</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Body Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-body" />
              <h3 className="font-medium">Body</h3>
              <p className="text-sm text-muted-foreground">Not started</p>
            </div>

            {/* Time Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-time" />
              <h3 className="font-medium">Time</h3>
              <p className="text-sm text-muted-foreground">Not started</p>
            </div>

            {/* Medication Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-medication" />
              <h3 className="font-medium">Meds</h3>
              <p className="text-sm text-muted-foreground">Not started</p>
            </div>

            {/* Pushups Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-pushups" />
              <h3 className="font-medium">Pushups</h3>
              <p className="text-sm text-muted-foreground">0 today</p>
            </div>

            {/* Dogs Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-dogs" />
              <h3 className="font-medium">Dogs</h3>
              <p className="text-sm text-muted-foreground">No walks</p>
            </div>

            {/* Oral Module */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 h-2 w-2 rounded-full bg-oral" />
              <h3 className="font-medium">Oral</h3>
              <p className="text-sm text-muted-foreground">0/3 done</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-medium">Log Pushups</h3>
            <div className="flex flex-wrap gap-2">
              <button className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90">
                +10
              </button>
              <button className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90">
                +15
              </button>
              <button className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90">
                +20
              </button>
              <input
                type="number"
                placeholder="Custom"
                className="touch-target w-24 rounded-md border bg-input px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Streaks Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Active Streaks</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">Perfect Day</p>
                <p className="text-sm text-muted-foreground">0 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium">Showed Up</p>
                <p className="text-sm text-muted-foreground">0 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Level Progress</h2>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Level 1</p>
                <p className="text-sm text-muted-foreground">Novice</p>
              </div>
              <p className="text-sm text-muted-foreground">0 / 100 XP</p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 rounded-full bg-primary transition-all" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
