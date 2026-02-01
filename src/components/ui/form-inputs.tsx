'use client'

import { forwardRef, useState, useId } from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// STYLED TEXT INPUT WITH FLOATING LABEL
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, icon, variant = 'default', type = 'text', ...props }, ref) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)

    const variantColors = {
      default: 'focus:border-primary focus:ring-primary/20',
      body: 'focus:border-body focus:ring-body/20',
      time: 'focus:border-time focus:ring-time/20',
      medication: 'focus:border-medication focus:ring-medication/20',
      pushups: 'focus:border-pushups focus:ring-pushups/20',
      dogs: 'focus:border-dogs focus:ring-dogs/20',
      oral: 'focus:border-oral focus:ring-oral/20',
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        {/* Input with optional icon */}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            className={cn(
              'peer w-full rounded-lg border bg-background px-4 py-3 text-foreground transition-all duration-200',
              'placeholder:text-transparent',
              'focus:outline-none focus:ring-2',
              variantColors[variant],
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              success && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              !error && !success && 'border-border hover:border-muted-foreground/50',
              className
            )}
            placeholder={label || ' '}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating label */}
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none',
                'text-muted-foreground bg-background px-1',
                icon && 'left-10',
                (isFocused || hasValue)
                  ? '-top-2.5 text-xs'
                  : 'top-1/2 -translate-y-1/2 text-sm',
                isFocused && !error && !success && 'text-primary',
                error && 'text-red-500',
                success && 'text-green-500'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {/* Error/success message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Looks good!
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ============================================================================
// CUSTOM STYLED CHECKBOX
// ============================================================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, variant = 'default', ...props }, ref) => {
    const id = useId()

    const variantColors = {
      default: 'peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-primary/20',
      body: 'peer-checked:bg-body peer-checked:border-body peer-focus-visible:ring-body/20',
      time: 'peer-checked:bg-time peer-checked:border-time peer-focus-visible:ring-time/20',
      medication: 'peer-checked:bg-medication peer-checked:border-medication peer-focus-visible:ring-medication/20',
      pushups: 'peer-checked:bg-pushups peer-checked:border-pushups peer-focus-visible:ring-pushups/20',
      dogs: 'peer-checked:bg-dogs peer-checked:border-dogs peer-focus-visible:ring-dogs/20',
      oral: 'peer-checked:bg-oral peer-checked:border-oral peer-focus-visible:ring-oral/20',
    }

    return (
      <label htmlFor={id} className={cn('inline-flex items-center gap-3 cursor-pointer group', className)}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          {/* Custom checkbox visual */}
          <div
            className={cn(
              'w-5 h-5 rounded border-2 border-border transition-all duration-200',
              'flex items-center justify-center',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
              'group-hover:border-muted-foreground/50',
              variantColors[variant]
            )}
          >
            {/* Checkmark */}
            <svg
              className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Animated checkmark */}
          <svg
            className={cn(
              'absolute inset-0 w-5 h-5 text-white pointer-events-none',
              'opacity-0 peer-checked:opacity-100 transition-all duration-200'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className="checkbox-path"
            />
          </svg>
        </div>
        {label && (
          <span className="text-sm text-foreground select-none group-hover:text-foreground/80 transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
  size?: 'sm' | 'md' | 'lg'
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, variant = 'default', size = 'md', ...props }, ref) => {
    const id = useId()

    const variantColors = {
      default: 'peer-checked:bg-primary peer-focus-visible:ring-primary/20',
      body: 'peer-checked:bg-body peer-focus-visible:ring-body/20',
      time: 'peer-checked:bg-time peer-focus-visible:ring-time/20',
      medication: 'peer-checked:bg-medication peer-focus-visible:ring-medication/20',
      pushups: 'peer-checked:bg-pushups peer-focus-visible:ring-pushups/20',
      dogs: 'peer-checked:bg-dogs peer-focus-visible:ring-dogs/20',
      oral: 'peer-checked:bg-oral peer-focus-visible:ring-oral/20',
    }

    const sizeClasses = {
      sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'peer-checked:translate-x-4' },
      md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'peer-checked:translate-x-5' },
      lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'peer-checked:translate-x-7' },
    }

    const sizes = sizeClasses[size]

    return (
      <label htmlFor={id} className={cn('inline-flex items-center gap-3 cursor-pointer group', className)}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          {/* Track */}
          <div
            className={cn(
              sizes.track,
              'rounded-full bg-muted transition-colors duration-300',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
              variantColors[variant]
            )}
          />
          {/* Thumb */}
          <div
            className={cn(
              sizes.thumb,
              'absolute top-0.5 left-0.5 rounded-full bg-white shadow-md',
              'transition-transform duration-300 ease-out',
              sizes.translate
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-foreground select-none">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground select-none">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    )
  }
)
Toggle.displayName = 'Toggle'

// ============================================================================
// SELECT DROPDOWN
// ============================================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, variant = 'default', ...props }, ref) => {
    const id = useId()

    const variantColors = {
      default: 'focus:border-primary focus:ring-primary/20',
      body: 'focus:border-body focus:ring-body/20',
      time: 'focus:border-time focus:ring-time/20',
      medication: 'focus:border-medication focus:ring-medication/20',
      pushups: 'focus:border-pushups focus:ring-pushups/20',
      dogs: 'focus:border-dogs focus:ring-dogs/20',
      oral: 'focus:border-oral focus:ring-oral/20',
    }

    return (
      <div className="relative">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full appearance-none rounded-lg border bg-background px-4 py-3 pr-10 text-foreground',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2',
              'hover:border-muted-foreground/50',
              variantColors[variant],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ============================================================================
// TEXTAREA
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, variant = 'default', ...props }, ref) => {
    const id = useId()
    const [isFocused, setIsFocused] = useState(false)

    const variantColors = {
      default: 'focus:border-primary focus:ring-primary/20',
      body: 'focus:border-body focus:ring-body/20',
      time: 'focus:border-time focus:ring-time/20',
      medication: 'focus:border-medication focus:ring-medication/20',
      pushups: 'focus:border-pushups focus:ring-pushups/20',
      dogs: 'focus:border-dogs focus:ring-dogs/20',
      oral: 'focus:border-oral focus:ring-oral/20',
    }

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors',
              isFocused ? 'text-primary' : 'text-foreground',
              error && 'text-red-500'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 text-foreground transition-all duration-200',
            'focus:outline-none focus:ring-2',
            'hover:border-muted-foreground/50 resize-y min-h-[100px]',
            variantColors[variant],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ============================================================================
// RADIO BUTTON
// ============================================================================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  variant?: 'default' | 'body' | 'time' | 'medication' | 'pushups' | 'dogs' | 'oral'
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, variant = 'default', ...props }, ref) => {
    const id = useId()

    const variantColors = {
      default: 'peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-primary/20',
      body: 'peer-checked:border-body peer-checked:bg-body peer-focus-visible:ring-body/20',
      time: 'peer-checked:border-time peer-checked:bg-time peer-focus-visible:ring-time/20',
      medication: 'peer-checked:border-medication peer-checked:bg-medication peer-focus-visible:ring-medication/20',
      pushups: 'peer-checked:border-pushups peer-checked:bg-pushups peer-focus-visible:ring-pushups/20',
      dogs: 'peer-checked:border-dogs peer-checked:bg-dogs peer-focus-visible:ring-dogs/20',
      oral: 'peer-checked:border-oral peer-checked:bg-oral peer-focus-visible:ring-oral/20',
    }

    return (
      <label htmlFor={id} className={cn('inline-flex items-center gap-3 cursor-pointer group', className)}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="radio"
            className="peer sr-only"
            {...props}
          />
          {/* Custom radio visual */}
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 border-border transition-all duration-200',
              'flex items-center justify-center',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
              'group-hover:border-muted-foreground/50',
              variantColors[variant]
            )}
          >
            {/* Inner dot */}
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full bg-white',
                'scale-0 peer-checked:scale-100 transition-transform duration-200'
              )}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm text-foreground select-none group-hover:text-foreground/80 transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Radio.displayName = 'Radio'

// ============================================================================
// RADIO GROUP
// ============================================================================

interface RadioGroupProps {
  label?: string
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  children,
  className,
  orientation = 'horizontal',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <span className="block text-sm font-medium text-foreground">{label}</span>
      )}
      <div className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2'
      )}>
        {children}
      </div>
    </div>
  )
}
