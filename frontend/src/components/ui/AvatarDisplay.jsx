import React, { useState } from 'react';

export function AvatarDisplay({ avatar, size = 48, onClick, selected, className = '' }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Get the avatar URL - handle both object format { id, url } and direct URL string
    const getAvatarUrl = () => {
        if (!avatar) {
            return `https://api.dicebear.com/9.x/adventurer/svg?seed=fallback&backgroundColor=b6e3f4`;
        }

        // If avatar is a string (direct URL)
        if (typeof avatar === 'string') {
            return avatar;
        }

        // If avatar has a url property
        if (avatar.url) {
            return avatar.url;
        }

        // If avatar has an id, use it to generate dicebear URL
        if (avatar.id) {
            return `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatar.id}&backgroundColor=b6e3f4`;
        }

        // Final fallback
        return `https://api.dicebear.com/9.x/adventurer/svg?seed=fallback&backgroundColor=b6e3f4`;
    };

    const avatarUrl = error ? `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatar?.id || 'fallback'}&backgroundColor=c0aede` : getAvatarUrl();

    const style = {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? '4px solid #4f46e5' : '2px solid transparent',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: selected ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
        objectFit: 'cover',
        background: loaded ? 'transparent' : '#e2e8f0',
        transform: selected ? 'scale(1.1)' : 'scale(1)',
        opacity: loaded || error ? 1 : 0.7,
        display: 'block',
    };

    return (
        <img
            src={avatarUrl}
            alt="avatar"
            style={style}
            onClick={onClick}
            className={`avatar-display-component ${className} ${loaded ? 'loaded' : ''}`}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
                if (!error) {
                    setError(true);
                    setLoaded(true);
                }
            }}
        />
    );
}
