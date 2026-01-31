'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { ProgressRing, AnimatedProgressBar, AnimatedCounter } from '@/components/ui/progress-ring'
import { EmptyState, Spinner, ModuleCardSkeleton } from '@/components/ui/loading-states'

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

interface MedicationStatus {
  id: number
  name: string
  dosage: string
  frequency: string
  slots: {
    timeOfDay: string
    taken: boolean
  }[]
}

interface LevelData {
  currentXP: number
  currentLevel: number
  xpForNextLevel: number
  levelTitle: string
}

export default function Home() {
  const [pushupTotal, setPushupTotal] = useState(0)
  const [customPushups, setCustomPushups] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [oralHygiene, setOralHygiene] = useState<OralHygieneLog>({
    morningBrush: false,
    eveningBrush: false,
    eveningFloss: false,
  })
  const [oralCount, setOralCount] = useState(0)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [medications, setMedications] = useState<MedicationStatus[]>([])
  const [medicationCount, setMedicationCount] = useState({ complete: 0, total: 0, takenSlots: 0, totalSlots: 0 })
  const [levelData, setLevelData] = useState<LevelData>({ currentXP: 0, currentLevel: 1, xpForNextLevel: 100, levelTitle: 'Novice' })
  const [dailyPoints, setDailyPoints] = useState(0)
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

      // Fetch medication status
      const medicationResponse = await fetch(`/api/medication/status?date=${todayString}`)
      if (medicationResponse.ok) {
        const data = await medicationResponse.json()
        setMedications(data.medications || [])
        const meds = data.medications || []
        const takenSlots = meds.reduce((acc: number, m: MedicationStatus) =>
          acc + m.slots.filter((s: { taken: boolean }) => s.taken).length, 0)
        const totalSlots = meds.reduce((acc: number, m: MedicationStatus) => acc + m.slots.length, 0)
        setMedicationCount({
          complete: meds.filter((m: MedicationStatus) =>
            m.slots.every((s: { taken: boolean }) => s.taken)
          ).length || 0,
          total: meds.length || 0,
          takenSlots,
          totalSlots
        })
      }

      // Fetch level data
      const levelResponse = await fetch('/api/gamification/level')
      if (levelResponse.ok) {
        const data = await levelResponse.json()
        setLevelData({
          currentXP: data.currentXP || 0,
          currentLevel: data.currentLevel || 1,
          xpForNextLevel: data.xpForNextLevel || 100,
          levelTitle: data.levelTitle || 'Novice'
        })
      }

      // Fetch daily points
      const pointsResponse = await fetch('/api/gamification/points')
      if (pointsResponse.ok) {
        const data = await pointsResponse.json()
        setDailyPoints(data.daily || 0)
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

  // Toggle medication taken status
  const toggleMedication = async (medicationId: number, timeOfDay: string, taken: boolean) => {
    try {
      const response = await fetch('/api/medication/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicationId,
          timeOfDay,
          taken,
        }),
      })

      if (response.ok) {
        // Refresh medication status
        const statusResponse = await fetch(`/api/medication/status?date=${todayString}`)
        if (statusResponse.ok) {
          const data = await statusResponse.json()
          setMedications(data.medications || [])
          const meds = data.medications || []
          const takenSlots = meds.reduce((acc: number, m: MedicationStatus) =>
            acc + m.slots.filter((s: { taken: boolean }) => s.taken).length, 0)
          const totalSlots = meds.reduce((acc: number, m: MedicationStatus) => acc + m.slots.length, 0)
          setMedicationCount({
            complete: meds.filter((m: MedicationStatus) =>
              m.slots.every((s: { taken: boolean }) => s.taken)
            ).length || 0,
            total: meds.length || 0,
            takenSlots,
            totalSlots
          })
        }
        toast({
          title: taken ? 'Medication taken!' : 'Medication unmarked',
          description: taken ? 'Great job staying on track!' : 'Updated medication log',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update medication',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating medication:', error)
      toast({
        title: 'Error',
        description: 'Failed to update medication',
        variant: 'destructive',
      })
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

  // Calculate progress percentages for modules
  const oralProgress = Math.round((oralCount / 3) * 100)
  const medsProgress = medicationCount.totalSlots > 0
    ? Math.round((medicationCount.takenSlots / medicationCount.totalSlots) * 100)
    : 0
  const xpProgress = levelData.xpForNextLevel > 0
    ? Math.round((levelData.currentXP / levelData.xpForNextLevel) * 100)
    : 0

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 pb-24 md:pb-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero Section - Daily Summary */}
        <section className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8 border border-primary/10 animate-fade-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!</h1>
                <p className="text-lg text-muted-foreground mt-1">{formattedDate}</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Daily Points */}
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">
                    <AnimatedCounter value={dailyPoints} duration={800} />
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">Daily Points</p>
                </div>
                {/* Level Badge */}
                <div className="hidden md:flex flex-col items-center px-4 py-2 rounded-xl bg-background/50 border border-border">
                  <span className="text-2xl font-bold text-primary">Lv.{levelData.currentLevel}</span>
                  <span className="text-xs text-muted-foreground">{levelData.levelTitle}</span>
                </div>
              </div>
            </div>
            {/* Quick Stats Bar */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-full bg-oral/10 text-oral text-sm font-medium flex items-center gap-1.5">
                🦷 <span>{oralCount}/3</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-pushups/10 text-pushups text-sm font-medium flex items-center gap-1.5">
                💪 <span>{pushupTotal} pushups</span>
              </div>
              {medicationCount.totalSlots > 0 && (
                <div className="px-3 py-1.5 rounded-full bg-medication/10 text-medication text-sm font-medium flex items-center gap-1.5">
                  💊 <span>{medicationCount.takenSlots}/{medicationCount.totalSlots} doses</span>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5">
                ⚡ <span>{levelData.currentXP} XP</span>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Progress</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Module Progress - Bento Box Layout */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Pushups - Featured (larger) */}
          <a href="/pushups" className="col-span-2 md:row-span-2 module-card module-card-pushups cursor-pointer p-5 flex flex-col justify-between group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pushups</h3>
                <p className="text-sm text-muted-foreground mt-1">Daily challenge</p>
              </div>
              <ProgressRing
                progress={Math.min(100, Math.round((pushupTotal / 100) * 100))}
                size={56}
                strokeWidth={5}
                gradientFrom="hsl(var(--pushups))"
                gradientTo="hsl(30 90% 55%)"
              />
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-pushups">
                <AnimatedCounter value={pushupTotal} duration={600} />
              </p>
              <p className="text-sm text-muted-foreground">pushups today</p>
            </div>
          </a>

          {/* Oral Hygiene */}
          <a href="/oral" className="module-card module-card-oral cursor-pointer p-4 flex flex-col group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Teeth</h3>
              <ProgressRing
                progress={oralProgress}
                size={40}
                strokeWidth={4}
                gradientFrom="hsl(var(--oral))"
                gradientTo="hsl(190 80% 55%)"
              />
            </div>
            <p className="text-2xl font-bold text-oral">{oralCount}/3</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </a>

          {/* Meds */}
          <a href="/medication" className="module-card module-card-medication cursor-pointer p-4 flex flex-col group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Meds</h3>
              <ProgressRing
                progress={medsProgress}
                size={40}
                strokeWidth={4}
                gradientFrom="hsl(var(--medication))"
                gradientTo="hsl(140 60% 55%)"
              />
            </div>
            <p className="text-2xl font-bold text-medication">
              {medicationCount.totalSlots > 0 ? `${medicationCount.takenSlots}/${medicationCount.totalSlots}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {medicationCount.totalSlots > 0 ? 'doses' : 'no meds'}
            </p>
          </a>

          {/* Body */}
          <a href="/body" className="module-card module-card-body cursor-pointer p-4 flex flex-col group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Body</h3>
              <ProgressRing
                progress={0}
                size={40}
                strokeWidth={4}
                gradientFrom="hsl(var(--body))"
                gradientTo="hsl(280 60% 65%)"
              />
            </div>
            <p className="text-2xl font-bold text-body">0%</p>
            <p className="text-xs text-muted-foreground">tracked</p>
          </a>

          {/* Time */}
          <a href="/time" className="module-card module-card-time cursor-pointer p-4 flex flex-col group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Time</h3>
              <ProgressRing
                progress={0}
                size={40}
                strokeWidth={4}
                gradientFrom="hsl(var(--time))"
                gradientTo="hsl(210 80% 65%)"
              />
            </div>
            <p className="text-2xl font-bold text-time">0h</p>
            <p className="text-xs text-muted-foreground">logged</p>
          </a>

          {/* Dogs */}
          <a href="/dogs" className="module-card module-card-dogs cursor-pointer p-4 flex flex-col group hover:scale-[1.02] transition-transform animate-fade-in-up stagger-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Dogs</h3>
              <ProgressRing
                progress={0}
                size={40}
                strokeWidth={4}
                gradientFrom="hsl(var(--dogs))"
                gradientTo="hsl(45 90% 55%)"
              />
            </div>
            <p className="text-2xl font-bold text-dogs">0</p>
            <p className="text-xs text-muted-foreground">walks today</p>
          </a>
        </div>

        {/* Divider */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Quick Actions Section - Asymmetric Grid */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pushups Quick Actions - Featured */}
          <div className="md:col-span-2 lg:col-span-1 card-interactive p-5 border-2 border-pushups/20 bg-gradient-to-br from-pushups/5 to-transparent animate-fade-in-up stagger-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💪</span>
              <h3 className="font-semibold">Log Pushups</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => logPushups(10)}
                disabled={isLoading}
                className="touch-target btn-interactive rounded-xl bg-pushups px-5 py-2.5 font-bold text-pushups-foreground shadow-soft hover:shadow-elevated disabled:opacity-50 transition-all"
              >
                +10
              </button>
              <button
                onClick={() => logPushups(15)}
                disabled={isLoading}
                className="touch-target btn-interactive rounded-xl bg-pushups px-5 py-2.5 font-bold text-pushups-foreground shadow-soft hover:shadow-elevated disabled:opacity-50 transition-all"
              >
                +15
              </button>
              <button
                onClick={() => logPushups(20)}
                disabled={isLoading}
                className="touch-target btn-interactive rounded-xl bg-pushups px-5 py-2.5 font-bold text-pushups-foreground shadow-soft hover:shadow-elevated disabled:opacity-50 transition-all"
              >
                +20
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="number"
                placeholder="Custom"
                value={customPushups}
                onChange={(e) => setCustomPushups(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                className="touch-target input-polished flex-1 rounded-xl"
                min="1"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={isLoading || !customPushups}
                className="touch-target btn-interactive rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-soft hover:shadow-elevated disabled:opacity-50 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Oral Hygiene Quick Actions */}
          <div className="card-interactive p-5 border-2 border-oral/20 bg-gradient-to-br from-oral/5 to-transparent animate-fade-in-up stagger-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🦷</span>
              <h3 className="font-semibold">Oral Hygiene</h3>
            </div>
            <div className="flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center gap-3 p-2 rounded-lg transition-colors ${oralHygiene.morningBrush ? 'bg-oral/10' : 'hover:bg-muted/50'}`}>
                <input
                  type="checkbox"
                  checked={oralHygiene.morningBrush}
                  onChange={(e) => updateOralHygiene('morningBrush', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className={`text-sm ${oralHygiene.morningBrush ? 'line-through text-muted-foreground' : ''}`}>Morning Brush</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 p-2 rounded-lg transition-colors ${oralHygiene.eveningBrush ? 'bg-oral/10' : 'hover:bg-muted/50'}`}>
                <input
                  type="checkbox"
                  checked={oralHygiene.eveningBrush}
                  onChange={(e) => updateOralHygiene('eveningBrush', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className={`text-sm ${oralHygiene.eveningBrush ? 'line-through text-muted-foreground' : ''}`}>Evening Brush</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 p-2 rounded-lg transition-colors ${oralHygiene.eveningFloss ? 'bg-oral/10' : 'hover:bg-muted/50'}`}>
                <input
                  type="checkbox"
                  checked={oralHygiene.eveningFloss}
                  onChange={(e) => updateOralHygiene('eveningFloss', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-oral focus:ring-oral"
                />
                <span className={`text-sm ${oralHygiene.eveningFloss ? 'line-through text-muted-foreground' : ''}`}>Evening Floss</span>
              </label>
            </div>
          </div>

          {/* Medication Quick Actions */}
          {medications.length > 0 && (
            <div className="card-interactive p-5 border-2 border-medication/20 bg-gradient-to-br from-medication/5 to-transparent animate-fade-in-up stagger-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💊</span>
                <h3 className="font-semibold">Medications</h3>
              </div>
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{med.name}</span>
                      {med.dosage && <span className="text-xs text-muted-foreground px-2 py-0.5 bg-background rounded-full">{med.dosage}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {med.slots.map((slot) => (
                        <label
                          key={`${med.id}-${slot.timeOfDay}`}
                          className={`flex cursor-pointer items-center gap-2 px-2 py-1 rounded-md transition-colors ${slot.taken ? 'bg-medication/20' : 'hover:bg-muted/50'}`}
                        >
                          <input
                            type="checkbox"
                            checked={slot.taken}
                            onChange={(e) => toggleMedication(med.id, slot.timeOfDay, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-medication focus:ring-medication"
                          />
                          <span className={`text-xs capitalize ${slot.taken ? 'line-through text-muted-foreground' : ''}`}>{slot.timeOfDay}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Streaks Section */}
        <div className="mb-6 animate-fade-in-up stagger-4">
          <h2 className="mb-4 text-xl heading-section">Active Streaks</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card-interactive flex items-center gap-3 p-4">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">Perfect Day</p>
                <p className="text-sm text-muted-foreground">0 days</p>
              </div>
            </div>
            <div className="card-interactive flex items-center gap-3 p-4">
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
          <h2 className="mb-4 text-xl heading-section">Recent Achievements</h2>
          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="card-interactive flex items-center gap-3 p-4"
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
            <div className="card-interactive overflow-hidden">
              <EmptyState
                title="Achievements Await!"
                description="Keep tracking your habits to unlock badges and earn XP. Your first achievement is just around the corner!"
                className="py-8"
              />
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl heading-section">Level Progress</h2>
          <div className="card-interactive p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl stat-number">Level <AnimatedCounter value={levelData.currentLevel} duration={600} /></p>
                <p className="text-sm text-muted-foreground">{levelData.levelTitle}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <AnimatedCounter value={levelData.currentXP} duration={600} /> / {levelData.xpForNextLevel} XP
              </p>
            </div>
            <AnimatedProgressBar
              progress={xpProgress}
              height={10}
              gradientFrom="hsl(var(--primary))"
              gradientTo="hsl(270 60% 55%)"
              showGlowOnComplete={true}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        {/* FAB Menu Items */}
        <div className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <a
            href="/pushups"
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-pushups text-pushups-foreground shadow-elevated whitespace-nowrap"
          >
            💪 Log Pushups
          </a>
          <a
            href="/oral"
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-oral text-oral-foreground shadow-elevated whitespace-nowrap"
          >
            🦷 Oral Hygiene
          </a>
          <a
            href="/medication"
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-medication text-medication-foreground shadow-elevated whitespace-nowrap"
          >
            💊 Medications
          </a>
          <a
            href="/body"
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-body text-body-foreground shadow-elevated whitespace-nowrap"
          >
            📊 Body Metrics
          </a>
        </div>

        {/* FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center text-2xl transition-transform duration-300 ${fabOpen ? 'rotate-45' : ''}`}
          aria-label="Quick actions"
        >
          +
        </button>
      </div>
    </main>
  )
}
