import React, { Component, ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Error fallback component that can use hooks
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950" data-testid="error-boundary">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-lg p-6 text-center border border-gray-200 dark:border-slate-700">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
          {t('errors.boundary.title', 'Something went wrong')}
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('errors.boundary.unexpectedError', 'An unexpected error occurred. You can try again or return to the dashboard.')}
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            data-testid="error-retry-button"
          >
            {t('errors.boundary.tryAgain', 'Try Again')}
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            data-testid="error-dashboard-button"
          >
            {t('errors.boundary.goToDashboard', 'Go to Dashboard')}
          </button>
        </div>
        {error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-slate-400">
              {t('errors.boundary.errorDetails', 'Error Details')}
            </summary>
            <pre className="mt-2 text-xs text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 p-2 rounded overflow-auto">
              {error.message}
              {error.stack && (
                <div className="mt-2 text-gray-500 dark:text-slate-500">
                  {error.stack}
                </div>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 