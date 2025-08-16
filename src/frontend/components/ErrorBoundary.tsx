import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button 
              className="error-button"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              padding: 2rem;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.2);
              border-radius: 12px;
              margin: 1rem 0;
            }

            .error-content {
              text-align: center;
              max-width: 500px;
            }

            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            .error-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 0.5rem;
            }

            .error-message {
              font-size: 1rem;
              color: #a1a1aa;
              margin-bottom: 1.5rem;
              line-height: 1.5;
            }

            .error-button {
              background: linear-gradient(135deg, #ef4444, #dc2626);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }

            .error-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            }

            .error-details {
              margin-top: 1.5rem;
              text-align: left;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 8px;
              padding: 1rem;
            }

            .error-details summary {
              color: #a1a1aa;
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              color: #71717a;
              font-size: 0.8rem;
              white-space: pre-wrap;
              overflow-x: auto;
              margin: 0;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}