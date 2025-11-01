'use client'

import { useState } from 'react'
import { Bell, Check, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications()
  const [open, setOpen] = useState(false)

  const recentNotifications = notifications.slice(0, 5)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
              className="text-xs h-7"
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {recentNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucune notification
          </div>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.read ? 'bg-accent/50' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.link) {
                    setOpen(false)
                  }
                }}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-lg mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}

            {notifications.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/notifications"
                    className="text-center text-sm text-primary cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    Voir toutes les notifications
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
