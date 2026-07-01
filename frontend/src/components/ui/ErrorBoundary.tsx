// ─── SENTINEL ErrorBoundary ───────────────────────────────────────────────────
// Catches JavaScript errors anywhere in the component tree.
// Without this, a single error crashes the entire app and shows a blank page.
// With this, the broken section shows a friendly error card instead.
//
// Why a class component?
//   React's componentDidCatch lifecycle is only available in class components.
//   Functional ErrorBoundaries are not yet supported by React.
//
// Usage:
//   <ErrorBoundary>
//     <AdminDashboard />
//   </ErrorBoundary>

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode; // Custom fallback UI (optional)
}

interface State {
  hasError:    boolean;
  error:       Error | null;
  errorInfo:   ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Called when a descendant throws — updates state to show fallback
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  // Called after render with error details — log to monitoring service
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Phase 9: Send to Sentry or similar error tracking service
    console.error('[SENTINEL ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[300px] p-8 animate-fade-in">
          <div className="card border-danger/20 bg-danger/5 p-8 max-w-lg w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Something Went Wrong</h3>
            <p className="text-sm text-slate-400 mb-1">
              An unexpected error occurred in this section of SENTINEL.
            </p>
            <p className="text-xs text-slate-600 font-mono mb-6 px-4 py-2 bg-white/5 rounded-lg">
              {this.state.error?.message ?? 'Unknown error'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleReset} className="btn-primary gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={() => window.location.reload()} className="btn-ghost">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
