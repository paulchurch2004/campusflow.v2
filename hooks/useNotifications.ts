import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  userId: string
  relatedId?: string
  relatedType?: string
  createdAt: string
}

const POLLING_INTERVAL = 300000 // 5 minutes (utilisé uniquement comme fallback, Socket.io gère le temps réel)

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
        setError(null)
      } else {
        // Ne pas lancer d'erreur, simplement logger
        console.log('Notifications API not available or returned error:', response.status)
        setNotifications([])
        setUnreadCount(0)
        setError(null)
      }
    } catch (err) {
      // Gérer l'erreur silencieusement si l'API n'existe pas encore
      console.log('Error fetching notifications (API may not be ready):', err)
      setNotifications([])
      setUnreadCount(0)
      setError(null)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId, read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const unreadIds = prev.filter((n) => !n.read).map((n) => n.id)

      // Mark all as read in background
      unreadIds.forEach(async (id) => {
        try {
          await fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, read: true }),
          })
        } catch (err) {
          console.error('Error marking notification as read:', err)
        }
      })

      return prev.map((n) => ({ ...n, read: true }))
    })
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      })

      if (response.ok) {
        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId)
          if (notification && !notification.read) {
            setUnreadCount((count) => Math.max(0, count - 1))
          }
          return prev.filter((n) => n.id !== notificationId)
        })
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }, [])

  const createNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification),
        })

        if (response.ok) {
          const newNotification = await response.json()
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
          return newNotification
        }
      } catch (err) {
        console.error('Error creating notification:', err)
      }
    },
    []
  )

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [userId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
  }
}
