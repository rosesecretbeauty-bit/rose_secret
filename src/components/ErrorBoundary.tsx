import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    // Log to analytics/monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. The error has been logged and
              we'll look into it.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>}
              </div>}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                <Home className="mr-2 h-4 w-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>;
    }
    return this.props.children;
  }
}