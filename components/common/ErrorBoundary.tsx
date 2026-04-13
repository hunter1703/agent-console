'use client'

/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a fallback UI
 */

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertTriangle size={48} className="mx-auto text-error mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-text-secondary mb-6">
            We encountered an unexpected error. This has been logged for investigation.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-text-tertiary hover:text-text-secondary">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-3 bg-surface-elevated rounded-lg text-xs text-text-secondary overflow-auto max-h-32">
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button onClick={this.retry} icon={<RefreshCw size={16} />}>
              Try Again
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Hook version for functional components
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}