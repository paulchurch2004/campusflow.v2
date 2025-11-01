'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

interface UseRealtimeUpdatesOptions {
  enabled?: boolean
  interval?: number
  endpoint: string
}

interface UseRealtimeUpdatesReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook for polling updates from a server endpoint
 * Automatically handles visibility state to avoid polling when the page is not visible
 * Shows toast notifications when new data is available
 *
 * @param options - Configuration for polling behavior
 *   - enabled: Whether polling is active (default: true)
 *   - interval: Polling interval in milliseconds (default: 60000ms)
 *   - endpoint: The API endpoint to poll
 * @returns Object containing data, loading state, error, and refetch function
 *
 * @example
 * const { data, isLoading, error, refetch } = useRealtimeUpdates({
 *   endpoint: '/api/updates/check',
 *   interval: 30000,
 *   enabled: true,
 * })
 */
export function useRealtimeUpdates<T>(
  options: UseRealtimeUpdatesOptions
): UseRealtimeUpdatesReturn<T> {
  const {
    enabled = true,
    interval = 60000,
    endpoint,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastDataRef, setLastDataRef] = useState<T | null>(null)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)

  const fetchData = useCallback(async () => {
    // Prevent concurrent requests
    if (isPollingRef.current) {
      return
    }

    try {
      isPollingRef.current = true
      setIsLoading(true)
      setError(null)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch updates: ${response.statusText}`)
      }

      const fetchedData: T = await response.json()

      // Check if data has changed
      if (JSON.stringify(fetchedData) !== JSON.stringify(lastDataRef)) {
        setData(fetchedData)
        setLastDataRef(fetchedData)

        // Show toast notification when new data is available
        toast.success('Updates available', {
          description: 'New data has been loaded',
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch updates')
      setError(error)
      console.error('useRealtimeUpdates error:', error)

      // Show error toast
      toast.error('Error fetching updates', {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
      isPollingRef.current = false
    }
  }, [endpoint, lastDataRef])

  const startPolling = useCallback(() => {
    if (!enabled || interval <= 0) {
      return
    }

    // Initial fetch immediately
    fetchData()

    // Set up interval for subsequent fetches
    intervalIdRef.current = setInterval(() => {
      // Check if page is visible before polling
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }, interval)
  }, [enabled, interval, fetchData])

  const stopPolling = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, startPolling, stopPolling])

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopPolling()
      } else if (document.visibilityState === 'visible' && enabled) {
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, startPolling, stopPolling])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
