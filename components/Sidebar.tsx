'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  Calendar,
  List,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { BottomSheet } from './ui/bottom-sheet'

const navItems = [
  { label: 'Calendar', icon: Calendar, href: '/calendar' },
  { label: 'Events', icon: List, href: '/events' },
  { label: 'Extract', icon: Sparkles, href: '/events/input' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const { isAuthenticated, username, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!isAuthenticated) return null

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/')

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const handleLogout = () => {
    setMobileOpen(false)
    logout()
  }

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
