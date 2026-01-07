import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get pushup yearly goal
export async function GET() {
  try {
    const currentYear = new Date().getFullYear()

    // Try to find existing goal for current year
    let goal = await prisma.pushupGoal.findFirst({
      where: { year: currentYear },
    })

    // If no goal exists, create default one (36,500)
    if (!goal) {
      goal = await prisma.pushupGoal.create({
        data: {
          year: currentYear,
          yearlyTarget: 36500, // Default: 100 pushups per day for 365 days
        },
      })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error fetching pushup goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pushup goal' },
      { status: 500 }
    )
  }
}

// Update pushup yearly goal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { yearlyTarget, year } = body

    if (!yearlyTarget || typeof yearlyTarget !== 'number' || yearlyTarget <= 0) {
      return NextResponse.json(
        { error: 'Yearly target must be a positive number' },
        { status: 400 }
      )
    }

    const targetYear = year || new Date().getFullYear()

    // Find or create goal
    let goal = await prisma.pushupGoal.findFirst({
      where: { year: targetYear },
    })

    if (goal) {
      // Update existing goal
      goal = await prisma.pushupGoal.update({
        where: { id: goal.id },
        data: { yearlyTarget },
      })
    } else {
      // Create new goal
      goal = await prisma.pushupGoal.create({
        data: {
          year: targetYear,
          yearlyTarget,
        },
      })
    }

    return NextResponse.json({
      goal,
      message: `Yearly goal updated to ${yearlyTarget.toLocaleString()} pushups!`,
    })
  } catch (error) {
    console.error('Error updating pushup goal:', error)
    return NextResponse.json(
      { error: 'Failed to update pushup goal' },
      { status: 500 }
    )
  }
}
