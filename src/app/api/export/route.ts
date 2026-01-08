import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Export all data in JSON or CSV format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // 'json' or 'csv'

    // Fetch all data
    const [
      bodyMetrics,
      progressPhotos,
      timeCategories,
      timeActivities,
      timeEntries,
      medications,
      medicationLogs,
      oralLogs,
      pushupLogs,
      dogs,
      dogWalks,
      achievements,
      userAchievements,
      level,
      streakFreezes,
    ] = await Promise.all([
      prisma.bodyMetric.findMany({ orderBy: { date: 'desc' } }),
      prisma.progressPhoto.findMany({ orderBy: { date: 'desc' } }),
      prisma.timeCategory.findMany(),
      prisma.timeActivity.findMany({ include: { category: true } }),
      prisma.timeEntry.findMany({
        include: { activity: { include: { category: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.medication.findMany(),
      prisma.medicationLog.findMany({
        include: { medication: true },
        orderBy: { date: 'desc' },
      }),
      prisma.oralHygieneLog.findMany({ orderBy: { date: 'desc' } }),
      prisma.pushupLog.findMany({ orderBy: { date: 'desc' } }),
      prisma.dog.findMany(),
      prisma.dogWalk.findMany({
        include: { dogs: { include: { dog: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
      prisma.level.findFirst(),
      prisma.streakFreeze.findMany({ orderBy: { earnedAt: 'desc' } }),
    ])

    if (format === 'json') {
      const exportData = {
        exportedAt: new Date().toISOString(),
        data: {
          bodyMetrics,
          progressPhotos,
          timeCategories,
          timeActivities,
          timeEntries,
          medications,
          medicationLogs,
          oralHygieneLogs: oralLogs,
          pushupLogs,
          dogs,
          dogWalks,
          achievements,
          userAchievements,
          level,
          streakFreezes,
        },
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="everything-export.json"',
        },
      })
    }

    if (format === 'csv') {
      // Create CSV files content
      const csvFiles: Record<string, string> = {}

      // Body Metrics CSV
      csvFiles['body-metrics.csv'] = [
        'id,date,weight,bodyFatPercent,musclePercent,pointsEarned,createdAt',
        ...bodyMetrics.map((m) =>
          `${m.id},${m.date.toISOString()},${m.weight || ''},${m.bodyFatPercent || ''},${m.musclePercent || ''},${m.pointsEarned},${m.createdAt.toISOString()}`
        ),
      ].join('\n')

      // Oral Hygiene CSV
      csvFiles['oral-hygiene.csv'] = [
        'id,date,morningBrush,eveningBrush,eveningFloss,createdAt',
        ...oralLogs.map((l) =>
          `${l.id},${l.date.toISOString()},${l.morningBrush},${l.eveningBrush},${l.eveningFloss},${l.createdAt.toISOString()}`
        ),
      ].join('\n')

      // Pushups CSV
      csvFiles['pushups.csv'] = [
        'id,date,count,createdAt',
        ...pushupLogs.map((l) =>
          `${l.id},${l.date.toISOString()},${l.count},${l.createdAt.toISOString()}`
        ),
      ].join('\n')

      // Time Entries CSV
      csvFiles['time-entries.csv'] = [
        'id,date,activityName,categoryName,isWasteful,durationMinutes,isManual,createdAt',
        ...timeEntries.map((e) =>
          `${e.id},${e.date.toISOString()},${e.activity.name},${e.activity.category.name},${e.activity.category.isWasteful},${e.durationMinutes},${e.isManual},${e.createdAt.toISOString()}`
        ),
      ].join('\n')

      // Medication Logs CSV
      csvFiles['medication-logs.csv'] = [
        'id,date,medicationName,timeOfDay,taken,createdAt',
        ...medicationLogs.map((l) =>
          `${l.id},${l.date.toISOString()},${l.medication.name},${l.timeOfDay},${l.taken},${l.createdAt.toISOString()}`
        ),
      ].join('\n')

      // Dog Walks CSV
      csvFiles['dog-walks.csv'] = [
        'id,date,dogs,durationMinutes,distanceKm,steps,avgHeartRate,paceMinPerKm,comments,createdAt',
        ...dogWalks.map((w) => {
          const dogNames = w.dogs.map((d) => d.dog.name).join(';')
          return `${w.id},${w.date.toISOString()},"${dogNames}",${w.durationMinutes},${w.distanceKm || ''},${w.steps || ''},${w.avgHeartRate || ''},${w.paceMinPerKm || ''},"${w.comments || ''}",${w.createdAt.toISOString()}`
        }),
      ].join('\n')

      // Achievements CSV
      csvFiles['achievements.csv'] = [
        'id,achievementKey,achievementName,xpReward,unlockedAt',
        ...userAchievements.map((ua) =>
          `${ua.id},${ua.achievement.key},${ua.achievement.name},${ua.achievement.xpReward},${ua.unlockedAt.toISOString()}`
        ),
      ].join('\n')

      // Return all CSVs as a combined response with metadata
      const combinedCsv = {
        exportedAt: new Date().toISOString(),
        files: csvFiles,
      }

      return new NextResponse(JSON.stringify(combinedCsv, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="everything-export-csv.json"',
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format. Use "json" or "csv".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
