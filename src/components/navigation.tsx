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
    <svg className={className} width="24" height="24" viewBox="0 0 399.947 399.947" fill="currentColor">
      <path d="M365.226,34.693C342.854,12.321,313.108,0,281.468,0s-61.386,12.321-83.759,34.693L34.665,197.737
        c-46.184,46.186-46.184,121.332,0.001,167.518c22.373,22.373,52.119,34.692,83.758,34.692c31.639,0,61.386-12.319,83.759-34.692
        l163.044-163.044c22.373-22.374,34.694-52.12,34.694-83.759C399.92,86.811,387.599,57.066,365.226,34.693 M191.125,354.197
        c-19.419,19.421-45.239,30.115-72.702,30.115c-27.463,0-53.284-10.694-72.703-30.115c-40.088-40.088-40.088-105.315,0-145.405
        l81.522-81.521c0,0,84.958-84.262,86.215-85.234c1.271-0.953,2.592-1.841,3.879-2.759c5.226-3.572,10.659-6.743,16.269-9.34
        c11.204-5.233,23.011-8.215,34.29-9.053c5.647-0.362,11.15-0.256,16.408,0.298c1.311,0.17,2.608,0.339,3.896,0.506
        c1.281,0.198,2.541,0.455,3.791,0.678c1.251,0.208,2.474,0.502,3.682,0.798c1.204,0.304,2.411,0.54,3.569,0.916
        c1.161,0.353,2.311,0.702,3.447,1.047c1.135,0.339,2.224,0.783,3.315,1.162c2.19,0.744,4.251,1.671,6.264,2.531
        c1.011,0.425,1.965,0.943,2.925,1.4c0.949,0.481,1.906,0.908,2.81,1.414c0.902,0.501,1.791,0.994,2.667,1.479
        c0.436,0.245,0.867,0.488,1.296,0.729c0.417,0.261,0.833,0.521,1.242,0.778c6.596,4.059,11.907,8.118,16.125,11.597
        c5.406,4.459,8.096,6.934,10,9.125c0.953,1.097,2.596,3.101,2.083,3.625c-0.43,0.44-2.131-0.802-4.427-2.563
        c-2.273-1.768-5.523-4.245-9.982-7.139c-4.515-2.813-10.118-5.986-16.807-8.849c-6.666-2.896-14.476-5.357-23.101-6.779
        c-4.32-0.642-8.824-1.161-13.49-1.151c-4.659-0.008-9.453,0.284-14.307,1.044c-9.7,1.536-19.602,4.814-29.036,9.834
        c-4.693,2.555-9.305,5.463-13.732,8.768c-1.089,0.85-81.806,79.059-86.154,83.503c-1.547,1.581-1.463,3.415,0.412,5.29
        c30.383,30.383,115.171,115.08,129.719,129.613c1.39,1.388,1.706,2.559,0.271,4.002
        C245.332,300.136,191.125,354.197,191.125,354.197z"/>
    </svg>
  )
}

function PushupsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Left weight plates (3 progressive sizes) */}
      <rect x="1.5" y="9" width="2" height="6" rx="0.5"/>
      <rect x="3.5" y="8.5" width="2" height="7" rx="0.5"/>
      <rect x="5.5" y="8" width="2" height="8" rx="0.5"/>
      {/* Bar/handle */}
      <line x1="7.5" y1="12" x2="16.5" y2="12"/>
      {/* Right weight plates (3 progressive sizes) */}
      <rect x="16.5" y="8" width="2" height="8" rx="0.5"/>
      <rect x="18.5" y="8.5" width="2" height="7" rx="0.5"/>
      <rect x="20.5" y="9" width="2" height="6" rx="0.5"/>
    </svg>
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
    <svg className={className} width="24" height="24" viewBox="0 0 368.35 368.35" fill="currentColor">
      <path d="M157.893,254.026C132.3,205.062,123.857,127.84,121.9,105.743l19.345-5.224c21.002-4.483,28.112-14.769,30.372-22.626c4.369-15.194-5.9-31.978-16.022-41.732c-6.639-6.4,3.341-20.568,3.43-20.69c2.366-3.214,1.801-7.717-1.285-10.247c-14.434-11.834-32.457-1.123-41.964,8.079c0,0-49.919,13.48-53.76,16.295c-3.171,2.323-8.099,7.664-5.487,17.336l81.882,303.201c2.896,10.725,12.671,18.215,23.771,18.215c2.165,0,4.329-0.288,6.433-0.855c12.793-3.455,19.136-15.526,17.599-29.244C185.997,332.373,183.59,303.194,157.893,254.026z M119.232,90.928l-15.688-58.785l10.843-2.928l15.862,58.737L119.232,90.928z M145.185,46.961c7.672,7.395,14.264,18.971,12.016,26.787c-1.463,5.087-6.768,8.276-12.475,10.274l-16.621-61.546c3.292-2.757,8.782-6.707,13.829-7.306C137.522,24.875,135.558,37.681,145.185,46.961z M162.182,353.35c-4.337,0.046-8.157-2.93-9.29-7.125c0,0-82.098-304.262-82.103-304.472c1.257-1.104,18.274-5.698,18.274-5.698l17.427,65.303c0.687,9.946,7.75,101.535,38.108,159.616c26.29,50.301,26.635,77.97,26.636,78.204C171.229,339.861,171.731,353.249,162.182,353.35z"/>
      <path d="M303.504,133.453C301.841,91.9,289.48,75.801,283.52,70.406L277.889,17.7c-0.408-3.812-3.624-6.703-7.458-6.703h-32.328c-3.834,0-7.05,2.892-7.458,6.703l-5.632,52.705c-5.961,5.396-18.321,21.496-19.983,63.048c-1.57,39.275-9.055,217.19-9.055,217.19c0,6.846,5.449,7.816,7.493,7.816h101.597c2.044,0,7.493-1.495,7.493-7.816C312.558,348.962,305.45,182.134,303.504,133.453z M244.844,25.997h18.846l4.397,41.15h-27.641L244.844,25.997z M234.444,82.148h39.647c3.456,3.563,13.01,16.521,14.425,51.905c1.428,35.704,5.592,134.911,7.74,185.977h-83.978c1.85-43.954,6.257-148.903,7.74-185.977C221.433,98.668,230.988,85.71,234.444,82.148z M246.147,335.03v8.431h-11.566l0.569-8.431H246.147z M261.147,335.03h12.236l0.569,8.431h-12.806V335.03z M211.646,335.03h8.469l-0.569,8.431h-8.255L211.646,335.03z M288.987,343.46l-0.568-8.431h8.469c0.136,3.243,0.256,6.085,0.355,8.431H288.987z"/>
      <path d="M254.267,265.452c19.271,0,29.353-31.54,29.353-62.695c0-31.155-10.082-62.695-29.353-62.695s-29.353,31.54-29.353,62.695C224.915,233.912,234.997,265.452,254.267,265.452z M254.267,155.062c4.165,0,14.353,16.714,14.353,47.695c0,30.981-10.188,47.695-14.353,47.695c-4.165,0-14.353-16.714-14.353-47.695C239.915,171.776,250.102,155.062,254.267,155.062z"/>
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
              <div className="bg-muted rounded-lg">
                <ThemeToggle />
              </div>
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
