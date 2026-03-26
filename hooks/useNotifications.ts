// =====================================================
// PMA Hooks - useNotifications polling
// =====================================================

import { useState, useEffect, useCallback } from "react"

interface UseNotificationsOptions {
  /** Polling interval in milliseconds (default: 30000 = 30s) */
  interval?: number
  /** Function to fetch unread count */
  fetchFn?: () => Promise<number>
  /** Initial count to avoid initial flash */
  initialCount?: number
}

interface UseNotificationsReturn {
  unreadCount: number
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Polling hook for notification count
 * Polls every 30 seconds as per PRD NOTIF-08/09/10
 *
 * Note: This hook is designed to work with a fetch function passed from the caller.
 * If no fetchFn is provided, it still sets up the polling mechanism but won't
 * actually fetch data until a fetchFn is provided.
 */
export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { interval = 30000, fetchFn, initialCount = 0 } = options

  const [unreadCount, setUnreadCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!fetchFn) return

    try {
      const count = await fetchFn()
      setUnreadCount(count)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch notifications")
      )
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  // Initial fetch on mount
  useEffect(() => {
    setIsLoading(true)
    fetchData()
  }, [fetchData])

  // Set up polling - call fetchData in setInterval callback
  useEffect(() => {
    if (!fetchFn) return

    const pollFn = () => fetchData()
    const intervalId = setInterval(pollFn, interval)

    return () => clearInterval(intervalId)
  }, [fetchFn, interval, fetchData])

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchData()
  }, [fetchData])

  return {
    unreadCount,
    isLoading,
    error,
    refresh,
  }
}
