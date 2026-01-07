'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface PushupStats {
  goal: {
    year: number
    yearlyTarget: number
  }
  progress: {
    yearlyTotal: number
    remaining: number
    progressPercentage: number
    daysElapsed: number
    daysRemaining: number
    requiredDailyPace: number
    todayTotal: number
    isOnTrack: boolean
  }
}

interface PushupLog {
  id: number
  date: string
  count: number
  createdAt: string
}

export default function PushupsPage() {
  const [stats, setStats] = useState<PushupStats | null>(null)
  const [todayLogs, setTodayLogs] = useState<PushupLog[]>([])
  const [customPushups, setCustomPushups] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/pushups/stats')
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }

      // Fetch today's logs
      const logsResponse = await fetch(`/api/pushups/logs?date=${todayString}`)
      if (logsResponse.ok) {
        const data = await logsResponse.json()
        setTodayLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching pushup data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [todayString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const logPushups = async (count: number) => {
    if (count <= 0) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/pushups/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Pushups logged!',
          description: data.message,
        })
        setCustomPushups('')
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to log pushups',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error logging pushups:', error)
      toast({
        title: 'Error',
        description: 'Failed to log pushups',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomSubmit = () => {
    const count = parseInt(customPushups, 10)
    if (count > 0) {
      logPushups(count)
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Pushup Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Yearly Goal Progress */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Yearly Goal Progress</h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : stats ? (
            <div className="space-y-4">
              {/* Main Progress Display */}
              <div className="text-center">
                <p className="text-5xl font-bold text-pushups">
                  {stats.progress.yearlyTotal.toLocaleString()}
                </p>
                <p className="text-lg text-muted-foreground">
                  / {stats.goal.yearlyTarget.toLocaleString()} pushups
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-pushups transition-all duration-500"
                  style={{ width: `${Math.min(stats.progress.progressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {stats.progress.progressPercentage.toFixed(1)}% complete
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{stats.progress.todayTotal}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{stats.progress.remaining.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{stats.progress.requiredDailyPace}</p>
                  <p className="text-xs text-muted-foreground">Daily Pace Needed</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold">{stats.progress.daysRemaining}</p>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
              </div>

              {/* On Track Indicator */}
              <div className={`rounded-lg p-3 text-center ${
                stats.progress.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <p className="font-medium">
                  {stats.progress.isOnTrack
                    ? '🎯 You\'re on track! Keep it up!'
                    : '💪 Push a little harder to catch up!'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No data available</p>
          )}
        </div>

        {/* Log Pushups Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Log Pushups</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => logPushups(10)}
              disabled={isSaving}
              className="touch-target rounded-md bg-pushups px-6 py-3 text-lg font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
            >
              +10
            </button>
            <button
              onClick={() => logPushups(15)}
              disabled={isSaving}
              className="touch-target rounded-md bg-pushups px-6 py-3 text-lg font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
            >
              +15
            </button>
            <button
              onClick={() => logPushups(20)}
              disabled={isSaving}
              className="touch-target rounded-md bg-pushups px-6 py-3 text-lg font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
            >
              +20
            </button>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Custom"
                value={customPushups}
                onChange={(e) => setCustomPushups(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                className="touch-target w-28 rounded-md border bg-input px-4 py-3 text-lg"
                min="1"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={isSaving || !customPushups}
                className="touch-target rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Today's Logs */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Entries</h2>
          {todayLogs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No pushups logged today. Get started above!
            </p>
          ) : (
            <div className="space-y-2">
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg bg-muted px-4 py-3"
                >
                  <span className="font-medium">{log.count} pushups</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
