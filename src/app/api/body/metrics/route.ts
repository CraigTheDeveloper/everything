import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string (treating it as local date)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get body metrics for a date or date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (dateParam) {
      // Get metrics for a specific date
      const targetDate = parseLocalDate(dateParam)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

      const metric = await prisma.bodyMetric.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      })

      return NextResponse.json({ metric })
    }

    if (startDate && endDate) {
      // Get metrics for a date range
      const start = parseLocalDate(startDate)
      const end = parseLocalDate(endDate)
      end.setDate(end.getDate() + 1) // Include end date

      const metrics = await prisma.bodyMetric.findMany({
        where: {
          date: {
            gte: start,
            lt: end,
          },
        },
        orderBy: { date: 'asc' },
      })

      return NextResponse.json({ metrics })
    }

    // Get recent metrics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const metrics = await prisma.bodyMetric.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error fetching body metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch body metrics' },
      { status: 500 }
    )
  }
}

// Create or update body metrics for today
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weight, bodyFatPercent, musclePercent } = body

    // Validate at least one metric is provided
    if (weight === undefined && bodyFatPercent === undefined && musclePercent === undefined) {
      return NextResponse.json(
        { error: 'At least one metric must be provided' },
        { status: 400 }
      )
    }

    // Get today's date (start of day in local time)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // Find existing metric for today
    const existingMetric = await prisma.bodyMetric.findFirst({
      where: {
        date: {
          gte: today,
          lt: endOfDay,
        },
      },
    })

    let metric
    if (existingMetric) {
      // Update existing metric
      metric = await prisma.bodyMetric.update({
        where: { id: existingMetric.id },
        data: {
          weight: weight !== undefined ? weight : existingMetric.weight,
          bodyFatPercent: bodyFatPercent !== undefined ? bodyFatPercent : existingMetric.bodyFatPercent,
          musclePercent: musclePercent !== undefined ? musclePercent : existingMetric.musclePercent,
        },
      })
    } else {
      // Create new metric
      metric = await prisma.bodyMetric.create({
        data: {
          date: today,
          weight: weight ?? null,
          bodyFatPercent: bodyFatPercent ?? null,
          musclePercent: musclePercent ?? null,
        },
      })
    }

    // Calculate points earned (1 point if all 3 metrics are logged)
    const allMetricsLogged = metric.weight !== null && metric.bodyFatPercent !== null && metric.musclePercent !== null
    const pointsEarned = allMetricsLogged ? 1 : 0

    // Update points if needed
    if (pointsEarned !== metric.pointsEarned) {
      metric = await prisma.bodyMetric.update({
        where: { id: metric.id },
        data: { pointsEarned },
      })
    }

    return NextResponse.json({
      metric,
      message: existingMetric ? 'Body metrics updated!' : 'Body metrics saved!',
      pointsEarned,
    })
  } catch (error) {
    console.error('Error saving body metrics:', error)
    return NextResponse.json(
      { error: 'Failed to save body metrics' },
      { status: 500 }
    )
  }
}
