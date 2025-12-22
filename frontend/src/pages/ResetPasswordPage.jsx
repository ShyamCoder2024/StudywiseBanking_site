import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lock, ArrowLeft, Loader } from 'lucide-react';
import './AuthPages.css';

export function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('validating'); // validating, valid, invalid, success
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                await authService.validateResetToken(token);
                setStatus('valid');
            } catch (error) {
                setStatus('invalid');
                setApiError(error.response?.data?.message || 'This password reset link is invalid or has expired.');
            }
        };

        if (token) {
            validateToken();
        } else {
            setStatus('invalid');
            setApiError('Invalid reset link.');
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.newPassword || formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            await authService.resetPassword(token, formData.newPassword);
            setStatus('success');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please login with your new password.' }
                });
            }, 3000);
        } catch (error) {
            setApiError(error.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (status === 'validating') {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <Card className="auth-card" hoverable={false}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                            style={{ padding: '40px 20px' }}
                        >
                            <Loader size={48} className="animate-spin" style={{ color: '#8A75BA', margin: '0 auto 20px' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                                Validating your reset link...
                            </p>
                        </motion.div>
                    </Card>
                </div>
            </div>
        );
    }

    // Invalid/expired token
    if (status === 'invalid') {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <Card className="auth-card" hoverable={false}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                            style={{ padding: '40px 20px' }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <XCircle size={40} style={{ color: '#dc2626' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                                Link Expired or Invalid
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                                {apiError}
                            </p>
                            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                <Button variant="primary" style={{ padding: '12px 24px' }}>
                                    Request New Reset Link
                                </Button>
                            </Link>
                            <div style={{ marginTop: '16px' }}>
                                <Link to="/login" style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </div>
                        </motion.div>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
    if (status === 'success') {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <Card className="auth-card" hoverable={false}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                            style={{ padding: '40px 20px' }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                <CheckCircle size={40} style={{ color: '#16a34a' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--text-primary)' }}>
                                Password Reset Successful!
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.6' }}>
                                Your password has been updated successfully.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Redirecting to login page...
                            </p>
                        </motion.div>
                    </Card>
                </div>
            </div>
        );
    }

    // Valid token - show password form
    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card" hoverable={false}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="auth-header">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8A75BA, #6B5A96)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <Lock size={28} style={{ color: 'white' }} />
                            </div>
                            <h1 className="text-page-title">Create New Password</h1>
                            <p className="text-secondary">
                                Please enter your new password below
                            </p>
                        </div>

                        {apiError && (
                            <div className="alert alert-warning mb-3">
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <Input
                                label="New Password"
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password (min 6 characters)"
                                error={errors.newPassword}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                error={errors.confirmPassword}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                block
                                loading={loading}
                                disabled={loading}
                                style={{
                                    marginTop: '8px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #8A75BA 0%, #6B5A96 100%)',
                                }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                <Link to="/login" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </Card>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
