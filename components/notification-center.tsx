'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle,
  Wallet,
  Calendar,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface User {
  id: string
  name: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'expense':
      return Wallet
    case 'event':
      return Calendar
    case 'comment':
      return MessageSquare
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertCircle
    default:
      return Info
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'expense':
      return 'text-emerald-500'
    case 'event':
      return 'text-purple-500'
    case 'comment':
      return 'text-blue-500'
    case 'success':
      return 'text-green-500'
    case 'warning':
      return 'text-amber-500'
    default:
      return 'text-blue-500'
  }
}

const getNotificationLink = (notification: any) => {
  if (!notification.relatedType || !notification.relatedId) return null

  switch (notification.relatedType) {
    case 'expense':
      return `/dashboard/treasury?highlight=${notification.relatedId}`
    case 'event':
      return `/dashboard/events?highlight=${notification.relatedId}`
    default:
      return null
  }
}

export function NotificationCenter() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [playSound, setPlaySound] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id)

  useEffect(() => {
    fetchUser()
  }, [])

  // Play sound on new notification (optional)
  useEffect(() => {
    if (playSound && unreadCount > 0) {
      // Optionally play a notification sound
      // const audio = new Audio('/notification.mp3')
      // audio.play().catch(() => {})
    }
  }, [unreadCount, playSound])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/session')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    const link = getNotificationLink(notification)
    if (link) {
      setIsOpen(false)
      window.location.href = link
    }
  }

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notificationId)
  }

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(notificationId)
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1"
              >
                <Badge
                  variant="destructive"
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-pink-600 px-1 text-[10px] font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-8 text-xs"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs text-muted-foreground">
                Vous êtes à jour!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Unread Notifications */}
              {unreadNotifications.length > 0 && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20">
                  {unreadNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type)
                    const iconColor = getNotificationColor(notification.type)
                    const hasLink = getNotificationLink(notification)

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'group relative p-4 transition-colors',
                          hasLink && 'cursor-pointer hover:bg-muted/60'
                        )}
                      >
                        {/* Unread Indicator */}
                        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600"></div>

                        <div className="flex gap-3 pl-2">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background',
                              iconColor
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold leading-tight">
                                {notification.title}
                              </p>
                              {hasLink && (
                                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true, locale: fr }
                              )}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={(e) => handleDelete(notification.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Read Notifications */}
              {readNotifications.length > 0 && (
                <>
                  {unreadNotifications.length > 0 && (
                    <div className="bg-muted/30 px-4 py-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Lues
                      </p>
                    </div>
                  )}
                  {readNotifications.slice(0, 5).map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    const iconColor = getNotificationColor(notification.type)
                    const hasLink = getNotificationLink(notification)

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'group relative p-4 opacity-60 transition-all hover:opacity-100',
                          hasLink && 'cursor-pointer hover:bg-muted/40'
                        )}
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted',
                              iconColor
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">
                                {notification.title}
                              </p>
                              {hasLink && (
                                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true, locale: fr }
                              )}
                            </p>
                          </div>

                          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={(e) => handleDelete(notification.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full text-sm">
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
