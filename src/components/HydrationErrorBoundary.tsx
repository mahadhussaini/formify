'use client'

import React from 'react'

interface HydrationErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

interface HydrationErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const DefaultFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md mx-auto p-6 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-4">
        {error?.message || 'An unexpected error occurred while loading the application.'}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
)

export class HydrationErrorBoundary extends React.Component<
  HydrationErrorBoundaryProps,
  HydrationErrorBoundaryState
> {
  constructor(props: HydrationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    // Check if this is a hydration-related error
    const isHydrationError =
      error.message.includes('hydration') ||
      error.message.includes('server') ||
      error.message.includes('client') ||
      error.message.includes('mismatch') ||
      error.message.includes('data-new-gr-c-s-check-loaded') ||
      error.message.includes('data-gr-ext-installed')

    if (isHydrationError) {
      // For hydration errors, we can often recover by forcing a re-render
      console.warn('Hydration error detected, attempting recovery:', error)
      return { hasError: true, error }
    }

    // For other errors, let them bubble up
    throw error
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Hydration error caught:', error, errorInfo)

    // If it's a hydration error, we can try to recover
    if (
      error.message.includes('hydration') ||
      error.message.includes('server') ||
      error.message.includes('client') ||
      error.message.includes('mismatch')
    ) {
      // Schedule a recovery attempt
      setTimeout(() => {
        this.setState({ hasError: false, error: null })
      }, 100)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultFallback
      return <Fallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}
