'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

// Navigation items with icons, paths, and module colors
const mainNavItems = [
  { name: 'Home', path: '/', icon: HomeIcon, color: 'text-primary' },
  { name: 'Body', path: '/body', icon: BodyIcon, color: 'text-body' },
  { name: 'Time', path: '/time', icon: TimeIcon, color: 'text-time' },
  { name: 'Meds', path: '/medication', icon: MedsIcon, color: 'text-medication' },
  { name: 'Pushups', path: '/pushups', icon: PushupsIcon, color: 'text-pushups' },
  { name: 'Dogs', path: '/dogs', icon: DogsIcon, color: 'text-dogs' },
  { name: 'Teeth', path: '/oral', icon: OralIcon, color: 'text-oral' },
]

const secondaryNavItems = [
  { name: 'Achievements', path: '/achievements', icon: AchievementsIcon },
]

// Icon components (inline SVGs for independence)
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BodyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
      <path d="M9 22l3-8 3 8" />
    </svg>
  )
}

function TimeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MedsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5" />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  )
}

function PushupsIcon({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontSize: '20px', lineHeight: 1 }}>💪</span>
  )
}

function DogsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
      <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" />
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75z" />
      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
    </svg>
  )
}

function OralIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}

function AchievementsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-background bg-mesh-gradient">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card/95 backdrop-blur-sm shadow-soft lg:block">
        <div className="flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">Everything</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" aria-label="Main navigation">
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${active
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
                        }
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className={`h-5 w-5 transition-transform ${active ? item.color : ''}`} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Divider */}
            <div className="my-4 border-t" />

            {/* Secondary Navigation */}
            <ul className="space-y-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${active
                          ? 'bg-primary/10 text-primary shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
                        }
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer with theme toggle and branding */}
          <div className="border-t p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <p className="text-xs text-muted-foreground text-center">Personal Habit Tracker</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 backdrop-blur-sm px-4 lg:hidden shadow-soft">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Everything</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-64 transform bg-card shadow-elevated transition-transform duration-300 ease-in-out lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {[...mainNavItems, ...secondaryNavItems].map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                      ${active
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    `}
                    aria-current={active ? 'page' : undefined}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <Icon className={`h-5 w-5 ${active && 'color' in item ? (item as any).color : ''}`} />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-sm shadow-soft lg:hidden"
        aria-label="Bottom navigation"
      >
        <ul className="flex h-16 items-center justify-around">
          {mainNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-medium transition-all duration-200
                    ${active
                      ? `${item.color} scale-110`
                      : 'text-muted-foreground hover:text-foreground'
                    }
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only md:not-sr-only">{item.name}</span>
                </Link>
              </li>
            )
          })}
          {/* More button for remaining items */}
          <li>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
              aria-label="More navigation options"
            >
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only md:not-sr-only">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64">
        {/* Padding for mobile header and bottom nav */}
        <div className="pt-14 pb-16 lg:pt-0 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  )
}
