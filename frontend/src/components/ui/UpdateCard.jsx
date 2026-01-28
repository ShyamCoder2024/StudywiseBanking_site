import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import './UpdateCard.css';

export function UpdateCard() {
    const [isVisible, setIsVisible] = useState(false);
    const dismissKey = 'update-dismissed-jan2026';

    useEffect(() => {
        // Check if user has already dismissed this update
        const dismissed = localStorage.getItem(dismissKey);
        if (!dismissed) {
            // Small delay before showing for better UX
            setTimeout(() => setIsVisible(true), 500);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(dismissKey, 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <>
            <div className="update-card-wrapper">
                <div className="update-backdrop" onClick={handleDismiss} />
                <div className="update-card">
                    <button onClick={handleDismiss} className="update-close" aria-label="Dismiss">
                        <X size={20} />
                    </button>
                    <div className="update-icon">
                        <CheckCircle2 size={32} />
                    </div>
                    <div className="update-content">
                        <h3 className="update-title">🎉 App Updated!</h3>
                        <p className="update-message">
                            We've fixed critical scrolling issues and improved the overall user experience.
                            Enjoy smoother navigation across all pages!
                        </p>
                    </div>
                    <button onClick={handleDismiss} className="update-dismiss-btn">
                        Got it!
                    </button>
                </div>
            </div>
        </>
    );
}

export default UpdateCard;
