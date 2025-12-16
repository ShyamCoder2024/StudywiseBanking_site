import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, BookOpen, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import './LoginPage.css';

// Floating badge component for visual side - Hidden on mobile/small tablets to prevent clutter
const FloatingBadge = ({ icon: Icon, text, delay, color, top, left, right, bottom, className }) => (
    <motion.div
        className={`floating-badge ${className || ''}`}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{
            opacity: 1,
            y: [0, -10, 0],
            scale: 1,
        }}
        transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay },
            opacity: { duration: 0.5, delay: delay },
            scale: { duration: 0.5, delay: delay }
        }}
        style={{
            position: 'absolute',
            top, left, right, bottom,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '12px 20px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10, // Lower than text (20)
            maxWidth: '200px',
            pointerEvents: 'none' // Click through
        }}
    >
        <div style={{
            backgroundColor: color,
            padding: '8px',
            borderRadius: '10px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={16} />
        </div>
        <div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1625', display: 'block' }}>{text}</span>
        </div>
    </motion.div>
);

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const emailInput = formData.email.trim().toLowerCase();
        const passwordInput = formData.password.trim();

        try {
            // Single login endpoint - backend detects admin/student automatically
            const response = await authService.login({ email: emailInput, password: passwordInput });

            if (response && (response.token || response.success)) {
                const token = response.token || response.data?.token;
                const user = response.user || response.data?.user;

                if (token && user) {
                    const success = login(user, token);
                    if (success) {
                        // Navigate based on role - admin detection is seamless
                        if (user.role === 'admin') {
                            navigate('/admin');
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        setError('Failed to save session. Please try again.');
                    }
                } else {
                    setError('Invalid server response. Missing token or user data.');
                }
            } else {
                setError(response.message || 'Login failed');
            }

        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-page" style={{ overflowX: 'hidden' }}>
            {/* Left Side - Form with Staggered Animation */}
            <motion.div
                className="login-form-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="login-form-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="login-header"
                    >
                        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back</h1>
                        <p style={{ fontSize: '16px' }}>Enter your details to access your account</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="alert alert-warning"
                            style={{ marginBottom: '20px' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="login-forgot"
                        >
                            <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: '500' }}>Forgot password?</Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Button
                                type="submit"
                                variant="primary"
                                block
                                disabled={loading}
                                style={{
                                    height: '48px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #8A75BA 0%, #6B5A96 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(138, 117, 186, 0.4)'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="spinner-border spinner-border-sm" /> Signing In...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Sign In <ArrowRight size={18} />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="login-footer"
                    >
                        <p>Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Create Account</Link></p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Visuals */}
            <motion.div
                className="login-brand-section"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #2D1B69 0%, #4c1d95 100%)' // Deep purple for better contrast
                }}
            >
                {/* Dark overlay for better text readability */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                {/* Decorative Circles - Low opacity */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        right: '-20%',
                        width: '600px',
                        height: '600px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '-10%',
                        width: '400px',
                        height: '400px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                />

                {/* Floating Elements - Hidden on mobile via CSS class */}
                <FloatingBadge
                    className="hide-mobile"
                    icon={Target}
                    text="Precision Learning"
                    color="#4F46E5"
                    top="15%"
                    left="10%"
                    delay={1}
                />

                <FloatingBadge
                    className="hide-mobile"
                    icon={Award}
                    text="Top Rankers"
                    color="#F59E0B"
                    top="50%"
                    right="8%"
                    delay={1.5}
                />

                <FloatingBadge
                    className="hide-mobile"
                    icon={CheckCircle2}
                    text="Verified Content"
                    color="#10B981"
                    bottom="15%"
                    left="15%"
                    delay={2}
                />

                {/* Main Content - High Z-Index 20 */}
                <div className="brand-content" style={{ position: 'relative', zIndex: 20 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h2 style={{
                            fontSize: '42px',
                            fontWeight: '800',
                            lineHeight: 1.2,
                            marginBottom: '20px',
                            color: '#FFFFFF',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.02em'
                        }}>
                            Ace Your <br />
                            <span style={{ color: '#E0DAF5', textShadow: '0 0 20px rgba(224, 218, 245, 0.4)' }}>Banking Exams</span>
                        </h2>
                        <p style={{
                            fontSize: '18px',
                            color: '#e2e8f0',
                            opacity: 1,
                            lineHeight: 1.6,
                            maxWidth: '400px',
                            margin: '0 auto 40px',
                            fontWeight: '500',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            Smart test series, detailed analytics, and AI-powered performance insights all in one place.
                        </p>

                        <div className="brand-stats">
                            <motion.div whileHover={{ y: -5 }} className="brand-stat">
                                <span className="stat-number" style={{ fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>1k+</span>
                                <span className="stat-text" style={{ fontWeight: '600', opacity: 0.9, fontSize: '12px' }}>Tests</span>
                            </motion.div>
                            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
                            <motion.div whileHover={{ y: -5 }} className="brand-stat">
                                <span className="stat-number" style={{ fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>5k+</span>
                                <span className="stat-text" style={{ fontWeight: '600', opacity: 0.9, fontSize: '12px' }}>Students</span>
                            </motion.div>
                            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
                            <motion.div whileHover={{ y: -5 }} className="brand-stat">
                                <span className="stat-number" style={{ fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>4.9</span>
                                <span className="stat-text" style={{ fontWeight: '600', opacity: 0.9, fontSize: '12px' }}>Rating</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;
