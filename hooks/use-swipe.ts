'use client'

import { useState, useCallback, useRef } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: UseSwipeOptions): SwipeHandlers {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchEnd(null)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.targetTouches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || !touchEnd) return

      const deltaX = touchEnd.x - touchStart.x
      const deltaY = touchEnd.y - touchStart.y
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (absDeltaX > threshold && absDeltaY < threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      } else if (absDeltaY > threshold && absDeltaX < threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp()
        }
      }

      setTouchStart(null)
      setTouchEnd(null)
    },
    [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  )

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
