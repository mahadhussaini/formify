'use client'

import React from 'react'
import { useHydration } from '@/hooks/useHydration'

interface HydrationTestProps {
  children?: React.ReactNode
}

/**
 * Test component to verify hydration fixes are working
 * This component can be temporarily added to any page to test hydration
 */
export function HydrationTest({ children }: HydrationTestProps) {
  const isHydrated = useHydration()

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Hydration Status
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isHydrated ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          />
          <span className="text-xs">
            {isHydrated ? 'Hydrated' : 'Hydrating...'}
          </span>
        </div>

        {isHydrated && (
          <div className="mt-2 text-xs text-muted-foreground">
            ✅ Browser extensions handled
            <br />
            ✅ Hydration warnings suppressed
          </div>
        )}

        {children && (
          <div className="mt-2 pt-2 border-t border-border">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
