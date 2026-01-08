import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string (treating it as local date)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get medication status for quick check-off on home page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Default to today if no date provided
    const now = new Date()
    const targetDate = dateParam ? parseLocalDate(dateParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

    // Get all active medications
    const medications = await prisma.medication.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    })

    // Get today's logs
    const logs = await prisma.medicationLog.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    })

    // Build medication status with slots
    const medicationStatus = medications.map((med) => {
      // Determine expected slots based on frequency
      const expectedSlots: string[] = []
      if (med.frequency === 'ONCE') {
        expectedSlots.push('morning')
      } else if (med.frequency === 'TWICE') {
        expectedSlots.push('morning', 'evening')
      } else {
        expectedSlots.push('morning', 'afternoon', 'evening')
      }

      // Build slots with taken status
      const slots = expectedSlots.map((timeOfDay) => {
        const log = logs.find(
          (l) => l.medicationId === med.id && l.timeOfDay === timeOfDay
        )
        return {
          timeOfDay,
          taken: log?.taken ?? false,
        }
      })

      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        slots,
      }
    })

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      medications: medicationStatus,
    })
  } catch (error) {
    console.error('Error fetching medication status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication status' },
      { status: 500 }
    )
  }
}
