import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorDisplay } from '../ErrorDisplay';

type HasChildren = {
  children: ReactNode;
};

type ErrorBoundaryProps = HasChildren & {
  className?: string;
  fallbackContent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallbackContent ?? (
          <ErrorDisplay
            error={this.state.error}
            className={this.props.className}
          />
        )
      );
    }

    return this.props.children;
  }
}
