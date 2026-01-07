import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get pushup statistics including yearly progress
export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear + 1, 0, 1)

    // Get yearly goal
    let goal = await prisma.pushupGoal.findFirst({
      where: { year: currentYear },
    })

    // If no goal exists, create default
    if (!goal) {
      goal = await prisma.pushupGoal.create({
        data: {
          year: currentYear,
          yearlyTarget: 36500,
        },
      })
    }

    // Get all pushups for this year
    const yearlyLogs = await prisma.pushupLog.findMany({
      where: {
        date: {
          gte: startOfYear,
          lt: endOfYear,
        },
      },
    })

    const yearlyTotal = yearlyLogs.reduce((sum, log) => sum + log.count, 0)

    // Calculate days remaining in year
    const today = new Date()
    const daysElapsed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const daysRemaining = Math.floor((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate required daily pace
    const remaining = goal.yearlyTarget - yearlyTotal
    const requiredDailyPace = daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : 0

    // Calculate progress percentage
    const progressPercentage = Math.round((yearlyTotal / goal.yearlyTarget) * 100 * 10) / 10

    // Get today's total
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayLogs = await prisma.pushupLog.findMany({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    })

    const todayTotal = todayLogs.reduce((sum, log) => sum + log.count, 0)

    return NextResponse.json({
      goal: {
        year: goal.year,
        yearlyTarget: goal.yearlyTarget,
      },
      progress: {
        yearlyTotal,
        remaining: Math.max(0, remaining),
        progressPercentage: Math.min(progressPercentage, 100),
        daysElapsed,
        daysRemaining,
        requiredDailyPace: Math.max(0, requiredDailyPace),
        todayTotal,
        isOnTrack: yearlyTotal >= Math.floor(goal.yearlyTarget * (daysElapsed / 365)),
      },
    })
  } catch (error) {
    console.error('Error fetching pushup stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pushup statistics' },
      { status: 500 }
    )
  }
}
