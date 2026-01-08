import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Check if a day has any activity logged
async function hasAnyActivity(targetDate: Date): Promise<boolean> {
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

  const [bodyMetric, photo, timeEntry, medLog, oralLog, pushupLog] = await Promise.all([
    prisma.bodyMetric.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.progressPhoto.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.timeEntry.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.medicationLog.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.oralHygieneLog.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
    prisma.pushupLog.findFirst({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
  ])

  return !!(bodyMetric || photo || timeEntry || medLog || oralLog || pushupLog)
}

// Check if a day is a "perfect day" (all modules completed)
async function isPerfectDay(targetDate: Date): Promise<boolean> {
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)

  // Body: must have all 3 metrics
  const bodyMetric = await prisma.bodyMetric.findFirst({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  const bodyComplete = bodyMetric &&
    bodyMetric.weight !== null &&
    bodyMetric.bodyFatPercent !== null &&
    bodyMetric.musclePercent !== null

  // Photos: must have all 3 types
  const photos = await prisma.progressPhoto.findMany({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  const photosComplete = ['front', 'back', 'side'].every(t => photos.some(p => p.type === t))

  // Time: must be under time wasting goal
  const timeGoal = await prisma.timeGoal.findFirst()
  let timeComplete = false
  if (timeGoal) {
    const timeEntries = await prisma.timeEntry.findMany({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      include: { activity: { include: { category: true } } },
    })
    const wastefulMinutes = timeEntries.reduce((sum, e) =>
      e.activity.category.isWasteful ? sum + e.durationMinutes : sum, 0
    )
    timeComplete = wastefulMinutes <= timeGoal.maxWasteMinutes
  }

  // Medication: all medications fully taken
  const medications = await prisma.medication.findMany({ where: { active: true } })
  const medicationLogs = await prisma.medicationLog.findMany({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  let medicationComplete = medications.length === 0 // True if no medications to track
  if (medications.length > 0) {
    medicationComplete = medications.every(med => {
      const slotsPerDay = med.frequency === 'ONCE' ? 1 : med.frequency === 'TWICE' ? 2 : 3
      const expectedSlots = med.frequency === 'ONCE' ? ['morning'] :
        med.frequency === 'TWICE' ? ['morning', 'evening'] : ['morning', 'afternoon', 'evening']
      const takenCount = medicationLogs.filter(
        log => log.medicationId === med.id && log.taken && expectedSlots.includes(log.timeOfDay)
      ).length
      return takenCount >= slotsPerDay
    })
  }

  // Oral: all 3 items completed
  const oralLog = await prisma.oralHygieneLog.findFirst({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  const oralComplete = oralLog &&
    oralLog.morningBrush &&
    oralLog.eveningBrush &&
    oralLog.eveningFloss

  return !!(bodyComplete && photosComplete && timeComplete && medicationComplete && oralComplete)
}

// Calculate streak (consecutive days)
async function calculateStreak(
  checkFunction: (date: Date) => Promise<boolean>
): Promise<{ currentStreak: number; longestStreak: number; lastDate: string | null }> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate: string | null = null
  let streakBroken = false

  // Go back up to 365 days
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)

    const matches = await checkFunction(checkDate)

    if (matches) {
      if (!streakBroken) {
        currentStreak++
        if (lastDate === null) {
          lastDate = formatDate(checkDate)
        }
      }
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      if (!streakBroken) {
        streakBroken = true
      }
      tempStreak = 0
    }
  }

  return { currentStreak, longestStreak, lastDate }
}

// Get all streaks
export async function GET() {
  try {
    // Calculate perfect day streak
    const perfectDayStreak = await calculateStreak(isPerfectDay)

    // Calculate "showed up" streak (any activity)
    const showedUpStreak = await calculateStreak(hasAnyActivity)

    // Calculate oral hygiene streak
    const oralStreak = await calculateStreak(async (date: Date) => {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      const log = await prisma.oralHygieneLog.findFirst({
        where: { date: { gte: startOfDay, lt: endOfDay } },
      })
      return !!(log && log.morningBrush && log.eveningBrush && log.eveningFloss)
    })

    // Calculate pushup streak
    const pushupStreak = await calculateStreak(async (date: Date) => {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      const log = await prisma.pushupLog.findFirst({
        where: { date: { gte: startOfDay, lt: endOfDay } },
      })
      return !!(log && log.count > 0)
    })

    return NextResponse.json({
      perfectDay: {
        ...perfectDayStreak,
        description: 'Consecutive days completing all modules',
      },
      showedUp: {
        ...showedUpStreak,
        description: 'Consecutive days with any activity',
      },
      oralHygiene: {
        ...oralStreak,
        description: 'Consecutive days with perfect oral hygiene',
      },
      pushups: {
        ...pushupStreak,
        description: 'Consecutive days doing pushups',
      },
    })
  } catch (error) {
    console.error('Error calculating streaks:', error)
    return NextResponse.json(
      { error: 'Failed to calculate streaks' },
      { status: 500 }
    )
  }
}
