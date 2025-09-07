'use client'

import React from 'react'
import { useHydration } from '@/hooks/useHydration'
import { HydrationErrorBoundary } from './HydrationErrorBoundary'

interface HydrationFixProps {
  children: React.ReactNode
}

export function HydrationFix({ children }: HydrationFixProps) {
  const isHydrated = useHydration()

  // During hydration, render a minimal version to prevent mismatches
  if (!isHydrated) {
    return (
      <div
        suppressHydrationWarning
        style={{
          visibility: 'hidden',
          opacity: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}
      >
        <HydrationErrorBoundary>
          {children}
        </HydrationErrorBoundary>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      <HydrationErrorBoundary>
        {children}
      </HydrationErrorBoundary>
    </div>
  )
}
