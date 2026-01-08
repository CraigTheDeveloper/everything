import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string (treating it as local date)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to get color based on completion count
function getColorForCompletion(count: number): 'green' | 'yellow' | 'orange' | 'red' {
  switch (count) {
    case 3:
      return 'green'
    case 2:
      return 'yellow'
    case 1:
      return 'orange'
    default:
      return 'red'
  }
}

// Get oral hygiene calendar data for a month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    // Default to current month if not provided
    const now = new Date()
    const year = yearParam ? parseInt(yearParam) : now.getFullYear()
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1

    // Get first and last day of the month
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0) // Last day of month
    const endOfMonthPlusOne = new Date(year, month, 1)

    // Get all logs for this month
    const logs = await prisma.oralHygieneLog.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lt: endOfMonthPlusOne,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Build calendar data
    const daysInMonth = endOfMonth.getDate()
    const calendarDays: Array<{
      date: string
      dayOfMonth: number
      completedCount: number
      color: string
      morningBrush: boolean
      eveningBrush: boolean
      eveningFloss: boolean
    }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day)
      const dateStr = formatDate(currentDate)

      // Find log for this date
      const log = logs.find((l) => {
        const logDate = new Date(l.date)
        return (
          logDate.getFullYear() === year &&
          logDate.getMonth() === month - 1 &&
          logDate.getDate() === day
        )
      })

      const completedCount = log
        ? [log.morningBrush, log.eveningBrush, log.eveningFloss].filter(Boolean).length
        : 0

      calendarDays.push({
        date: dateStr,
        dayOfMonth: day,
        completedCount,
        color: getColorForCompletion(completedCount),
        morningBrush: log?.morningBrush ?? false,
        eveningBrush: log?.eveningBrush ?? false,
        eveningFloss: log?.eveningFloss ?? false,
      })
    }

    // Calculate monthly statistics
    const daysWithData = calendarDays.filter((d) => d.completedCount > 0).length
    const perfectDays = calendarDays.filter((d) => d.completedCount === 3).length
    const totalCompleted = calendarDays.reduce((sum, d) => sum + d.completedCount, 0)
    const todayStr = formatDate(now)
    const daysElapsed = now.getFullYear() === year && now.getMonth() === month - 1
      ? now.getDate()
      : daysInMonth
    const possibleTotal = daysElapsed * 3
    const compliance = possibleTotal > 0 ? Math.round((totalCompleted / possibleTotal) * 100) : 0

    return NextResponse.json({
      year,
      month,
      daysInMonth,
      firstDayOfWeek: startOfMonth.getDay(), // 0 = Sunday
      calendarDays,
      stats: {
        daysWithData,
        perfectDays,
        totalCompleted,
        possibleTotal,
        compliance,
      },
    })
  } catch (error) {
    console.error('Error fetching oral hygiene calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch oral hygiene calendar' },
      { status: 500 }
    )
  }
}
