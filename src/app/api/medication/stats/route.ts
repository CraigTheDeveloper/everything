import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string (treating it as local date)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Get medication compliance statistics
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
      orderBy: { createdAt: 'desc' },
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

    // Calculate compliance per medication
    const medicationStats = medications.map((med) => {
      // Determine how many slots this medication has
      const slotsPerDay = med.frequency === 'ONCE' ? 1 : med.frequency === 'TWICE' ? 2 : 3

      // Get slots based on frequency
      const expectedSlots: string[] = []
      if (med.frequency === 'ONCE') {
        expectedSlots.push('morning')
      } else if (med.frequency === 'TWICE') {
        expectedSlots.push('morning', 'evening')
      } else {
        expectedSlots.push('morning', 'afternoon', 'evening')
      }

      // Count how many were taken
      const takenCount = logs.filter(
        (log) => log.medicationId === med.id && log.taken && expectedSlots.includes(log.timeOfDay)
      ).length

      const compliance = slotsPerDay > 0 ? Math.round((takenCount / slotsPerDay) * 100) : 0

      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        slotsPerDay,
        takenCount,
        compliance,
        isComplete: takenCount >= slotsPerDay,
      }
    })

    // Calculate overall compliance
    const totalSlots = medicationStats.reduce((sum, m) => sum + m.slotsPerDay, 0)
    const totalTaken = medicationStats.reduce((sum, m) => sum + m.takenCount, 0)
    const overallCompliance = totalSlots > 0 ? Math.round((totalTaken / totalSlots) * 100) : 0

    // Count complete medications - 1 point per fully taken medication
    const completeMedications = medicationStats.filter((m) => m.isComplete).length
    const pointsEarned = completeMedications

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      medications: medicationStats,
      summary: {
        totalMedications: medications.length,
        completeMedications,
        totalSlots,
        totalTaken,
        overallCompliance,
        pointsEarned,
      },
    })
  } catch (error) {
    console.error('Error fetching medication stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication statistics' },
      { status: 500 }
    )
  }
}
