import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import '../AuthPages.css';

export function AdminLoginPage() {
    const navigate = useNavigate();
    // The useAuth hook is no longer needed as login, logout, isAdmin, isAuthenticated are not used.
    // However, to match the provided snippet, we'll keep `const { login } = useAuth();`
    // and then remove `login` from the destructuring if it's not used.
    // Based on the instruction, `login` will not be used in `handleEnter`.
    // So, `useAuth` can be removed entirely.
    // Let's follow the instruction's implied change for `useAuth` destructuring.
    const { login } = useAuth(); // Keeping this line as per the provided snippet, though 'login' is not used later.
    const [loading, setLoading] = useState(false);

    // DEMO ADMIN - No API calls
    const DEMO_ADMIN = {
        _id: 'demo-admin-123',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@studywise.com',
        role: 'admin',
    };

    const handleEnter = () => {
        setLoading(true);

        // FINAL FIX: Direct Storage Write + Hard Reload
        // This guarantees no React state race conditions interfere with the login
        const token = 'demo-admin-token';

        localStorage.setItem('user', JSON.stringify(DEMO_ADMIN));
        localStorage.setItem('token', token);

        window.location.href = '/admin';
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card" hoverable={false}>
                    <div className="auth-header">
                        <h1 className="text-page-title">Admin Portal</h1>
                        <p className="text-secondary">Authorized Access Only</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-6">
                        <div className="p-4 bg-indigo-50 text-indigo-700 rounded-lg text-sm text-center">
                            Logged in as <strong>Administrator</strong>
                        </div>

                        <Button
                            onClick={handleEnter}
                            variant="primary"
                            block
                            size="lg"
                            loading={loading}
                            disabled={loading}
                        >
                            Enter Admin Dashboard
                        </Button>
                    </div>

                    <div className="auth-footer mt-6">
                        <a href="/login" className="text-gray-500 hover:text-gray-700">← Back to Student Login</a>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default AdminLoginPage;
