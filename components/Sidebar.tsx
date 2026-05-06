'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useCalendar, ViewMode } from '@/lib/calendar-context'
import { Button } from '@/components/ui/button'
import {
  Menu,
  Calendar,
  List,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { BottomSheet } from './ui/bottom-sheet'

const navItems = [
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Events', icon: List, href: '/events' },
  { label: 'Extract', icon: Sparkles, href: '/events/input' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

function CalendarControls() {
  const router = useRouter()
  const { viewMode, setViewMode, navigateToday } = useCalendar()
  const [viewOpen, setViewOpen] = useState(false)

  const viewOptions: { mode: ViewMode; label: string }[] = [
    { mode: 'day', label: 'Day' },
    { mode: 'week', label: 'Week' },
    { mode: 'month', label: 'Month' },
  ]

  return (
    <div className="p-3 border-t border-border space-y-3">
      {/* View Switcher */}
      <div>
        <div className="relative">
          <button
            onClick={() => setViewOpen(!viewOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <span className="text-muted-foreground">View: <span className="text-foreground font-medium">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span></span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${viewOpen ? 'rotate-180' : ''}`} />
          </button>
          {viewOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {viewOptions.map(option => (
                <button
                  key={option.mode}
                  onClick={() => {
                    setViewMode(option.mode)
                    setViewOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    viewMode === option.mode
                      ? 'bg-muted font-medium'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Today Button */}
      <button
        onClick={navigateToday}
        className="w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
      >
        Today
      </button>

      {/* Add Event Button */}
      <Button
        size="sm"
        onClick={() => router.push('/events/new')}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Event
      </Button>
    </div>
  )
}

export default function Sidebar() {
  const { isAuthenticated, username, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { viewMode, setViewMode, navigateToday } = useCalendar()

  if (!isAuthenticated) return null

  // Find all nav items matching current path (exact or child route)
  const matchingItems = navItems.filter(item => 
    pathname === item.href || pathname?.startsWith(item.href + '/')
  );
  // Select the most specific match (longest href)
  const activeHref = matchingItems.length > 0 
    ? matchingItems.sort((a, b) => b.href.length - a.href.length)[0].href 
    : null;
  const isActive = (href: string) => href === activeHref;

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
  }

  // Check if we're on the calendar page
  const isCalendarPage = pathname === '/calendar'

  return (
    <>
      {/* Desktop Sidebar - fixed left */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col z-40">
        <div className="p-4 border-b border-border">
          <Link href="/calendar" className="text-lg font-semibold">
            Better Calendar
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Calendar Controls - only show on calendar page */}
        {isCalendarPage && <CalendarControls />}

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
              {username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {username}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/calendar" className="text-lg font-semibold">
          Better Calendar
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        snapPoints={['75%']}
      >
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Calendar Controls for mobile */}
        {isCalendarPage && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode)
                    setMobileOpen(false)
                  }}
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === mode
                      ? 'bg-muted font-medium'
                      : 'border border-border hover:bg-muted/50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                navigateToday()
                setMobileOpen(false)
              }}
              className="w-full py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Today
            </button>
            <Button
              size="sm"
              onClick={() => {
                router.push('/events/new')
                setMobileOpen(false)
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-medium">
              {username?.charAt(0).toUpperCase()}
            </div>
            <span className="text-foreground font-medium">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </BottomSheet>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-[52px]" />
    </>
  )
}
