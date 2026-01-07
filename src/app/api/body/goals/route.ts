import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get body goals
export async function GET() {
  try {
    // Get or create the single body goal record
    let goal = await prisma.bodyGoal.findFirst()

    if (!goal) {
      goal = await prisma.bodyGoal.create({
        data: {
          weeklyLossRate: 0.5,
        },
      })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error fetching body goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch body goals' },
      { status: 500 }
    )
  }
}

// Update body goals
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetWeight, targetBodyFatPercent, weeklyLossRate } = body

    // Get existing goal or create one
    let goal = await prisma.bodyGoal.findFirst()

    if (goal) {
      // Update existing goal
      goal = await prisma.bodyGoal.update({
        where: { id: goal.id },
        data: {
          targetWeight: targetWeight !== undefined ? targetWeight : goal.targetWeight,
          targetBodyFatPercent: targetBodyFatPercent !== undefined ? targetBodyFatPercent : goal.targetBodyFatPercent,
          weeklyLossRate: weeklyLossRate !== undefined ? weeklyLossRate : goal.weeklyLossRate,
        },
      })
    } else {
      // Create new goal
      goal = await prisma.bodyGoal.create({
        data: {
          targetWeight: targetWeight ?? null,
          targetBodyFatPercent: targetBodyFatPercent ?? null,
          weeklyLossRate: weeklyLossRate ?? 0.5,
        },
      })
    }

    return NextResponse.json({
      goal,
      message: 'Body goals updated successfully!',
    })
  } catch (error) {
    console.error('Error updating body goals:', error)
    return NextResponse.json(
      { error: 'Failed to update body goals' },
      { status: 500 }
    )
  }
}
