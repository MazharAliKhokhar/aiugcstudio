'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-red-500/5 border border-red-500/10 rounded-[32px] my-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Something went wrong</h3>
            <p className="text-white/50 max-w-sm mx-auto font-medium">
              An unexpected error occurred while processing your request. Our team has been notified.
            </p>
          </div>
          <Button 
            onClick={this.handleReset}
            variant="outline"
            className="rounded-xl border-white/10 text-white hover:bg-white/5 font-bold"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
