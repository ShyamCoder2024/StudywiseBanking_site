import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// MOCK MODE - set to true to bypass authentication for UI testing
const MOCK_MODE = false;

const MOCK_USER = {
    _id: 'mock-user-123',
    firstName: 'Shyam',
    lastName: 'Student',
    email: 'demo@studywisebanking.com',
    mobile: '9876543210',
    role: 'student',
    avatar: null,
};

const MOCK_ADMIN = {
    _id: 'mock-admin-123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@studywisebanking.com',
    role: 'admin',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Initialize from localStorage SYNCHRONOUSLY to prevent flash
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    const [loading, setLoading] = useState(false); // Changed to false - no async init needed

    // Login function that updates state AND localStorage synchronously
    const login = useCallback((userData, authToken) => {
        // 1. Update localStorage FIRST (synchronous)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);

        // 2. Update React state
        setUser(userData);
        setToken(authToken);

        // Return true to indicate success
        return true;
    }, []);

    const loginAsStudent = useCallback(() => {
        return login(MOCK_USER, 'mock-student-token');
    }, [login]);

    const loginAsAdmin = useCallback(() => {
        return login(MOCK_ADMIN, 'mock-admin-token');
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    }, []);

    const updateUser = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    // Compute auth status directly from state
    const isAuthenticated = !!user && !!token;
    const isAdmin = user?.role === 'admin';

    const value = {
        user,
        token,
        loading,
        login,
        loginAsStudent,
        loginAsAdmin,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isMockMode: MOCK_MODE,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
