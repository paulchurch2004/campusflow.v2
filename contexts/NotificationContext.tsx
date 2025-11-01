'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  link?: string
  icon?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })))
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep max 50 notifications

    // Show toast notification
    const toastFn = notification.type === 'error' ? toast.error :
                    notification.type === 'success' ? toast.success :
                    notification.type === 'warning' ? toast.warning :
                    toast.info

    toastFn(notification.title, {
      description: notification.message,
    })

    // Play notification sound if enabled
    const settings = localStorage.getItem('notificationSettings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        if (parsed.inAppSound) {
          // You can add audio playback here
          // const audio = new Audio('/notification-sound.mp3')
          // audio.play().catch(() => {})
        }
      } catch (error) {
        console.error('Failed to parse notification settings:', error)
      }
    }
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    localStorage.removeItem('notifications')
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
