import { useState, useEffect, useRef } from 'react'
import { addSeconds } from 'date-fns/addSeconds'
import { format } from 'date-fns/format'

interface UseCountdownTimerProps {
  initialTimeInSeconds: number
  onTimeUp?: () => void
}

export const useCountdownTimer = ({ initialTimeInSeconds, onTimeUp }: UseCountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeLeft(initialTimeInSeconds)
  }, [initialTimeInSeconds])

  const start = () => {
    setIsActive(true)
    setTimeLeft(initialTimeInSeconds)
  }

  const stop = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const reset = () => {
    setTimeLeft(initialTimeInSeconds)
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1

          if (newTime === 0 && onTimeUp) {
            onTimeUp()
          }

          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, onTimeUp])

  const formatTime = (seconds: number): string => {
    const absSeconds = Math.abs(seconds)
    const baseDate = new Date(0) // Start from epoch
    const timeDate = addSeconds(baseDate, absSeconds)
    const formattedTime = format(timeDate, 'm:ss')

    return seconds < 0 ? `-${formattedTime}` : formattedTime
  }

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isNegative: timeLeft < 0,
    start,
    stop,
    reset,
    isActive,
  }
}
