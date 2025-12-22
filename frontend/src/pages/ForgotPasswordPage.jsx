import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import './AuthPages.css';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.requestPasswordReset(email);
            setSubmitted(true);
        } catch (err) {
            // Even if there's an error, still show success for security
            // (prevents email enumeration attacks)
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    // Success state - email sent
    if (submitted) {
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
                                Check Your Email
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.6' }}>
                                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                                The link will expire in 15 minutes.
                            </p>

                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                                    📧 Don't see the email? Check your spam folder.
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSubmitted(false);
                                    setEmail('');
                                }}
                                style={{ marginBottom: '12px' }}
                            >
                                <Send size={16} style={{ marginRight: '8px' }} />
                                Try another email
                            </Button>

                            <div>
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

    // Email input form
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
                                <Mail size={28} style={{ color: 'white' }} />
                            </div>
                            <h1 className="text-page-title">Forgot Password?</h1>
                            <p className="text-secondary">
                                No worries! Enter your email and we'll send you a reset link.
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-warning mb-3">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your registered email"
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
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Remember your password?{' '}
                                <Link to="/login">Sign In</Link>
                            </p>
                        </div>
                    </motion.div>
                </Card>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
