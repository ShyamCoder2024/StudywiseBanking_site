import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LoadingFallback.css';

export function LoadingFallback({ timeout = 10000 }) {
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Show warning after 5 seconds
        const warningTimer = setTimeout(() => {
            setShowSlowWarning(true);
        }, 5000);

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
                <motion.div
                    className="loading-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
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
                </motion.div>
            </div>
        );
    }

    return (
        <div className="loading-fallback">
            <motion.div
                className="loading-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>

                <h2>Loading...</h2>

                {showSlowWarning && (
                    <motion.p
                        className="slow-warning"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        This is taking longer than usual. Please wait...
                    </motion.p>
                )}

                <div className="loading-progress">
                    <div className="progress-bar"></div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoadingFallback;
