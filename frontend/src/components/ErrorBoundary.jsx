import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '500px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
                        <h1 style={{ color: '#e53e3e', marginBottom: '16px' }}>
                            ⚠️ Something went wrong
                        </h1>
                        <p style={{ color: '#4a5568', marginBottom: '24px' }}>
                            The application encountered an error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#8A75BA',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginRight: '12px'
                            }}
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            style={{
                                background: 'transparent',
                                color: '#8A75BA',
                                border: '2px solid #8A75BA',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear & Login
                        </button>
                        {/* Always show error details for debugging */}
                        {this.state.error && (
                            <details style={{ marginTop: '24px', textAlign: 'left' }} open>
                                <summary style={{ cursor: 'pointer', color: '#718096' }}>
                                    Error Details (click to expand)
                                </summary>
                                <pre style={{
                                    background: '#f7fafc',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    color: '#e53e3e',
                                    marginTop: '12px',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
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
