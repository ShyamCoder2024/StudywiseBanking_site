import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import '../AuthPages.css';

export function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Try the standard login endpoint first (it checks admin role)
            const response = await authService.login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password.trim()
            });

            if (response && response.success !== false) {
                const token = response.token || response.data?.token;
                const user = response.user || response.data?.user;

                if (token && user) {
                    // Check if user is admin
                    if (user.role !== 'admin') {
                        setError('Access denied. This portal is for administrators only.');
                        setLoading(false);
                        return;
                    }

                    // Store in localStorage FIRST (synchronous)
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);

                    // Force hard navigation to avoid React state issues
                    window.location.href = '/admin';
                    return;
                }
            }

            setError(response?.message || 'Login failed. Please check your credentials.');
        } catch (err) {
            console.error('Admin login error:', err);
            const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card" hoverable={false}>
                    <div className="auth-header" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Shield size={28} color="white" />
                        </div>
                        <h1 className="text-page-title">Admin Portal</h1>
                        <p className="text-secondary">Enter your administrator credentials</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            color: '#ef4444',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="admin@studywisebanking.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div style={{ position: 'relative' }}>
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '38px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            block
                            size="lg"
                            loading={loading}
                            disabled={loading || !formData.email || !formData.password}
                            style={{
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                            }}
                        >
                            {loading ? 'Signing In...' : 'Access Admin Dashboard'}
                        </Button>
                    </form>

                    <div className="auth-footer mt-6" style={{ textAlign: 'center' }}>
                        <a href="/login" className="text-gray-500 hover:text-gray-700">← Back to Student Login</a>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default AdminLoginPage;
