import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('🚨 Error Boundary Caught:', error, errorInfo);

        // Update state with error details
        this.setState(prevState => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1
        }));

        // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
        // this.sendToErrorTracking(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Reload the page to reset app state
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const { error, errorCount } = this.state;

            // If error keeps happening (> 3 times), show critical error
            if (errorCount > 3) {
                return (
                    <div className="error-boundary-critical">
                        <div className="error-content">
                            <div className="error-icon">⚠️</div>
                            <h1>Critical Error</h1>
                            <p>The application encountered multiple errors. Please contact support.</p>
                            <div className="error-actions">
                                <button onClick={() => window.location.href = '/'} className="btn-primary">
                                    Go to Homepage
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="error-boundary-container">
                    <div className="error-content">
                        <div className="error-icon">😕</div>
                        <h1>Oops! Something went wrong</h1>
                        <p>We're sorry for the inconvenience. The application encountered an unexpected error.</p>

                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <pre>{error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}

                        <div className="error-actions">
                            <button onClick={this.handleReset} className="btn-primary">
                                Try Again
                            </button>
                            <button onClick={this.handleGoHome} className="btn-secondary">
                                Go to Homepage
                            </button>
                        </div>

                        <p className="error-support">
                            If this problem persists, please contact support with error code: <code>{Date.now()}</code>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
