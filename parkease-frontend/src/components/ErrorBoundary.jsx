import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  // ✅ Reset error state when location changes (allows recovery without page refresh)
  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something Went Wrong</h1>
            <p className="text-slate-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
              >
                ← Go to Dashboard
              </button>
            </div>
            
            {/* Debug info (can remove in production) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 overflow-auto max-h-40">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
