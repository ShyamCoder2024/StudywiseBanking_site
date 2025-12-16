import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '22px',
                padding: '2px',
                border: 'none',
                borderRadius: '11px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isDark
                    ? '#374151'
                    : '#e0e7ff',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                outline: 'none',
                flexShrink: 0,
            }}
            aria-label="Toggle Dark Mode"
            role="switch"
            aria-checked={isDark}
        >
            {/* Track with icons */}
            <span style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px',
                pointerEvents: 'none',
            }}>
                <Sun
                    size={10}
                    color="#f59e0b"
                    style={{
                        opacity: isDark ? 0.3 : 1,
                        transition: 'opacity 0.3s ease',
                    }}
                />
                <Moon
                    size={10}
                    color="#fbbf24"
                    style={{
                        opacity: isDark ? 1 : 0.3,
                        transition: 'opacity 0.3s ease',
                    }}
                />
            </span>

            {/* Sliding knob */}
            <span style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                top: '3px',
                left: isDark ? '21px' : '3px',
                transition: 'left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                background: isDark
                    ? '#60a5fa'
                    : '#fff',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            }} />
        </button>
    );
};

export default ThemeToggle;
