'use client'

import { useEffect, useState, useRef, useId } from 'react'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  gradientFrom?: string
  gradientTo?: string
  backgroundColor?: string
  label?: string
  sublabel?: string
  showGlowOnComplete?: boolean
  animated?: boolean
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color,
  gradientFrom = 'hsl(var(--primary))',
  gradientTo = 'hsl(270 60% 55%)',
  backgroundColor = 'hsl(var(--muted))',
  label,
  sublabel,
  showGlowOnComplete = true,
  animated = true,
}: ProgressRingProps) {
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : progress)
  const [isComplete, setIsComplete] = useState(progress >= 100)
  const prevProgressRef = useRef(progress)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayProgress / 100) * circumference

  // Use React's useId for stable, SSR-compatible unique IDs
  const gradientId = useId()

  // Animate progress on mount and when progress changes
  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progress)
      setIsComplete(progress >= 100)
      return
    }

    const startProgress = prevProgressRef.current === progress ? 0 : displayProgress
    const endProgress = Math.min(100, Math.max(0, progress))
    const duration = 800 // ms
    const startTime = Date.now()

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      // Easing function: ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3)

      const currentProgress = startProgress + (endProgress - startProgress) * eased
      setDisplayProgress(Math.round(currentProgress))

      if (t < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        setIsComplete(endProgress >= 100)
        prevProgressRef.current = progress
      }
    }

    requestAnimationFrame(animateProgress)
  }, [progress, animated])

  const useGradient = !color
  const strokeColor = color || `url(#${gradientId})`

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative transition-all duration-300 ${isComplete && showGlowOnComplete ? 'animate-pulse-scale' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Gradient definition */}
          {useGradient && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
          )}

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-30"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={`transition-all duration-500 ease-out ${isComplete && showGlowOnComplete ? 'drop-shadow-lg' : ''}`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              filter: isComplete && showGlowOnComplete ? `drop-shadow(0 0 6px ${gradientFrom})` : undefined,
            }}
          />
        </svg>

        {/* Center text with count-up animation */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className={`text-lg font-bold transition-all duration-200 ${isComplete ? 'text-primary scale-110' : ''}`}>
            {displayProgress}%
          </span>
        </div>

        {/* Glow effect overlay for complete state */}
        {isComplete && showGlowOnComplete && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              background: `radial-gradient(circle, ${gradientFrom} 0%, transparent 70%)`,
              animationDuration: '2s',
            }}
          />
        )}
      </div>

      {label && (
        <span className="mt-2 text-sm font-medium">{label}</span>
      )}
      {sublabel && (
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      )}
    </div>
  )
}

// Animated counter component for displaying numbers with count-up effect
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 800,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const startValue = prevValueRef.current === value ? 0 : displayValue
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)

      // Easing function: ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3)

      const current = Math.round(startValue + (endValue - startValue) * eased)
      setDisplayValue(current)

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValueRef.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

// Animated progress bar with gradient
interface AnimatedProgressBarProps {
  progress: number // 0-100
  height?: number
  gradientFrom?: string
  gradientTo?: string
  backgroundColor?: string
  showGlowOnComplete?: boolean
  animated?: boolean
  className?: string
}

export function AnimatedProgressBar({
  progress,
  height = 10,
  gradientFrom = 'hsl(var(--primary))',
  gradientTo = 'hsl(270 60% 55%)',
  backgroundColor = 'hsl(var(--muted))',
  showGlowOnComplete = true,
  animated = true,
  className = '',
}: AnimatedProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(animated ? 0 : progress)
  const [isComplete, setIsComplete] = useState(progress >= 100)
  const prevProgressRef = useRef(progress)

  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progress)
      setIsComplete(progress >= 100)
      return
    }

    const startProgress = prevProgressRef.current === progress ? 0 : displayProgress
    const endProgress = Math.min(100, Math.max(0, progress))
    const duration = 800
    const startTime = Date.now()

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const currentProgress = startProgress + (endProgress - startProgress) * eased
      setDisplayProgress(currentProgress)

      if (t < 1) {
        requestAnimationFrame(animateProgress)
      } else {
        setIsComplete(endProgress >= 100)
        prevProgressRef.current = progress
      }
    }

    requestAnimationFrame(animateProgress)
  }, [progress, animated])

  return (
    <div
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, backgroundColor }}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${isComplete && showGlowOnComplete ? 'shadow-lg' : ''}`}
        style={{
          width: `${displayProgress}%`,
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: isComplete && showGlowOnComplete ? `0 0 10px ${gradientFrom}` : undefined,
        }}
      />
    </div>
  )
}
