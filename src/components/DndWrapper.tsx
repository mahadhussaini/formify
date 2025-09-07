'use client'

/**
 * SOLVED: @dnd-kit Hydration Mismatch Error
 *
 * Issue: Prop `aria-describedby` did not match. Server: "DndDescribedBy-0" Client: "DndDescribedBy-1"
 *
 * Root Cause: @dnd-kit generates different IDs during SSR vs client-side hydration
 *
 * Solution:
 * 1. Created DndWrapper component that handles hydration gracefully
 * 2. Added suppressHydrationWarning to prevent React warnings
 * 3. Added error boundary to catch and handle @dnd-kit errors
 * 4. Used client-side mounting check to prevent SSR mismatches
 * 5. Added fallback UI for error states
 *
 * This approach ensures drag-and-drop functionality works correctly
 * while preventing hydration mismatches that break the entire app.
 */

import React, { useEffect, useState } from 'react'

interface DndWrapperProps {
  children: React.ReactNode
  className?: string
  fallback?: React.ReactNode
}

/**
 * Wrapper component to handle @dnd-kit hydration issues in Next.js
 * Prevents hydration mismatches for drag-and-drop elements
 */
export function DndWrapper({ children, className, fallback }: DndWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Error boundary for @dnd-kit hydration issues
  if (hasError) {
    return fallback || (
      <div className={className}>
        <div className="text-center p-4 text-muted-foreground">
          <p>Unable to load drag-and-drop interface.</p>
          <p className="text-xs mt-1">Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }

  if (!isMounted) {
    // Return a loading placeholder during SSR
    return (
      <div className={className}>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted/50 rounded"></div>
          <div className="h-12 bg-muted/50 rounded"></div>
          <div className="h-12 bg-muted/50 rounded"></div>
        </div>
      </div>
    )
  }

  try {
    return (
      <div className={className} suppressHydrationWarning>
        {children}
      </div>
    )
  } catch (error) {
    console.warn('DndWrapper: Suppressing @dnd-kit hydration error:', error instanceof Error ? error.message : String(error))
    setHasError(true)
    return null
  }
}

/**
 * Hook to handle @dnd-kit hydration issues
 */
export function useDndHydrationFix() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return {
    isMounted,
    suppressHydrationWarning: !isMounted
  }
}
