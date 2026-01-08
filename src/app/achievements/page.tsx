'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'

interface Achievement {
  id: number
  key: string
  name: string
  description: string
  icon: string
  isHidden: boolean
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
}

interface LevelInfo {
  currentXP: number
  currentLevel: number
  title: string
  xpForCurrentLevel: number
  xpToNextLevel: number
  progressPercent: number
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    setIsLoading(true)
    try {
      const [achievementsRes, levelRes] = await Promise.all([
        fetch('/api/gamification/achievements'),
        fetch('/api/gamification/level'),
      ])

      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        setAchievements(data.achievements)
        setUnlockedCount(data.unlockedCount)
        setTotalCount(data.totalCount)
      }

      if (levelRes.ok) {
        const data = await levelRes.json()
        setLevelInfo(data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  // Get icon emoji based on achievement icon string
  const getIconEmoji = (icon: string): string => {
    const iconMap: Record<string, string> = {
      footprints: '\u{1F463}', // Footprints
      flame: '\u{1F525}', // Fire
      shield: '\u{1F6E1}', // Shield
      camera: '\u{1F4F7}', // Camera
      dog: '\u{1F436}', // Dog
      pill: '\u{1F48A}', // Pill
      smile: '\u{1F601}', // Grinning face
      clock: '\u{23F0}', // Clock
      dumbbell: '\u{1F4AA}', // Flexed biceps
      trophy: '\u{1F3C6}', // Trophy
      calendar: '\u{1F4C5}', // Calendar
      sun: '\u{2600}', // Sun
      moon: '\u{1F319}', // Moon
      map: '\u{1F5FA}', // Map
      star: '\u{2B50}', // Star
      'trending-down': '\u{1F4C9}', // Chart down
      'arrow-u-left-top': '\u{21A9}', // Return arrow
      'biceps-flexed': '\u{1F4AA}', // Flexed biceps
    }
    return iconMap[icon] || '\u{1F3C6}' // Default to trophy
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              &larr; Back
            </a>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
              <p className="text-lg text-muted-foreground">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
          </div>
        </header>

        {/* Level Display */}
        {levelInfo && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Level {levelInfo.currentLevel}</p>
                <p className="text-sm text-muted-foreground">{levelInfo.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {levelInfo.currentXP} XP total
                </p>
                <p className="text-sm text-muted-foreground">
                  {levelInfo.xpToNextLevel} XP to next level
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`rounded-md px-4 py-2 font-medium transition-colors ${
              filter === 'unlocked'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`rounded-md px-4 py-2 font-medium transition-colors ${
              filter === 'locked'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Achievements Grid */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading achievements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative rounded-lg border p-4 shadow-sm transition-all ${
                  achievement.unlocked
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-muted bg-card opacity-60'
                }`}
              >
                {/* Achievement Icon */}
                <div
                  className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                    achievement.unlocked
                      ? 'bg-primary/20'
                      : 'bg-muted grayscale'
                  }`}
                >
                  {achievement.name === '???' ? '\u{2753}' : getIconEmoji(achievement.icon)}
                </div>

                {/* Achievement Info */}
                <h3 className={`font-semibold ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>

                {/* XP Reward */}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className={achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}>
                    +{achievement.xpReward} XP
                  </span>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                {/* Unlock Badge */}
                {achievement.unlocked && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    &check;
                  </div>
                )}

                {/* Hidden Badge */}
                {achievement.isHidden && !achievement.unlocked && (
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs">
                    ?
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAchievements.length === 0 && (
          <div className="flex h-48 items-center justify-center rounded-lg border bg-card">
            <p className="text-muted-foreground">
              {filter === 'unlocked'
                ? 'No achievements unlocked yet. Keep tracking!'
                : 'No locked achievements remaining. Congratulations!'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
