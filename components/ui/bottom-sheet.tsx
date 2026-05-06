'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  snapPoints?: string[]
  defaultSnapPoint?: number
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = ['50%', '90%'],
  defaultSnapPoint = 0,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnapPoint)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, snap: 0 })
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    onClose()
    setCurrentSnap(defaultSnapPoint)
  }, [onClose, defaultSnapPoint])

  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(defaultSnapPoint)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, defaultSnapPoint])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart({
      y: e.touches[0].clientY,
      snap: currentSnap,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchEndY - dragStart.y

    if (deltaY > 100) {
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1)
      } else {
        handleClose()
      }
    } else if (deltaY < -50 && currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border',
          'transform transition-transform duration-200 ease-out'
        )}
        style={{ height: snapPoints[currentSnap] }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-2rem)] px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}
