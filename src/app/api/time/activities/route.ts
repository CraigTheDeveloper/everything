import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all activities (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const activities = await prisma.timeActivity.findMany({
      where: categoryId ? { categoryId: parseInt(categoryId) } : undefined,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching time activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time activities' },
      { status: 500 }
    )
  }
}

// Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, categoryId } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Activity name and category are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.timeActivity.create({
      data: {
        name,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      activity,
      message: 'Activity created successfully!',
    })
  } catch (error) {
    console.error('Error creating time activity:', error)
    return NextResponse.json(
      { error: 'Failed to create time activity' },
      { status: 500 }
    )
  }
}
