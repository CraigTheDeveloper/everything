import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get all achievements with unlock status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recentOnly = searchParams.get('recent') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      include: {
        unlocks: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Get user achievements (recent first)
    const userAchievements = await prisma.userAchievement.findMany({
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
      take: recentOnly ? limit : undefined,
    })

    if (recentOnly) {
      // Return only recent unlocked achievements
      return NextResponse.json({
        achievements: userAchievements.map((ua) => ({
          id: ua.achievement.id,
          key: ua.achievement.key,
          name: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          xpReward: ua.achievement.xpReward,
          unlockedAt: ua.unlockedAt,
        })),
        count: userAchievements.length,
      })
    }

    // Return all achievements with unlock status
    return NextResponse.json({
      achievements: achievements.map((a) => ({
        id: a.id,
        key: a.key,
        name: a.isHidden && a.unlocks.length === 0 ? '???' : a.name,
        description: a.isHidden && a.unlocks.length === 0 ? 'Hidden achievement' : a.description,
        icon: a.icon,
        isHidden: a.isHidden,
        xpReward: a.xpReward,
        unlocked: a.unlocks.length > 0,
        unlockedAt: a.unlocks[0]?.unlockedAt || null,
      })),
      unlockedCount: achievements.filter((a) => a.unlocks.length > 0).length,
      totalCount: achievements.length,
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

// Unlock an achievement (usually called by backend logic)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { achievementKey } = body

    if (!achievementKey) {
      return NextResponse.json(
        { error: 'Achievement key is required' },
        { status: 400 }
      )
    }

    // Find the achievement
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
      include: { unlocks: true },
    })

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      )
    }

    // Check if already unlocked
    if (achievement.unlocks.length > 0) {
      return NextResponse.json({
        message: 'Achievement already unlocked',
        achievement: {
          id: achievement.id,
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
          alreadyUnlocked: true,
        },
      })
    }

    // Unlock the achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        achievementId: achievement.id,
      },
    })

    // Update XP (get or create Level record)
    let level = await prisma.level.findFirst()
    if (!level) {
      level = await prisma.level.create({
        data: { currentXP: 0, currentLevel: 1 },
      })
    }

    const newXP = level.currentXP + achievement.xpReward
    const newLevel = calculateLevel(newXP)

    await prisma.level.update({
      where: { id: level.id },
      data: {
        currentXP: newXP,
        currentLevel: newLevel,
      },
    })

    return NextResponse.json({
      message: 'Achievement unlocked!',
      achievement: {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        unlockedAt: userAchievement.unlockedAt,
      },
      xpGained: achievement.xpReward,
      newTotalXP: newXP,
      newLevel: newLevel,
    })
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    )
  }
}

// Calculate level from XP
function calculateLevel(xp: number): number {
  // Level thresholds: Level 1 = 0-99, Level 2 = 100-249, etc.
  // Formula: each level requires 100 + (level - 1) * 50 XP
  let level = 1
  let xpRequired = 100

  while (xp >= xpRequired) {
    xp -= xpRequired
    level++
    xpRequired = 100 + (level - 1) * 50
  }

  return level
}
