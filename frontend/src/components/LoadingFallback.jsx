import { useState, useEffect } from 'react';
import './LoadingFallback.css';

export function LoadingFallback({ timeout = 8000 }) {
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Show warning after 3 seconds (reduced from 5)
        const warningTimer = setTimeout(() => {
            setShowSlowWarning(true);
        }, 3000);

        // Show error after timeout
        const errorTimer = setTimeout(() => {
            setShowError(true);
        }, timeout);

        return () => {
            clearTimeout(warningTimer);
            clearTimeout(errorTimer);
        };
    }, [timeout]);

    if (showError) {
        return (
            <div className="loading-fallback error">
                <div className="loading-content">
                    <div className="error-icon">⚠️</div>
                    <h2>Loading is taking longer than expected</h2>
                    <p>This might be due to:</p>
                    <ul>
                        <li>Slow internet connection</li>
                        <li>Server maintenance</li>
                        <li>Application issue</li>
                    </ul>
                    <div className="error-actions">
                        <button onClick={() => window.location.reload()} className="btn-reload">
                            Reload Page
                        </button>
                        <button onClick={() => window.location.href = '/'} className="btn-home">
                            Go to Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-fallback">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>

                <h2>Loading...</h2>

                {showSlowWarning && (
                    <p className="slow-warning">
                        This is taking longer than usual. Please wait...
                    </p>
                )}

                <div className="loading-progress">
                    <div className="progress-bar"></div>
                </div>
            </div>
        </div>
    );
}

export default LoadingFallback;
