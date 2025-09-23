import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { log } from '@/src/lib/log';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

/**
 * Enhanced Error Boundary with proper logging, recovery options, and accessibility
 * Follows React Error Boundary best practices with security considerations
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.logError(error, errorInfo);
    
    this.setState({
      errorInfo,
      eventId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && !prevState.hasError) {
      // Check if we should reset based on prop changes
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
        return;
      }

      // Check if reset keys have changed
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  logError = (error: Error, errorInfo: ErrorInfo): string => {
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log structured error information (sanitized for security)
    log.error('error_boundary_catch', {
      eventId,
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      componentStack: process.env.NODE_ENV === 'development' ? errorInfo.componentStack : undefined,
      level: this.props.level || 'component',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    });

    return eventId;
  };

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleReportBug = () => {
    const { error, eventId } = this.state;
    const subject = encodeURIComponent(`Bug Report - ${error?.name || 'Error'}`);
    const body = encodeURIComponent(
      `Error ID: ${eventId}\n` +
      `Error: ${error?.message || 'Unknown error'}\n` +
      `Page: ${window.location.href}\n` +
      `Time: ${new Date().toISOString()}\n\n` +
      `Please describe what you were doing when this error occurred:`
    );
    
    window.open(`mailto:support@intelli-verse-x.ai?subject=${subject}&body=${body}`);
  };

  renderError = () => {
    const { error, eventId } = this.state;
    const { level = 'component' } = this.props;
    
    // Determine error severity and messaging
    const isRetryable = error?.message?.includes('timeout') || 
                       error?.message?.includes('network') ||
                       error?.message?.includes('fetch') ||
                       level === 'component';

    const isCritical = level === 'critical' || level === 'page';
    
    return (
      <div 
        className={`flex items-center justify-center p-6 ${
          isCritical ? 'min-h-screen bg-gray-50' : 'min-h-64 bg-gray-25 rounded-lg border'
        }`}
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isCritical ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <AlertTriangle 
                className={`w-8 h-8 ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}
                aria-hidden="true"
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isCritical ? 'Something went wrong' : 'Error in component'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isRetryable 
                ? "We're having trouble loading this content. Please try again."
                : "An unexpected error occurred. Our team has been notified."
              }
            </p>
            {eventId && (
              <p className="text-sm text-gray-500">
                Error ID: <code className="bg-gray-100 px-1 rounded">{eventId}</code>
              </p>
            )}
          </div>

          <div className="space-y-3">
            {isRetryable && (
              <Button
                onClick={this.handleRetry}
                className="w-full"
                accessibleLabel="Retry loading this content"
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                Try Again
              </Button>
            )}
            
            {isCritical && (
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
                accessibleLabel="Return to home page"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                Return to Home
              </Button>
            )}
            
            <Button
              onClick={this.handleReportBug}
              variant="ghost"
              className="w-full"
              accessibleLabel="Report this error to support"
            >
              <Bug className="w-4 h-4 mr-2" aria-hidden="true" />
              Report Issue
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-sm">
                Development Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto max-h-40 text-red-600">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderError();
    }

    return this.props.children;
  }
}

/**
 * Hook for easy error boundary integration
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // This would integrate with your error reporting service
    log.error('manual_error_report', {
      message: error.message,
      stack: error.stack,
      ...errorInfo,
    });
  };
}

/**
 * Higher-order component for adding error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Specialized error boundaries for different use cases
 */
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; name?: string }> = ({ 
  children, 
  name 
}) => (
  <ErrorBoundary 
    level="component"
    onError={(error) => {
      log.error('component_error', {
        componentName: name,
        message: error.message,
      });
    }}
  >
    {children}
  </ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">
    {children}
  </ErrorBoundary>
);