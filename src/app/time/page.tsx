'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface TimeCategory {
  id: number
  name: string
  isWasteful: boolean
  activities: TimeActivity[]
}

interface TimeActivity {
  id: number
  name: string
  categoryId: number
  category?: TimeCategory
}

interface TimeEntry {
  id: number
  date: string
  activityId: number
  activity: TimeActivity
  startTime: string | null
  endTime: string | null
  durationMinutes: number
  isManual: boolean
}

export default function TimePage() {
  const [categories, setCategories] = useState<TimeCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TimeCategory | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<TimeActivity | null>(null)
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [manualMinutes, setManualMinutes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [newActivityName, setNewActivityName] = useState('')
  const [newActivityCategory, setNewActivityCategory] = useState<number | null>(null)
  const [maxWasteMinutes, setMaxWasteMinutes] = useState(60)
  const [maxWasteInput, setMaxWasteInput] = useState('')
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/time/categories')
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json()
        setCategories(data.categories || [])
      }

      // Fetch active timer
      const activeResponse = await fetch('/api/time/entries?active=true')
      if (activeResponse.ok) {
        const data = await activeResponse.json()
        setActiveEntry(data.entry || null)
      }

      // Fetch today's entries
      const entriesResponse = await fetch(`/api/time/entries?date=${todayString}`)
      if (entriesResponse.ok) {
        const data = await entriesResponse.json()
        setTodayEntries(data.entries || [])
      }

      // Fetch time goal
      const goalResponse = await fetch('/api/time/goals')
      if (goalResponse.ok) {
        const data = await goalResponse.json()
        if (data.goal) {
          setMaxWasteMinutes(data.goal.maxWasteMinutes)
          setMaxWasteInput(data.goal.maxWasteMinutes.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching time data:', error)
    }
  }, [todayString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Update elapsed time for active timer
  useEffect(() => {
    if (activeEntry?.startTime) {
      const updateElapsed = () => {
        const startTime = new Date(activeEntry.startTime!).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedTime(elapsed)
      }

      updateElapsed()
      const interval = setInterval(updateElapsed, 1000)
      return () => clearInterval(interval)
    } else {
      setElapsedTime(0)
    }
  }, [activeEntry])

  // Start timer
  const handleStartTimer = async () => {
    if (!selectedActivity) {
      toast({
        title: 'Error',
        description: 'Please select an activity first',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/time/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivity.id,
          action: 'start',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveEntry(data.entry)
        toast({
          title: 'Timer Started!',
          description: `Tracking time for ${selectedActivity.name}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to start timer',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error starting timer:', error)
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stop timer
  const handleStopTimer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/time/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveEntry(null)
        toast({
          title: 'Timer Stopped!',
          description: data.message,
        })
        fetchData() // Refresh entries
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to stop timer',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manual entry
  const handleManualEntry = async () => {
    if (!selectedActivity || !manualMinutes) {
      toast({
        title: 'Error',
        description: 'Please select an activity and enter duration',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/time/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivity.id,
          durationMinutes: parseInt(manualMinutes),
          action: 'manual',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Time Logged!',
          description: data.message,
        })
        setManualMinutes('')
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to log time',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error logging manual time:', error)
      toast({
        title: 'Error',
        description: 'Failed to log time',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create new activity
  const handleCreateActivity = async () => {
    if (!newActivityName || !newActivityCategory) {
      toast({
        title: 'Error',
        description: 'Please enter activity name and select a category',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/time/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newActivityName,
          categoryId: newActivityCategory,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Activity Created!',
          description: data.message,
        })
        setNewActivityName('')
        setNewActivityCategory(null)
        setShowAddActivity(false)
        fetchData() // Refresh categories with new activity
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create activity',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      toast({
        title: 'Error',
        description: 'Failed to create activity',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save time goal
  const handleSaveGoal = async () => {
    const minutes = parseInt(maxWasteInput)
    if (isNaN(minutes) || minutes < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number of minutes',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/time/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxWasteMinutes: minutes }),
      })

      if (response.ok) {
        const data = await response.json()
        setMaxWasteMinutes(data.goal.maxWasteMinutes)
        toast({
          title: 'Goal Saved!',
          description: data.message,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save goal',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to save goal',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate total time for today
  const totalMinutesToday = todayEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0)
  const wastefulMinutesToday = todayEntries
    .filter((entry) => entry.activity?.category?.isWasteful)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0)

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Active Timer Display */}
        {activeEntry && (
          <div className="mb-8 rounded-lg border-2 border-time bg-time/10 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-muted-foreground">Timer Running</span>
                </div>
                <p className="mt-1 text-lg font-semibold">{activeEntry.activity?.name}</p>
                <p className="text-sm text-muted-foreground">{activeEntry.activity?.category?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-4xl font-bold text-time">{formatElapsedTime(elapsedTime)}</p>
                <button
                  onClick={handleStopTimer}
                  disabled={isLoading}
                  className="mt-2 rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Stop Timer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer Controls */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Start Timer</h2>
          <div className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                value={selectedCategory?.id || ''}
                onChange={(e) => {
                  const cat = categories.find((c) => c.id === parseInt(e.target.value))
                  setSelectedCategory(cat || null)
                  setSelectedActivity(null)
                }}
                className="w-full rounded-md border bg-input px-3 py-2"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.isWasteful && '(Wasteful)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Selection */}
            {selectedCategory && (
              <div>
                <label className="mb-2 block text-sm font-medium">Activity</label>
                <select
                  value={selectedActivity?.id || ''}
                  onChange={(e) => {
                    const act = selectedCategory.activities.find((a) => a.id === parseInt(e.target.value))
                    setSelectedActivity(act || null)
                  }}
                  className="w-full rounded-md border bg-input px-3 py-2"
                >
                  <option value="">Select an activity...</option>
                  {selectedCategory.activities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Button */}
            <div className="flex gap-2">
              <button
                onClick={handleStartTimer}
                disabled={isLoading || !selectedActivity || !!activeEntry}
                className="rounded-md bg-time px-6 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Start Timer
              </button>
            </div>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Manual Entry</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Duration (minutes)</label>
              <input
                type="number"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                placeholder="e.g., 30"
                className="w-full rounded-md border bg-input px-3 py-2"
                min="1"
              />
            </div>
            <button
              onClick={handleManualEntry}
              disabled={isLoading || !selectedActivity || !manualMinutes}
              className="rounded-md bg-muted px-4 py-2 font-medium hover:bg-muted/80 disabled:opacity-50"
            >
              Log Time
            </button>
          </div>
        </div>

        {/* Add Activity Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Manage Activities</h2>
            <button
              onClick={() => setShowAddActivity(!showAddActivity)}
              className="rounded-md bg-time px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {showAddActivity ? 'Cancel' : 'Add Activity'}
            </button>
          </div>

          {showAddActivity && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Activity Name</label>
                <input
                  type="text"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="e.g., Team Standup"
                  className="w-full rounded-md border bg-input px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select
                  value={newActivityCategory || ''}
                  onChange={(e) => setNewActivityCategory(parseInt(e.target.value) || null)}
                  className="w-full rounded-md border bg-input px-3 py-2"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateActivity}
                disabled={isLoading || !newActivityName || !newActivityCategory}
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Save Activity
              </button>
            </div>
          )}
        </div>

        {/* Time Wasting Goal */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Daily Time Wasting Goal</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Maximum Wasteful Time (minutes)</label>
              <input
                type="number"
                value={maxWasteInput}
                onChange={(e) => setMaxWasteInput(e.target.value)}
                placeholder="e.g., 60"
                className="w-full rounded-md border bg-input px-3 py-2"
                min="0"
              />
            </div>
            <button
              onClick={handleSaveGoal}
              disabled={isLoading}
              className="rounded-md bg-time px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Save Goal
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Current goal: {maxWasteMinutes} minutes per day
          </p>
        </div>

        {/* Today's Summary */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-time/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold text-time">
                {Math.floor(totalMinutesToday / 60)}h {totalMinutesToday % 60}m
              </p>
            </div>
            <div className={`rounded-lg p-4 text-center ${wastefulMinutesToday > maxWasteMinutes ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
              <p className="text-sm text-muted-foreground">Wasteful Time</p>
              <p className={`text-2xl font-bold ${wastefulMinutesToday > maxWasteMinutes ? 'text-red-600' : 'text-red-500'}`}>
                {Math.floor(wastefulMinutesToday / 60)}h {wastefulMinutesToday % 60}m
              </p>
              <p className="text-xs text-muted-foreground">
                / {maxWasteMinutes}m goal
              </p>
            </div>
          </div>
        </div>

        {/* Today's Entries */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Time Log</h2>
          {todayEntries.length > 0 ? (
            <div className="space-y-2">
              {todayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{entry.activity?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.activity?.category?.name}
                      {entry.isManual && ' (manual)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Math.floor(entry.durationMinutes / 60)}h {entry.durationMinutes % 60}m
                    </p>
                    {entry.startTime && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.startTime), 'HH:mm')}
                        {entry.endTime && ` - ${format(new Date(entry.endTime), 'HH:mm')}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No time logged today. Start tracking!</p>
          )}
        </div>
      </div>
    </main>
  )
}
