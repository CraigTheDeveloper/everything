import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all medications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const medications = await prisma.medication.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ medications })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    )
  }
}

// Create a new medication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, dosage, isChronic, frequency } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Medication name is required' },
        { status: 400 }
      )
    }

    // Validate frequency if provided
    const validFrequencies = ['ONCE', 'TWICE', 'THRICE']
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Frequency must be ONCE, TWICE, or THRICE' },
        { status: 400 }
      )
    }

    const medication = await prisma.medication.create({
      data: {
        name: name.trim(),
        dosage: dosage?.trim() || null,
        isChronic: isChronic ?? true,
        frequency: frequency || 'ONCE',
        active: true,
      },
    })

    return NextResponse.json({
      medication,
      message: 'Medication created successfully!',
    })
  } catch (error) {
    console.error('Error creating medication:', error)
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    )
  }
}

// Update a medication
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, dosage, isChronic, frequency, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      )
    }

    const existingMedication = await prisma.medication.findUnique({
      where: { id },
    })

    if (!existingMedication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    // Validate frequency if provided
    const validFrequencies = ['ONCE', 'TWICE', 'THRICE']
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: 'Frequency must be ONCE, TWICE, or THRICE' },
        { status: 400 }
      )
    }

    const medication = await prisma.medication.update({
      where: { id },
      data: {
        name: name?.trim() ?? existingMedication.name,
        dosage: dosage !== undefined ? (dosage?.trim() || null) : existingMedication.dosage,
        isChronic: isChronic ?? existingMedication.isChronic,
        frequency: frequency ?? existingMedication.frequency,
        active: active ?? existingMedication.active,
      },
    })

    return NextResponse.json({
      medication,
      message: 'Medication updated successfully!',
    })
  } catch (error) {
    console.error('Error updating medication:', error)
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    )
  }
}

// Delete a medication
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      )
    }

    const medicationId = parseInt(id)

    // Check if medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medicationId },
    })

    if (!existingMedication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      )
    }

    await prisma.medication.delete({
      where: { id: medicationId },
    })

    return NextResponse.json({
      message: 'Medication deleted successfully!',
    })
  } catch (error) {
    console.error('Error deleting medication:', error)
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    )
  }
}
