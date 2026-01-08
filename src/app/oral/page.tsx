'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

interface CalendarDay {
  date: string
  dayOfMonth: number
  completedCount: number
  color: 'green' | 'yellow' | 'orange' | 'red'
  morningBrush: boolean
  eveningBrush: boolean
  eveningFloss: boolean
}

interface CalendarStats {
  daysWithData: number
  perfectDays: number
  totalCompleted: number
  possibleTotal: number
  compliance: number
}

interface CalendarData {
  year: number
  month: number
  daysInMonth: number
  firstDayOfWeek: number
  calendarDays: CalendarDay[]
  stats: CalendarStats
}

interface OralHygieneLog {
  morningBrush: boolean
  eveningBrush: boolean
  eveningFloss: boolean
}

export default function OralHygienePage() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  const [todayLog, setTodayLog] = useState<OralHygieneLog>({
    morningBrush: false,
    eveningBrush: false,
    eveningFloss: false,
  })
  const { toast } = useToast()

  const today = new Date()
  const todayString = format(today, 'yyyy-MM-dd')

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/oral/calendar?year=${currentYear}&month=${currentMonth}`)
      if (response.ok) {
        const data = await response.json()
        setCalendarData(data)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentYear, currentMonth])

  // Fetch today's log
  const fetchTodayLog = useCallback(async () => {
    try {
      const response = await fetch(`/api/oral/logs?date=${todayString}`)
      if (response.ok) {
        const data = await response.json()
        if (data.log) {
          setTodayLog({
            morningBrush: data.log.morningBrush,
            eveningBrush: data.log.eveningBrush,
            eveningFloss: data.log.eveningFloss,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching today log:', error)
    }
  }, [todayString])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  useEffect(() => {
    fetchTodayLog()
  }, [fetchTodayLog])

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
        setTodayLog({
          morningBrush: data.log.morningBrush,
          eveningBrush: data.log.eveningBrush,
          eveningFloss: data.log.eveningFloss,
        })
        toast({
          title: 'Oral hygiene updated!',
          description: data.message,
        })
        // Refresh calendar data to show updated colors
        fetchCalendarData()
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

  // Navigate months
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDay(null)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth() + 1)
    setSelectedDay(null)
  }

  // Get color classes
  const getColorClass = (color: string): string => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-white'
      case 'yellow':
        return 'bg-yellow-400 text-black'
      case 'orange':
        return 'bg-orange-500 text-white'
      case 'red':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Build calendar grid with empty cells for first week
  const buildCalendarGrid = () => {
    if (!calendarData) return []

    const grid: (CalendarDay | null)[] = []

    // Add empty cells for days before first of month
    for (let i = 0; i < calendarData.firstDayOfWeek; i++) {
      grid.push(null)
    }

    // Add actual days
    for (const day of calendarData.calendarDays) {
      grid.push(day)
    }

    return grid
  }

  const calendarGrid = buildCalendarGrid()

  const todayCompletedCount = [todayLog.morningBrush, todayLog.eveningBrush, todayLog.eveningFloss].filter(Boolean).length

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </a>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Oral Hygiene</h1>
              <p className="text-lg text-muted-foreground">Track your daily dental care</p>
            </div>
          </div>
        </header>

        {/* Today's Checklist */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Checklist</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={todayLog.morningBrush}
                onChange={(e) => updateOralHygiene('morningBrush', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 text-oral focus:ring-oral"
              />
              <span className="text-lg">Morning Brush</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={todayLog.eveningBrush}
                onChange={(e) => updateOralHygiene('eveningBrush', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 text-oral focus:ring-oral"
              />
              <span className="text-lg">Evening Brush</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={todayLog.eveningFloss}
                onChange={(e) => updateOralHygiene('eveningFloss', e.target.checked)}
                className="h-6 w-6 rounded border-gray-300 text-oral focus:ring-oral"
              />
              <span className="text-lg">Evening Floss</span>
            </label>
          </div>
          <div className="mt-4">
            <div className={`inline-block rounded-full px-4 py-2 font-semibold ${getColorClass(
              todayCompletedCount === 3 ? 'green' :
              todayCompletedCount === 2 ? 'yellow' :
              todayCompletedCount === 1 ? 'orange' : 'red'
            )}`}>
              {todayCompletedCount}/3 Complete
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="rounded-md border px-3 py-1 hover:bg-muted"
              >
                ←
              </button>
              <span className="min-w-[160px] text-center font-medium">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
              <button
                onClick={goToNextMonth}
                className="rounded-md border px-3 py-1 hover:bg-muted"
              >
                →
              </button>
              <button
                onClick={goToToday}
                className="ml-2 rounded-md border px-3 py-1 text-sm hover:bg-muted"
              >
                Today
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {dayNames.map((name) => (
                  <div key={name} className="text-center text-sm font-medium text-muted-foreground">
                    {name}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((day, index) => (
                  <div
                    key={day ? day.date : `empty-${index}`}
                    className={`aspect-square p-1 ${day ? 'cursor-pointer' : ''}`}
                    onClick={() => day && setSelectedDay(day)}
                  >
                    {day && (
                      <div
                        className={`flex h-full w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          getColorClass(day.color)
                        } ${
                          day.date === todayString ? 'ring-2 ring-primary ring-offset-2' : ''
                        } ${
                          selectedDay?.date === day.date ? 'scale-110 shadow-lg' : 'hover:scale-105'
                        }`}
                        data-color={day.color}
                        data-completed={day.completedCount}
                      >
                        {day.dayOfMonth}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Color legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500" />
                  <span>3/3 Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-400" />
                  <span>2/3 Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-orange-500" />
                  <span>1/3 Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-500" />
                  <span>0/3 Complete</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              {format(new Date(selectedDay.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className={`rounded-lg p-4 text-center ${selectedDay.morningBrush ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                <div className="text-2xl mb-1">{selectedDay.morningBrush ? '✓' : '✗'}</div>
                <div className="font-medium">Morning Brush</div>
              </div>
              <div className={`rounded-lg p-4 text-center ${selectedDay.eveningBrush ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                <div className="text-2xl mb-1">{selectedDay.eveningBrush ? '✓' : '✗'}</div>
                <div className="font-medium">Evening Brush</div>
              </div>
              <div className={`rounded-lg p-4 text-center ${selectedDay.eveningFloss ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                <div className="text-2xl mb-1">{selectedDay.eveningFloss ? '✓' : '✗'}</div>
                <div className="font-medium">Evening Floss</div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Statistics */}
        {calendarData && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Monthly Statistics</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">{calendarData.stats.perfectDays}</p>
                <p className="text-sm text-muted-foreground">Perfect Days</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">{calendarData.stats.daysWithData}</p>
                <p className="text-sm text-muted-foreground">Days Tracked</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">{calendarData.stats.totalCompleted}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-primary">{calendarData.stats.compliance}%</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
