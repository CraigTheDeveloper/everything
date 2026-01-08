import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get streak freeze tokens
export async function GET() {
  try {
    // Get all streak freeze tokens
    const allTokens = await prisma.streakFreeze.findMany({
      orderBy: { earnedAt: 'desc' },
    })

    // Count available (unused) tokens
    const availableTokens = allTokens.filter((t) => t.usedAt === null)
    const usedTokens = allTokens.filter((t) => t.usedAt !== null)

    return NextResponse.json({
      available: availableTokens.length,
      used: usedTokens.length,
      total: allTokens.length,
      tokens: allTokens.map((t) => ({
        id: t.id,
        earnedAt: t.earnedAt,
        usedAt: t.usedAt,
        isAvailable: t.usedAt === null,
      })),
    })
  } catch (error) {
    console.error('Error fetching streak freeze tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak freeze tokens' },
      { status: 500 }
    )
  }
}

// Earn or use a streak freeze token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body // 'earn' or 'use'

    if (action === 'earn') {
      // Create a new token
      const token = await prisma.streakFreeze.create({
        data: {},
      })

      return NextResponse.json({
        message: 'Streak freeze token earned!',
        token: {
          id: token.id,
          earnedAt: token.earnedAt,
          isAvailable: true,
        },
      })
    }

    if (action === 'use') {
      // Find an available token
      const availableToken = await prisma.streakFreeze.findFirst({
        where: { usedAt: null },
        orderBy: { earnedAt: 'asc' }, // Use oldest token first
      })

      if (!availableToken) {
        return NextResponse.json(
          { error: 'No streak freeze tokens available' },
          { status: 400 }
        )
      }

      // Mark token as used
      const token = await prisma.streakFreeze.update({
        where: { id: availableToken.id },
        data: { usedAt: new Date() },
      })

      // Get updated count
      const remaining = await prisma.streakFreeze.count({
        where: { usedAt: null },
      })

      return NextResponse.json({
        message: 'Streak freeze used! Your streak is protected.',
        token: {
          id: token.id,
          earnedAt: token.earnedAt,
          usedAt: token.usedAt,
        },
        remaining,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "earn" or "use".' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing streak freeze token:', error)
    return NextResponse.json(
      { error: 'Failed to manage streak freeze token' },
      { status: 500 }
    )
  }
}
