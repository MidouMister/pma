// =====================================================
// PMA Hooks - useTimer
// =====================================================

import { useState, useEffect, useCallback, useRef } from "react"

interface UseTimerReturn {
  time: string
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
  seconds: number
}

/**
 * Live timer hook for time tracking
 * Returns time in HH:MM:SS format
 */
export function useTimer(initialSeconds = 0): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds to HH:MM:SS
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }, [])

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true)
    }
  }, [isRunning])

  // Stop the timer
  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  // Reset the timer
  const reset = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
  }, [])

  // Handle interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  return {
    time: formatTime(seconds),
    isRunning,
    start,
    stop,
    reset,
    seconds,
  }
}
