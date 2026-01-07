import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get time goal
export async function GET() {
  try {
    // Get or create the single time goal record
    let goal = await prisma.timeGoal.findFirst()

    if (!goal) {
      goal = await prisma.timeGoal.create({
        data: {
          maxWasteMinutes: 60,
        },
      })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error fetching time goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time goal' },
      { status: 500 }
    )
  }
}

// Update time goal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { maxWasteMinutes } = body

    if (maxWasteMinutes === undefined || maxWasteMinutes < 0) {
      return NextResponse.json(
        { error: 'Valid maxWasteMinutes is required' },
        { status: 400 }
      )
    }

    // Get existing goal or create one
    let goal = await prisma.timeGoal.findFirst()

    if (goal) {
      goal = await prisma.timeGoal.update({
        where: { id: goal.id },
        data: { maxWasteMinutes },
      })
    } else {
      goal = await prisma.timeGoal.create({
        data: { maxWasteMinutes },
      })
    }

    return NextResponse.json({
      goal,
      message: 'Time goal updated successfully!',
    })
  } catch (error) {
    console.error('Error updating time goal:', error)
    return NextResponse.json(
      { error: 'Failed to update time goal' },
      { status: 500 }
    )
  }
}
