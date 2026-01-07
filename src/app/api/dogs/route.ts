import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

// Get all dogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const dogs = await prisma.dog.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ dogs })
  } catch (error) {
    console.error('Error fetching dogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dogs' },
      { status: 500 }
    )
  }
}

// Create a new dog
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const photo = formData.get('photo') as File | null

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Dog name is required' },
        { status: 400 }
      )
    }

    let photoPath: string | null = null

    // Handle photo upload if provided
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const ext = photo.name.split('.').pop() || 'jpg'
      const filename = `dog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`
      const uploadDir = path.join(process.cwd(), 'uploads', 'dogs')
      const filePath = path.join(uploadDir, filename)

      // Ensure upload directory exists
      const fs = await import('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      await writeFile(filePath, buffer)
      photoPath = `/uploads/dogs/${filename}`
    }

    const dog = await prisma.dog.create({
      data: {
        name: name.trim(),
        photoPath,
        active: true,
      },
    })

    return NextResponse.json({
      dog,
      message: 'Dog added successfully!',
    })
  } catch (error) {
    console.error('Error creating dog:', error)
    return NextResponse.json(
      { error: 'Failed to create dog' },
      { status: 500 }
    )
  }
}

// Update a dog
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = parseInt(formData.get('id') as string)
    const name = formData.get('name') as string
    const photo = formData.get('photo') as File | null
    const active = formData.get('active')

    if (!id) {
      return NextResponse.json(
        { error: 'Dog ID is required' },
        { status: 400 }
      )
    }

    const existingDog = await prisma.dog.findUnique({
      where: { id },
    })

    if (!existingDog) {
      return NextResponse.json(
        { error: 'Dog not found' },
        { status: 404 }
      )
    }

    let photoPath = existingDog.photoPath

    // Handle photo upload if provided
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = photo.name.split('.').pop() || 'jpg'
      const filename = `dog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`
      const uploadDir = path.join(process.cwd(), 'uploads', 'dogs')
      const filePath = path.join(uploadDir, filename)

      const fs = await import('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      await writeFile(filePath, buffer)
      photoPath = `/uploads/dogs/${filename}`
    }

    const dog = await prisma.dog.update({
      where: { id },
      data: {
        name: name?.trim() ?? existingDog.name,
        photoPath,
        active: active !== null ? active === 'true' : existingDog.active,
      },
    })

    return NextResponse.json({
      dog,
      message: 'Dog updated successfully!',
    })
  } catch (error) {
    console.error('Error updating dog:', error)
    return NextResponse.json(
      { error: 'Failed to update dog' },
      { status: 500 }
    )
  }
}

// Delete a dog (soft delete by marking inactive)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Dog ID is required' },
        { status: 400 }
      )
    }

    const dogId = parseInt(id)

    const existingDog = await prisma.dog.findUnique({
      where: { id: dogId },
    })

    if (!existingDog) {
      return NextResponse.json(
        { error: 'Dog not found' },
        { status: 404 }
      )
    }

    // Soft delete - mark as inactive
    await prisma.dog.update({
      where: { id: dogId },
      data: { active: false },
    })

    return NextResponse.json({
      message: 'Dog removed successfully!',
    })
  } catch (error) {
    console.error('Error deleting dog:', error)
    return NextResponse.json(
      { error: 'Failed to delete dog' },
      { status: 500 }
    )
  }
}
