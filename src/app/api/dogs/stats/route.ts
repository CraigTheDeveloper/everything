import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get dog walk statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dogId = searchParams.get('dogId')

    // Get all walks (optionally filtered by dog)
    const whereClause = dogId
      ? {
          dogs: {
            some: { dogId: parseInt(dogId) },
          },
        }
      : {}

    const walks = await prisma.dogWalk.findMany({
      where: whereClause,
      include: {
        dogs: {
          include: {
            dog: true,
          },
        },
      },
    })

    // Calculate totals
    const totalWalks = walks.length
    const totalDuration = walks.reduce((sum, w) => sum + w.durationMinutes, 0)
    const totalDistance = walks.reduce((sum, w) => sum + (w.distanceKm || 0), 0)
    const totalSteps = walks.reduce((sum, w) => sum + (w.steps || 0), 0)

    // Calculate averages
    const avgDuration = totalWalks > 0 ? Math.round(totalDuration / totalWalks) : 0
    const avgDistance = totalWalks > 0 ? Math.round((totalDistance / totalWalks) * 10) / 10 : 0
    const avgHeartRate =
      totalWalks > 0
        ? Math.round(
            walks.filter((w) => w.avgHeartRate).reduce((sum, w) => sum + (w.avgHeartRate || 0), 0) /
              walks.filter((w) => w.avgHeartRate).length
          ) || 0
        : 0

    // Get walks per dog
    const dogs = await prisma.dog.findMany({
      where: { active: true },
    })

    const walksPerDog = await Promise.all(
      dogs.map(async (dog) => {
        const dogWalks = await prisma.dogWalkDog.count({
          where: { dogId: dog.id },
        })
        return {
          id: dog.id,
          name: dog.name,
          photoPath: dog.photoPath,
          walkCount: dogWalks,
        }
      })
    )

    return NextResponse.json({
      summary: {
        totalWalks,
        totalDuration,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalSteps,
        avgDuration,
        avgDistance,
        avgHeartRate,
      },
      walksPerDog,
    })
  } catch (error) {
    console.error('Error fetching dog walk stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dog walk statistics' },
      { status: 500 }
    )
  }
}
