import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Level thresholds - each level requires more XP
// Level 1: 0-99 XP
// Level 2: 100-249 XP (100 for level 2)
// Level 3: 250-449 XP (150 for level 3)
// Level 4: 450-699 XP (200 for level 4)
// etc. (each level adds 50 more XP requirement)
function calculateLevel(xp: number): { level: number; xpForCurrentLevel: number; xpToNextLevel: number; totalXpForNextLevel: number } {
  let level = 1
  let totalXp = 0
  let xpRequired = 100

  while (xp >= totalXp + xpRequired) {
    totalXp += xpRequired
    level++
    xpRequired = 100 + (level - 1) * 50
  }

  const xpForCurrentLevel = xp - totalXp
  const xpToNextLevel = xpRequired - xpForCurrentLevel
  const totalXpForNextLevel = totalXp + xpRequired

  return { level, xpForCurrentLevel, xpToNextLevel, totalXpForNextLevel }
}

// Get level titles
function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legendary'
  if (level >= 40) return 'Master'
  if (level >= 30) return 'Expert'
  if (level >= 20) return 'Advanced'
  if (level >= 15) return 'Skilled'
  if (level >= 10) return 'Experienced'
  if (level >= 5) return 'Journeyman'
  if (level >= 3) return 'Apprentice'
  return 'Novice'
}

// Get current level and XP
export async function GET() {
  try {
    let levelRecord = await prisma.level.findFirst()

    if (!levelRecord) {
      levelRecord = await prisma.level.create({
        data: {
          currentXP: 0,
          currentLevel: 1,
        },
      })
    }

    const { level, xpForCurrentLevel, xpToNextLevel, totalXpForNextLevel } = calculateLevel(levelRecord.currentXP)
    const title = getLevelTitle(level)

    return NextResponse.json({
      currentXP: levelRecord.currentXP,
      currentLevel: level,
      title,
      xpForCurrentLevel,
      xpToNextLevel,
      totalXpForNextLevel,
      progressPercent: Math.round((xpForCurrentLevel / (xpForCurrentLevel + xpToNextLevel)) * 100),
    })
  } catch (error) {
    console.error('Error fetching level:', error)
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    )
  }
}

// Add XP (from daily points)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { xp } = body

    if (xp === undefined || xp < 0) {
      return NextResponse.json(
        { error: 'Valid XP amount is required' },
        { status: 400 }
      )
    }

    let levelRecord = await prisma.level.findFirst()

    if (!levelRecord) {
      levelRecord = await prisma.level.create({
        data: {
          currentXP: 0,
          currentLevel: 1,
        },
      })
    }

    const oldLevel = calculateLevel(levelRecord.currentXP).level
    const newXP = levelRecord.currentXP + xp
    const { level: newLevel, xpForCurrentLevel, xpToNextLevel, totalXpForNextLevel } = calculateLevel(newXP)

    await prisma.level.update({
      where: { id: levelRecord.id },
      data: {
        currentXP: newXP,
        currentLevel: newLevel,
      },
    })

    const title = getLevelTitle(newLevel)
    const leveledUp = newLevel > oldLevel

    return NextResponse.json({
      xpAdded: xp,
      currentXP: newXP,
      currentLevel: newLevel,
      title,
      xpForCurrentLevel,
      xpToNextLevel,
      totalXpForNextLevel,
      progressPercent: Math.round((xpForCurrentLevel / (xpForCurrentLevel + xpToNextLevel)) * 100),
      leveledUp,
      message: leveledUp
        ? `Congratulations! You reached level ${newLevel}!`
        : `+${xp} XP earned!`,
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json(
      { error: 'Failed to add XP' },
      { status: 500 }
    )
  }
}
