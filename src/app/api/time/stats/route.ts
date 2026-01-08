import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get time tracking stats for a date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Default to today if no date provided
    const now = new Date()
    const targetDate = dateParam ? parseLocalDate(dateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

    // Get the time goal
    let goal = await prisma.timeGoal.findFirst()
    if (!goal) {
      goal = await prisma.timeGoal.create({
        data: { maxWasteMinutes: 60 },
      })
    }

    // Get all entries for the day with their activities and categories
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
    })

    // Calculate total time and wasteful time
    let totalMinutes = 0
    let wastefulMinutes = 0
    let productiveMinutes = 0

    for (const entry of entries) {
      totalMinutes += entry.durationMinutes
      if (entry.activity.category.isWasteful) {
        wastefulMinutes += entry.durationMinutes
      } else {
        productiveMinutes += entry.durationMinutes
      }
    }

    // Determine if under goal
    const isUnderGoal = wastefulMinutes <= goal.maxWasteMinutes
    const pointsEarned = isUnderGoal ? 1 : 0
    const minutesRemaining = Math.max(0, goal.maxWasteMinutes - wastefulMinutes)
    const minutesOver = Math.max(0, wastefulMinutes - goal.maxWasteMinutes)

    // Get breakdown by category
    const categoryBreakdown: Record<string, { name: string; minutes: number; isWasteful: boolean }> = {}
    for (const entry of entries) {
      const catId = entry.activity.category.id.toString()
      if (!categoryBreakdown[catId]) {
        categoryBreakdown[catId] = {
          name: entry.activity.category.name,
          minutes: 0,
          isWasteful: entry.activity.category.isWasteful,
        }
      }
      categoryBreakdown[catId].minutes += entry.durationMinutes
    }

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      goal: {
        maxWasteMinutes: goal.maxWasteMinutes,
      },
      summary: {
        totalMinutes,
        productiveMinutes,
        wastefulMinutes,
        isUnderGoal,
        minutesRemaining,
        minutesOver,
        pointsEarned,
      },
      categoryBreakdown: Object.values(categoryBreakdown),
      entriesCount: entries.length,
    })
  } catch (error) {
    console.error('Error fetching time stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time statistics' },
      { status: 500 }
    )
  }
}
