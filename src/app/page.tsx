'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface OralHygieneLog {
  morningBrush: boolean
  eveningBrush: boolean
  eveningFloss: boolean
}

interface Achievement {
  id: number
  key: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlockedAt: string
}

export default function Home() {
  const [pushupTotal, setPushupTotal] = useState(0)
  const [customPushups, setCustomPushups] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [oralHygiene, setOralHygiene] = useState<OralHygieneLog>({
    morningBrush: false,
    eveningBrush: false,
    eveningFloss: false,
  })
  const [oralCount, setOralCount] = useState(0)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  // Fetch today's data
  const fetchTodayData = useCallback(async () => {
    try {
      // Fetch pushup data
      const pushupResponse = await fetch(`/api/pushups/logs?date=${todayString}`)
      if (pushupResponse.ok) {
        const data = await pushupResponse.json()
        setPushupTotal(data.total || 0)
      }

      // Fetch oral hygiene data
      const oralResponse = await fetch(`/api/oral/logs?date=${todayString}`)
      if (oralResponse.ok) {
        const data = await oralResponse.json()
        if (data.log) {
          setOralHygiene({
            morningBrush: data.log.morningBrush,
            eveningBrush: data.log.eveningBrush,
            eveningFloss: data.log.eveningFloss,
          })
        }
        setOralCount(data.completedCount || 0)
      }

      // Fetch recent achievements
      const achievementsResponse = await fetch('/api/gamification/achievements?recent=true&limit=3')
      if (achievementsResponse.ok) {
        const data = await achievementsResponse.json()
        setRecentAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error('Error fetching today data:', error)
    }
  }, [todayString])

  useEffect(() => {
    fetchTodayData()
  }, [fetchTodayData])

  // Log pushups
  const logPushups = async (count: number) => {
    if (count <= 0) return

    setIsLoading(true)
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
        setPushupTotal(data.todayTotal)
        toast({
          title: 'Pushups logged!',
          description: data.message,
        })
        setCustomPushups('')
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
      setIsLoading(false)
    }
  }

  const handleCustomSubmit = () => {
    const count = parseInt(customPushups, 10)
    if (count > 0) {
      logPushups(count)
    }
  }

  // Update oral hygiene
  const updateOralHygiene = async (field: keyof OralHygieneLog, value: boolean) => {
    try {
      const response = await fetch('/api/oral/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        const data = await response.json()
        setOralHygiene({
          morningBrush: data.log.morningBrush,
          eveningBrush: data.log.eveningBrush,
          eveningFloss: data.log.eveningFloss,
        })
        setOralCount(data.completedCount)
        toast({
          title: 'Oral hygiene updated!',
          description: data.message,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update oral hygiene',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating oral hygiene:', error)
      toast({
        title: 'Error',
        description: 'Failed to update oral hygiene',
        variant: 'destructive',
      })
    }
  }

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
              <p className="text-sm text-muted-foreground">{pushupTotal} today</p>
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
              <p className="text-sm text-muted-foreground">{oralCount}/3 done</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>

          {/* Pushups Quick Actions */}
          <div className="mb-4 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-medium">Log Pushups</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => logPushups(10)}
                disabled={isLoading}
                className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
              >
                +10
              </button>
              <button
                onClick={() => logPushups(15)}
                disabled={isLoading}
                className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
              >
                +15
              </button>
              <button
                onClick={() => logPushups(20)}
                disabled={isLoading}
                className="touch-target rounded-md bg-pushups px-4 py-2 font-medium text-pushups-foreground hover:opacity-90 disabled:opacity-50"
              >
                +20
              </button>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Custom"
                  value={customPushups}
                  onChange={(e) => setCustomPushups(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  className="touch-target w-24 rounded-md border bg-input px-3 py-2"
                  min="1"
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={isLoading || !customPushups}
                  className="touch-target rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Oral Hygiene Quick Actions */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-medium">Oral Hygiene</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={oralHygiene.morningBrush}
                  onChange={(e) => updateOralHygiene('morningBrush', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className="text-sm">Morning Brush</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={oralHygiene.eveningBrush}
                  onChange={(e) => updateOralHygiene('eveningBrush', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className="text-sm">Evening Brush</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={oralHygiene.eveningFloss}
                  onChange={(e) => updateOralHygiene('eveningFloss', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className="text-sm">Evening Floss</span>
              </label>
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

        {/* Recent Achievements */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Achievements</h2>
          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                    🏆
                  </span>
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      +{achievement.xpReward} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground shadow-sm">
              <p>No achievements unlocked yet. Keep tracking to earn badges!</p>
            </div>
          )}
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
