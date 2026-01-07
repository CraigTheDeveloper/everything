import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get time entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const activeOnly = searchParams.get('active') === 'true'

    if (activeOnly) {
      // Get active (running) timer
      const activeEntry = await prisma.timeEntry.findFirst({
        where: {
          startTime: { not: null },
          endTime: null,
        },
        include: {
          activity: {
            include: {
              category: true,
            },
          },
        },
      })
      return NextResponse.json({ entry: activeEntry })
    }

    if (dateParam) {
      const targetDate = parseLocalDate(dateParam)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

      const entries = await prisma.timeEntry.findMany({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        include: {
          activity: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ entries })
    }

    // Get recent entries (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const entries = await prisma.timeEntry.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        activity: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}

// Create or update a time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityId, action, durationMinutes } = body

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (action === 'start') {
      // Start a new timer
      if (!activityId) {
        return NextResponse.json(
          { error: 'Activity ID is required to start timer' },
          { status: 400 }
        )
      }

      // Check if there's already an active timer
      const activeEntry = await prisma.timeEntry.findFirst({
        where: {
          startTime: { not: null },
          endTime: null,
        },
      })

      if (activeEntry) {
        return NextResponse.json(
          { error: 'A timer is already running. Please stop it first.' },
          { status: 400 }
        )
      }

      const entry = await prisma.timeEntry.create({
        data: {
          date: today,
          activityId,
          startTime: now,
          durationMinutes: 0,
          isManual: false,
        },
        include: {
          activity: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json({
        entry,
        message: 'Timer started!',
      })
    }

    if (action === 'stop') {
      // Stop the active timer
      const activeEntry = await prisma.timeEntry.findFirst({
        where: {
          startTime: { not: null },
          endTime: null,
        },
      })

      if (!activeEntry) {
        return NextResponse.json(
          { error: 'No active timer to stop' },
          { status: 400 }
        )
      }

      const startTime = new Date(activeEntry.startTime!)
      const durationMs = now.getTime() - startTime.getTime()
      const durationMins = Math.round(durationMs / 60000)

      const entry = await prisma.timeEntry.update({
        where: { id: activeEntry.id },
        data: {
          endTime: now,
          durationMinutes: durationMins,
        },
        include: {
          activity: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json({
        entry,
        message: `Timer stopped! Logged ${durationMins} minutes.`,
      })
    }

    if (action === 'manual') {
      // Manual entry
      if (!activityId || !durationMinutes) {
        return NextResponse.json(
          { error: 'Activity ID and duration are required for manual entry' },
          { status: 400 }
        )
      }

      const entry = await prisma.timeEntry.create({
        data: {
          date: today,
          activityId,
          durationMinutes,
          isManual: true,
        },
        include: {
          activity: {
            include: {
              category: true,
            },
          },
        },
      })

      return NextResponse.json({
        entry,
        message: `Logged ${durationMinutes} minutes manually.`,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use start, stop, or manual.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing time entry:', error)
    return NextResponse.json(
      { error: 'Failed to manage time entry' },
      { status: 500 }
    )
  }
}
