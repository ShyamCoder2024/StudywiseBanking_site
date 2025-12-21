import { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Check local storage or system preference on mount
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored) return stored;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const root = document.documentElement;

        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            // Remove both classes first
            root.classList.remove('light', 'dark');
            // Add the new theme class
            root.classList.add(theme);
        });

        // Persist to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        // Use startTransition for non-blocking UI update
        startTransition(() => {
            setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isPending }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
