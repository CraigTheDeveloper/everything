import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to create a date from YYYY-MM-DD string
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calculate points for a specific date
async function calculateDailyPoints(targetDate: Date): Promise<{
  date: string
  body: number
  photos: number
  time: number
  medication: number
  oral: number
  pushups: number
  total: number
}> {
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
  const dateStr = formatDate(targetDate)

  let bodyPoints = 0
  let photosPoints = 0
  let timePoints = 0
  let medicationPoints = 0
  let oralPoints = 0
  let pushupPoints = 0

  // Body metrics points - 1 point if all 3 metrics logged
  const bodyMetric = await prisma.bodyMetric.findFirst({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  if (bodyMetric && bodyMetric.weight !== null && bodyMetric.bodyFatPercent !== null && bodyMetric.musclePercent !== null) {
    bodyPoints = 1
  }

  // Photos points - 1 point if all 3 photos uploaded
  const photos = await prisma.progressPhoto.findMany({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  const hasAllPhotos = ['front', 'back', 'side'].every(t => photos.some(p => p.type === t))
  if (hasAllPhotos) {
    photosPoints = 1
  }

  // Time tracking points - 1 point if under time wasting goal
  const timeGoal = await prisma.timeGoal.findFirst()
  if (timeGoal) {
    const timeEntries = await prisma.timeEntry.findMany({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      include: { activity: { include: { category: true } } },
    })
    const wastefulMinutes = timeEntries.reduce((sum, e) =>
      e.activity.category.isWasteful ? sum + e.durationMinutes : sum, 0
    )
    if (wastefulMinutes <= timeGoal.maxWasteMinutes) {
      timePoints = 1
    }
  }

  // Medication points - 1 point per fully taken medication
  const medications = await prisma.medication.findMany({ where: { active: true } })
  const medicationLogs = await prisma.medicationLog.findMany({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  for (const med of medications) {
    const slotsPerDay = med.frequency === 'ONCE' ? 1 : med.frequency === 'TWICE' ? 2 : 3
    const expectedSlots = med.frequency === 'ONCE' ? ['morning'] :
      med.frequency === 'TWICE' ? ['morning', 'evening'] : ['morning', 'afternoon', 'evening']
    const takenCount = medicationLogs.filter(
      log => log.medicationId === med.id && log.taken && expectedSlots.includes(log.timeOfDay)
    ).length
    if (takenCount >= slotsPerDay) {
      medicationPoints += 1
    }
  }

  // Oral hygiene points - 1 point per item (max 3)
  const oralLog = await prisma.oralHygieneLog.findFirst({
    where: { date: { gte: startOfDay, lt: endOfDay } },
  })
  if (oralLog) {
    oralPoints = [oralLog.morningBrush, oralLog.eveningBrush, oralLog.eveningFloss].filter(Boolean).length
  }

  // Pushups points - calculated separately (not part of daily points for now)
  // Could add milestone points later

  const total = bodyPoints + photosPoints + timePoints + medicationPoints + oralPoints + pushupPoints

  return {
    date: dateStr,
    body: bodyPoints,
    photos: photosPoints,
    time: timePoints,
    medication: medicationPoints,
    oral: oralPoints,
    pushups: pushupPoints,
    total,
  }
}

// Get points for today, this week, this month, or a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const weeklyParam = searchParams.get('weekly') === 'true'
    const monthlyParam = searchParams.get('monthly') === 'true'

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lifetimeParam = searchParams.get('lifetime') === 'true'

    if (lifetimeParam) {
      // Calculate lifetime stats - all time
      let totalLifetimePoints = 0
      let daysWithActivity = 0
      const categoryTotals = {
        body: 0,
        photos: 0,
        time: 0,
        medication: 0,
        oral: 0,
        pushups: 0,
      }

      // Get the earliest date with any data
      const earliestEntries = await Promise.all([
        prisma.bodyMetric.findFirst({ orderBy: { date: 'asc' } }),
        prisma.progressPhoto.findFirst({ orderBy: { date: 'asc' } }),
        prisma.timeEntry.findFirst({ orderBy: { date: 'asc' } }),
        prisma.medicationLog.findFirst({ orderBy: { date: 'asc' } }),
        prisma.oralHygieneLog.findFirst({ orderBy: { date: 'asc' } }),
      ])

      const dates = earliestEntries
        .filter(e => e !== null)
        .map(e => new Date(e!.date))

      if (dates.length === 0) {
        return NextResponse.json({
          type: 'lifetime',
          summary: {
            totalPoints: 0,
            daysWithActivity: 0,
            daysSinceStart: 0,
            categoryTotals,
          },
        })
      }

      const startDate = new Date(Math.min(...dates.map(d => d.getTime())))
      startDate.setHours(0, 0, 0, 0)
      const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      // Calculate points for each day since start
      for (let i = 0; i < daysSinceStart; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        if (date > today) break

        const dayPoints = await calculateDailyPoints(date)
        totalLifetimePoints += dayPoints.total
        if (dayPoints.total > 0) {
          daysWithActivity++
        }
        categoryTotals.body += dayPoints.body
        categoryTotals.photos += dayPoints.photos
        categoryTotals.time += dayPoints.time
        categoryTotals.medication += dayPoints.medication
        categoryTotals.oral += dayPoints.oral
        categoryTotals.pushups += dayPoints.pushups
      }

      return NextResponse.json({
        type: 'lifetime',
        startDate: formatDate(startDate),
        summary: {
          totalPoints: totalLifetimePoints,
          daysWithActivity,
          daysSinceStart,
          categoryTotals,
        },
      })
    }

    if (monthlyParam) {
      // Calculate monthly stats - current month
      const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : now.getFullYear()
      const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : now.getMonth() + 1

      const daysInMonth = new Date(year, month, 0).getDate()
      const daysElapsed = year === now.getFullYear() && month === now.getMonth() + 1
        ? now.getDate()
        : daysInMonth

      let totalMonthPoints = 0
      let daysWithActivity = 0
      const categoryTotals = {
        body: 0,
        photos: 0,
        time: 0,
        medication: 0,
        oral: 0,
        pushups: 0,
      }

      for (let day = 1; day <= daysElapsed; day++) {
        const date = new Date(year, month - 1, day)
        const dayPoints = await calculateDailyPoints(date)
        totalMonthPoints += dayPoints.total
        if (dayPoints.total > 0) {
          daysWithActivity++
        }
        categoryTotals.body += dayPoints.body
        categoryTotals.photos += dayPoints.photos
        categoryTotals.time += dayPoints.time
        categoryTotals.medication += dayPoints.medication
        categoryTotals.oral += dayPoints.oral
        categoryTotals.pushups += dayPoints.pushups
      }

      const completionRate = daysElapsed > 0 ? Math.round((daysWithActivity / daysElapsed) * 100) : 0

      return NextResponse.json({
        type: 'monthly',
        year,
        month,
        daysInMonth,
        daysElapsed,
        summary: {
          totalPoints: totalMonthPoints,
          daysWithActivity,
          completionRate,
          categoryTotals,
        },
      })
    }

    if (weeklyParam) {
      // Calculate weekly stats - last 7 days
      const weekDays: Awaited<ReturnType<typeof calculateDailyPoints>>[] = []
      let totalWeekPoints = 0
      let daysWithActivity = 0

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dayPoints = await calculateDailyPoints(date)
        weekDays.push(dayPoints)
        totalWeekPoints += dayPoints.total
        if (dayPoints.total > 0) {
          daysWithActivity++
        }
      }

      // Consistency multiplier - bonus for consecutive days
      // 1x for 1-2 days, 1.25x for 3-4 days, 1.5x for 5-6 days, 2x for 7 days
      let consistencyMultiplier = 1.0
      if (daysWithActivity >= 7) {
        consistencyMultiplier = 2.0
      } else if (daysWithActivity >= 5) {
        consistencyMultiplier = 1.5
      } else if (daysWithActivity >= 3) {
        consistencyMultiplier = 1.25
      }

      const weeklyScore = Math.round(totalWeekPoints * consistencyMultiplier)

      return NextResponse.json({
        type: 'weekly',
        days: weekDays,
        summary: {
          totalBasePoints: totalWeekPoints,
          daysWithActivity,
          consistencyMultiplier,
          weeklyScore,
        },
      })
    }

    // Get daily points for a specific date
    const targetDate = dateParam ? parseLocalDate(dateParam) : today
    const dailyPoints = await calculateDailyPoints(targetDate)

    return NextResponse.json({
      type: 'daily',
      ...dailyPoints,
    })
  } catch (error) {
    console.error('Error calculating points:', error)
    return NextResponse.json(
      { error: 'Failed to calculate points' },
      { status: 500 }
    )
  }
}
