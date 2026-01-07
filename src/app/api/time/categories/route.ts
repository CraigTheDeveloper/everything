import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all time categories with their activities
export async function GET() {
  try {
    const categories = await prisma.timeCategory.findMany({
      include: {
        activities: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching time categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time categories' },
      { status: 500 }
    )
  }
}

// Create a new time category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isWasteful } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const category = await prisma.timeCategory.create({
      data: {
        name,
        isWasteful: isWasteful || false,
      },
      include: {
        activities: true,
      },
    })

    return NextResponse.json({
      category,
      message: 'Category created successfully!',
    })
  } catch (error) {
    console.error('Error creating time category:', error)
    return NextResponse.json(
      { error: 'Failed to create time category' },
      { status: 500 }
    )
  }
}
