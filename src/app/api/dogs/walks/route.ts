import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string (treating it as local date)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get dog walks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const dogId = searchParams.get('dogId')

    const whereClause: {
      date?: { gte: Date; lt: Date }
      dogs?: { some: { dogId: number } }
    } = {}

    // Filter by date if provided
    if (dateParam) {
      const targetDate = parseLocalDate(dateParam)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

      whereClause.date = {
        gte: startOfDay,
        lt: endOfDay,
      }
    }

    // Filter by dog if provided
    if (dogId) {
      whereClause.dogs = {
        some: { dogId: parseInt(dogId) },
      }
    }

    const walks = await prisma.dogWalk.findMany({
      where: whereClause,
      include: {
        dogs: {
          include: {
            dog: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json({ walks })
  } catch (error) {
    console.error('Error fetching dog walks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dog walks' },
      { status: 500 }
    )
  }
}

// Create a new dog walk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dogIds, durationMinutes, distanceKm, steps, avgHeartRate, paceMinPerKm, comments } = body

    if (!dogIds || !Array.isArray(dogIds) || dogIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one dog must be selected' },
        { status: 400 }
      )
    }

    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive number' },
        { status: 400 }
      )
    }

    // Verify all dogs exist
    const dogs = await prisma.dog.findMany({
      where: {
        id: { in: dogIds },
        active: true,
      },
    })

    if (dogs.length !== dogIds.length) {
      return NextResponse.json(
        { error: 'One or more dogs not found or inactive' },
        { status: 400 }
      )
    }

    // Get today's date (start of day in local time)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Create the walk with dog associations
    const walk = await prisma.dogWalk.create({
      data: {
        date: today,
        durationMinutes,
        distanceKm: distanceKm || null,
        steps: steps || null,
        avgHeartRate: avgHeartRate || null,
        paceMinPerKm: paceMinPerKm || null,
        comments: comments?.trim() || null,
        dogs: {
          create: dogIds.map((dogId: number) => ({ dogId })),
        },
      },
      include: {
        dogs: {
          include: {
            dog: true,
          },
        },
      },
    })

    return NextResponse.json({
      walk,
      message: `Walk logged for ${dogs.map((d) => d.name).join(', ')}!`,
    })
  } catch (error) {
    console.error('Error creating dog walk:', error)
    return NextResponse.json(
      { error: 'Failed to log dog walk' },
      { status: 500 }
    )
  }
}
