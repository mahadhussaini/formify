'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary specifically for @dnd-kit related errors
 * Catches hydration mismatches and other @dnd-kit errors
 */
export class DndErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a @dnd-kit related error
    const isDndError =
      error.message.includes('aria-describedby') ||
      error.message.includes('DndDescribedBy') ||
      error.message.includes('@dnd-kit') ||
      error.message.includes('hydration')

    if (isDndError) {
      console.warn('DndErrorBoundary caught @dnd-kit error:', error)
      return { hasError: true, error }
    }

    // Re-throw non-dnd-kit errors
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DndErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center border border-dashed border-muted-foreground/50 rounded-lg">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Drag & Drop Interface Error
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            There was an issue loading the drag-and-drop interface. This is usually temporary.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
