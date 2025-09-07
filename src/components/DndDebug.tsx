'use client'

import React, { useEffect } from 'react'

/**
 * Debug component to monitor @dnd-kit hydration status
 * Can be temporarily added to verify the fix is working
 */
export function DndDebug() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('aria-describedby') ||
          event.message.includes('DndDescribedBy')) {
        console.warn('DndDebug: @dnd-kit hydration error detected and suppressed:', event.message)
        event.preventDefault()
      }
    }

    const handleWarning = (event: any) => {
      if (event.message && (
          event.message.includes('aria-describedby') ||
          event.message.includes('DndDescribedBy')
        )) {
        console.warn('DndDebug: @dnd-kit warning detected:', event.message)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleWarning)

    console.log('DndDebug: Monitoring for @dnd-kit hydration issues...')

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleWarning)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-muted p-2 rounded text-xs text-muted-foreground z-50">
      DndDebug: Active
    </div>
  )
}
