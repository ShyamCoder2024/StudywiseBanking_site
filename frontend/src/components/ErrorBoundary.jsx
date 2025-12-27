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
                            <div className="error-icon">🛠️</div>
                            <h1>Under Maintenance</h1>
                            <p>We're fixing things. Please try again shortly! 🙏</p>
                            <div className="error-actions">
                                <button onClick={() => window.location.reload()} className="btn-primary">
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div className="error-boundary-container">
                    <div className="error-content">
                        <div className="error-icon">😊</div>
                        <h1>Under Maintenance</h1>
                        <p>We're making improvements. Please refresh after a moment!</p>

                        <div className="error-actions">
                            <button onClick={this.handleReset} className="btn-primary">
                                Refresh
                            </button>
                            <button onClick={this.handleGoHome} className="btn-secondary">
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
