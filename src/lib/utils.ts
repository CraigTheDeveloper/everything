import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a date is today (same-day validation)
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * Get today's date at midnight (for database queries)
 */
export function getTodayDate(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Calculate XP required for a given level
 */
export function xpForLevel(level: number): number {
  // Progressive XP requirements: 100, 150, 225, 338, ...
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/**
 * Get level title based on level number
 */
export function getLevelTitle(level: number): string {
  if (level < 5) return 'Novice'
  if (level < 10) return 'Apprentice'
  if (level < 15) return 'Dedicated'
  if (level < 20) return 'Committed'
  if (level < 30) return 'Unstoppable'
  if (level < 40) return 'Master'
  return 'Legend'
}

/**
 * Calculate remaining days in current year
 */
export function remainingDaysInYear(): number {
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const diffTime = endOfYear.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate day of year (1-365/366)
 */
export function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}
