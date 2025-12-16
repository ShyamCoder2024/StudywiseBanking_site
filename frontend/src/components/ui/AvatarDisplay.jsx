import React from 'react';

export function AvatarDisplay({ avatar, size = 48, onClick, selected, className = '' }) {
    const style = {
        width: size,
        height: size,
        minWidth: size, // Prevent shrinking
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? '4px solid #4f46e5' : '2px solid transparent',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: selected ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : '0 4px 10px rgba(0,0,0,0.1)',
        objectFit: 'cover',
        background: '#f8fafc',
        transform: selected ? 'scale(1.1)' : 'scale(1)'
    };

    return (
        <img
            src={avatar?.url || `https://api.dicebear.com/9.x/adventurer/svg?seed=fallback`}
            alt="avatar"
            style={style}
            onClick={onClick}
            className={`avatar-display-component ${className}`}
            loading="lazy"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${avatar?.id || 'fallback'}`;
            }}
        />
    );
}
