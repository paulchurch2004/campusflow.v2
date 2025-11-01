'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  Calendar,
  Handshake,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Sparkles,
  FileText,
  Package,
  Trophy,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { SearchTrigger, SearchDialog } from '@/components/search-dialog'
import { NotificationCenter } from '@/components/notification-center'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: string
  listId: string | null
}

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  color?: string
  group?: string
}

const navLinks: NavLink[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: LayoutDashboard,
    color: 'text-blue-500',
    group: 'general',
  },
  {
    href: '/dashboard/treasury',
    label: 'Trésorerie',
    icon: Wallet,
    color: 'text-emerald-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/events',
    label: 'Événements',
    icon: Calendar,
    badge: 3,
    color: 'text-purple-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendrier',
    icon: Calendar,
    color: 'text-indigo-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/partners',
    label: 'Partenaires',
    icon: Handshake,
    color: 'text-amber-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/sponsors',
    label: 'Sponsors',
    icon: Trophy,
    color: 'text-yellow-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/documents',
    label: 'Documents',
    icon: FileText,
    color: 'text-cyan-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/inventory',
    label: 'Inventaire',
    icon: Package,
    color: 'text-orange-500',
    group: 'gestion',
  },
  {
    href: '/dashboard/teams',
    label: 'Équipe',
    icon: Users,
    color: 'text-pink-500',
    group: 'administration',
  },
  {
    href: '/dashboard/settings',
    label: 'Paramètres',
    icon: Settings,
    color: 'text-slate-500',
    group: 'administration',
  },
]

const navGroups = {
  general: 'Général',
  gestion: 'Gestion',
  administration: 'Administration',
}

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      president: 'bg-gradient-to-r from-purple-500 to-pink-500',
      vice_president: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      treasurer: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      secretary: 'bg-gradient-to-r from-amber-500 to-orange-500',
      member: 'bg-gradient-to-r from-slate-400 to-slate-500',
    }
    return roleColors[role] || 'bg-gradient-to-r from-slate-400 to-slate-500'
  }

  const formatRole = (role: string) => {
    const roleNames: Record<string, string> = {
      president: 'Président',
      vice_president: 'Vice-Président',
      treasurer: 'Trésorier',
      secretary: 'Secrétaire',
      member: 'Membre',
    }
    return roleNames[role] || role
  }

  const groupedLinks = navLinks.reduce((acc, link) => {
    const group = link.group || 'general'
    if (!acc[group]) acc[group] = []
    acc[group].push(link)
    return acc
  }, {} as Record<string, NavLink[]>)

  const sidebarContent = (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo & Branding */}
      <div className="relative overflow-hidden border-b border-border/40 px-6 py-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              CampusFlow
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground">
              Gestion BDE
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-b border-border/40 px-4 py-4">
        <div className="group relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 p-4 backdrop-blur-sm transition-all hover:border-border/60 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-11 w-11 border-2 border-background shadow-lg ring-2 ring-border/20">
                <AvatarImage src="" alt={user?.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-sm font-semibold text-white">
                  {user ? getInitials(user.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                  <div className="h-3 w-16 animate-pulse rounded-md bg-muted"></div>
                </div>
              ) : user ? (
                <>
                  <p className="truncate text-sm font-semibold leading-none text-foreground">
                    {user.name}
                  </p>
                  <div className="mt-1.5 inline-flex">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm',
                      getRoleBadgeColor(user.role)
                    )}>
                      {formatRole(user.role)}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Notifications */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchTrigger />
          </div>
          <NotificationCenter />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/40">
        {Object.entries(groupedLinks).map(([groupKey, links]) => (
          <div key={groupKey}>
            <div className="mb-2 px-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {navGroups[groupKey as keyof typeof navGroups]}
              </h3>
            </div>
            <div className="space-y-0.5">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = isActiveRoute(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      {/* Active indicator bar */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute -left-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            exit={{ opacity: 0, scaleY: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      <div
                        className={cn(
                          'group relative flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-foreground shadow-sm backdrop-blur-sm'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:shadow-sm'
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5 shrink-0 transition-all duration-200',
                          isActive ? link.color : 'text-muted-foreground group-hover:' + link.color
                        )} />
                        <span className="flex-1">{link.label}</span>

                        {/* Notification badge */}
                        {link.badge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-purple-500/30"
                          >
                            {link.badge}
                          </motion.span>
                        )}

                        {/* Hover arrow */}
                        <ChevronRight className={cn(
                          'h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100',
                          isActive && 'opacity-50'
                        )} />
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="sticky bottom-0 mt-auto border-t border-border/40 bg-background/95 p-4 backdrop-blur-sm">
        <div className="space-y-3">
          {/* Theme Toggle and Version info */}
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
              <span className="font-medium">Version 1.0.0</span>
              <span className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              </span>
            </div>
            <ThemeToggle />
          </div>

          {/* Logout button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="group relative w-full justify-start overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r from-background to-muted/20 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-red-500/50 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-red-600 hover:shadow-md hover:shadow-red-500/10"
          >
            <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:rotate-12" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      {/* Global Search Dialog */}
      <SearchDialog />

      {/* Mobile Menu Button */}
      <motion.div
        className="fixed left-4 top-4 z-50 lg:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="relative overflow-hidden border-border/40 bg-background/95 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
        >
          <AnimatePresence mode="wait">
            {isMobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border/40 bg-background/95 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className="hidden h-screen w-72 border-r border-border/40 bg-background/95 backdrop-blur-xl lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
        <div className="relative h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
