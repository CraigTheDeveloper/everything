import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Helper function to create a date from YYYY-MM-DD string
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get progress photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const type = searchParams.get('type') // front, back, side

    if (dateParam) {
      const targetDate = parseLocalDate(dateParam)
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

      const whereClause: Record<string, unknown> = {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      }

      if (type) {
        whereClause.type = type
      }

      const photos = await prisma.progressPhoto.findMany({
        where: whereClause,
        orderBy: { type: 'asc' },
      })

      return NextResponse.json({ photos })
    }

    // Get recent photos (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const photos = await prisma.progressPhoto.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching progress photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress photos' },
      { status: 500 }
    )
  }
}

// Upload a progress photo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['front', 'back', 'side'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid photo type. Must be front, back, or side' },
        { status: 400 }
      )
    }

    // Get today's date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos', dateStr)
    await mkdir(uploadDir, { recursive: true })

    // Generate filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${type}_${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, filename)
    const relativePath = `/uploads/photos/${dateStr}/${filename}`

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Check if photo for this type already exists today
    const existingPhoto = await prisma.progressPhoto.findFirst({
      where: {
        date: {
          gte: today,
          lt: endOfDay,
        },
        type,
      },
    })

    let photo
    if (existingPhoto) {
      // Update existing photo
      photo = await prisma.progressPhoto.update({
        where: { id: existingPhoto.id },
        data: { filePath: relativePath },
      })
    } else {
      // Create new photo record
      photo = await prisma.progressPhoto.create({
        data: {
          date: today,
          type,
          filePath: relativePath,
        },
      })
    }

    return NextResponse.json({
      photo,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} photo uploaded successfully!`,
    })
  } catch (error) {
    console.error('Error uploading progress photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
