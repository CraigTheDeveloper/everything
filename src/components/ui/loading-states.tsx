'use client'

import { cn } from '@/lib/utils'

// ============================================================================
// ANIMATED LOADING SPINNER
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral' | 'muted'
  className?: string
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'text-primary',
    body: 'text-body',
    time: 'text-time',
    medication: 'text-medication',
    pushups: 'text-pushups',
    dogs: 'text-dogs',
    oral: 'text-oral',
    muted: 'text-muted-foreground',
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)} role="status" aria-label="Loading">
      {/* Outer ring */}
      <svg
        className={cn('animate-spin', colorClasses[color])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

// Pulsing dot spinner for subtle loading
export function PulsingDots({ color = 'primary', className }: { color?: SpinnerProps['color']; className?: string }) {
  const colorClasses = {
    primary: 'bg-primary',
    body: 'bg-body',
    time: 'bg-time',
    medication: 'bg-medication',
    pushups: 'bg-pushups',
    dogs: 'bg-dogs',
    oral: 'bg-oral',
    muted: 'bg-muted-foreground',
  }

  return (
    <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full animate-bounce',
            colorClasses[color]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// SKELETON LOADERS WITH SHIMMER
// ============================================================================

interface SkeletonProps {
  className?: string
  shimmer?: boolean
}

export function Skeleton({ className, shimmer = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        shimmer && 'skeleton-shimmer',
        className
      )}
    />
  )
}

// Card skeleton with shimmer effect
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}

// Stat card skeleton
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-muted p-4 text-center', className)}>
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-4 w-20 mx-auto" />
    </div>
  )
}

// List item skeleton
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg bg-muted px-4 py-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

// Module card skeleton (for dashboard)
export function ModuleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Progress bar skeleton
export function ProgressBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  )
}

// ============================================================================
// EMPTY STATES WITH ILLUSTRATIONS
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const variantStyles = {
    default: 'from-primary/10 to-purple-500/10',
    body: 'from-body/10 to-body/5',
    time: 'from-time/10 to-time/5',
    medication: 'from-medication/10 to-medication/5',
    pushups: 'from-pushups/10 to-pushups/5',
    dogs: 'from-dogs/10 to-dogs/5',
    oral: 'from-oral/10 to-oral/5',
  }

  const iconStyles = {
    default: 'text-primary',
    body: 'text-body',
    time: 'text-time',
    medication: 'text-medication',
    pushups: 'text-pushups',
    dogs: 'text-dogs',
    oral: 'text-oral',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Decorative background circle */}
      <div
        className={cn(
          'relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br',
          variantStyles[variant]
        )}
      >
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" style={{ animationDuration: '3s' }} />

        {/* Icon */}
        <div className={cn('text-4xl', iconStyles[variant])}>
          {icon || <DefaultEmptyIcon variant={variant} />}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

      {/* Description with personality */}
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>

      {/* Optional action button */}
      {action && <div>{action}</div>}
    </div>
  )
}

// Default icons for each module
function DefaultEmptyIcon({ variant }: { variant: EmptyStateProps['variant'] }) {
  const icons = {
    default: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    body: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    time: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    medication: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-2.622.437a7.5 7.5 0 01-5.026 0l-2.622-.437c-1.717-.293-2.299-2.379-1.067-3.611L5 14.5" />
      </svg>
    ),
    pushups: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013-5.4 8.25 8.25 0 013.362 1.014z" />
      </svg>
    ),
    dogs: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 12c0-.55-.2-1.025-.6-1.425S3.05 10 2.5 10s-1.025.192-1.425.575-.575.858-.575 1.408c0 .334.092.65.275.95.183.3.442.542.775.725L3.5 16v4c0 .283.096.52.287.713.192.191.43.287.713.287s.52-.096.713-.287A.967.967 0 005.5 20v-3h1v3c0 .283.096.52.288.713.191.191.429.287.712.287s.52-.096.712-.287A.968.968 0 008.5 20v-6h1v6c0 .283.096.52.288.713.191.191.429.287.712.287s.52-.096.712-.287A.968.968 0 0011.5 20v-6h1v6c0 .283.096.52.287.713.192.191.43.287.713.287s.52-.096.713-.287A.968.968 0 0014.5 20v-4h3.55c.25 0 .47-.07.663-.212a.935.935 0 00.362-.563l.825-3.525c.05-.2.067-.4.05-.6a2.174 2.174 0 00-.175-.6l-.775-1.7V6c0-.55-.196-1.02-.588-1.412A1.926 1.926 0 0017 4c-.283 0-.546.054-.788.162a1.941 1.941 0 00-.637.438L13.5 6.675 12.225 5.1a1.95 1.95 0 00-.65-.513A1.743 1.743 0 0010.8 4.4c-.15 0-.304.017-.462.05a1.53 1.53 0 00-.438.15l-1.35.675a4.863 4.863 0 01-1.15.412A5.918 5.918 0 016 5.85V4.5c0-.417-.146-.77-.438-1.063A1.446 1.446 0 004.5 3c-.417 0-.77.146-1.062.438A1.447 1.447 0 003 4.5v6c-.367.233-.667.538-.9.913S1.75 12.25 1.75 12.75c0 .833.27 1.542.813 2.125.541.584 1.245.892 2.112.925L4.5 12z" />
      </svg>
    ),
    oral: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  }

  return icons[variant || 'default']
}

// Pre-configured empty states for common scenarios
export function NoDataEmpty({ module, onAction }: { module: string; onAction?: () => void }) {
  const configs: Record<string, { title: string; description: string; actionText?: string; variant: EmptyStateProps['variant'] }> = {
    body: {
      title: 'Start Your Health Journey',
      description: 'Track your weight and body metrics to see your progress over time. Every measurement brings you closer to your goals!',
      actionText: 'Add First Measurement',
      variant: 'body',
    },
    time: {
      title: 'Time to Track Time',
      description: 'Log how you spend your day and discover patterns in your routine. Understanding your time is the first step to mastering it!',
      actionText: 'Start Tracking',
      variant: 'time',
    },
    medication: {
      title: 'Medication Made Simple',
      description: 'Add your medications to get reminders and track your doses. Taking care of yourself has never been easier!',
      actionText: 'Add Medication',
      variant: 'medication',
    },
    pushups: {
      title: 'Ready to Get Strong?',
      description: "Drop and give me... well, start with whatever you can! Every pushup counts toward your yearly goal. Let's go!",
      actionText: 'Log Pushups',
      variant: 'pushups',
    },
    dogs: {
      title: 'Who Let the Dogs Out?',
      description: 'Add your furry friends to start tracking their walks. Happy pups, happy life!',
      actionText: 'Add Your First Dog',
      variant: 'dogs',
    },
    oral: {
      title: 'Smile Bright!',
      description: 'Track your brushing and flossing to maintain that pearly white smile. Your dentist will be proud!',
      actionText: 'Start Today',
      variant: 'oral',
    },
    achievements: {
      title: 'Achievements Await!',
      description: 'Keep tracking your habits to unlock badges and earn XP. Your first achievement is just around the corner!',
      variant: 'default',
    },
    walks: {
      title: 'Time for Walkies!',
      description: 'No walks logged yet. Add your dogs first, then start logging those tail-wagging adventures!',
      variant: 'dogs',
    },
  }

  const config = configs[module] || {
    title: 'Nothing Here Yet',
    description: 'Get started by adding some data!',
    variant: 'default' as const,
  }

  return (
    <EmptyState
      title={config.title}
      description={config.description}
      variant={config.variant}
      action={
        config.actionText && onAction ? (
          <button
            onClick={onAction}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {config.actionText}
          </button>
        ) : undefined
      }
    />
  )
}

// Loading state wrapper
interface LoadingWrapperProps {
  isLoading: boolean
  skeleton?: React.ReactNode
  children: React.ReactNode
  variant?: 'spinner' | 'dots' | 'skeleton'
  spinnerColor?: SpinnerProps['color']
}

export function LoadingWrapper({
  isLoading,
  skeleton,
  children,
  variant = 'skeleton',
  spinnerColor = 'primary',
}: LoadingWrapperProps) {
  if (!isLoading) return <>{children}</>

  if (variant === 'spinner') {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner color={spinnerColor} size="lg" />
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center py-8">
        <PulsingDots color={spinnerColor} />
      </div>
    )
  }

  return <>{skeleton || <CardSkeleton />}</>
}
