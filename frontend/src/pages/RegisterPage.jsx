import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input, Select, RadioGroup } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Rocket, Users, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import './LoginPage.css'; // Reusing the premium split layout styles

// Floating badge component (Same as Login Page)
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
            zIndex: 10,
            maxWidth: '200px',
            pointerEvents: 'none'
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

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
    { value: 'preparing_fulltime', label: 'Preparing Full-time' },
    { value: 'student', label: 'Student' },
    { value: 'working_professional', label: 'Working Professional' },
    { value: 'other', label: 'Other' },
];

const TARGET_EXAM_OPTIONS = [
    { value: 'SBI PO', label: 'SBI PO' },
    { value: 'SBI Clerk', label: 'SBI Clerk' },
    { value: 'IBPS PO', label: 'IBPS PO' },
    { value: 'IBPS Clerk', label: 'IBPS Clerk' },
    { value: 'RBI Grade B', label: 'RBI Grade B' },
    { value: 'RRB PO', label: 'RRB PO' },
    { value: 'RRB Clerk', label: 'RRB Clerk' },
    { value: 'Other', label: 'Other Bank Exams' },
];

export function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', mobile: '',
        password: '', confirmPassword: '', gender: '', age: '', status: '',
        targetExam: '', city: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Required';
        if (!formData.email) newErrors.email = 'Required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.mobile) newErrors.mobile = 'Required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile (10 digits)';
        if (!formData.password) newErrors.password = 'Required';
        else if (formData.password.length < 6) newErrors.password = 'Min 6 chars';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.gender) newErrors.gender = 'Required';
        if (!formData.age) newErrors.age = 'Required';
        else if (parseInt(formData.age) < 16 || parseInt(formData.age) > 60) newErrors.age = '16-60 years';
        if (!formData.status) newErrors.status = 'Required';
        if (!formData.targetExam) newErrors.targetExam = 'Required';
        if (!formData.city.trim()) newErrors.city = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setApiError('');

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await authService.register(registerData);

            if (response.success && response.data) {
                const { user, token } = response.data;

                // Auto-login: Save user and token directly
                if (user && token) {
                    login(user, token);
                    navigate('/dashboard');
                } else {
                    // Fallback if no token (shouldn't happen)
                    navigate('/login', { state: { message: 'Registration successful! Please login.' } });
                }
            }
        } catch (error) {
            setApiError(error.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-split-page" style={{ overflowX: 'hidden' }}>
            {/* Left Side - Form */}
            <motion.div
                className="login-form-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ overflowY: 'auto' }} // Ensure scrolling on small screens/tall form
            >
                <div className="login-form-container" style={{ maxWidth: '500px', paddingTop: '20px', paddingBottom: '20px' }}>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="login-header"
                    >
                        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Create Account</h1>
                        <p style={{ fontSize: '16px' }}>Start your journey to banking success</p>
                    </motion.div>

                    {apiError && (
                        <div className="alert alert-warning mb-3">{apiError}</div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form register-form">

                        {/* Name Row */}
                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div style={{ flex: 1 }}>
                                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" error={errors.firstName} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" error={errors.lastName} required />
                            </div>
                        </motion.div>

                        {/* Contact Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" error={errors.email} required />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <Input label="Mobile Number" type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" error={errors.mobile} required />
                        </motion.div>

                        {/* Password Row */}
                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div style={{ flex: 1 }}>
                                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="******" error={errors.password} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input label="Confirm Pass" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="******" error={errors.confirmPassword} required />
                            </div>
                        </motion.div>

                        {/* Exam & City Row (New) */}
                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                            style={{ marginTop: '8px' }}
                        >
                            <div style={{ flex: 1 }}>
                                {/* "Toggle" / Select for Target Exam */}
                                <Select
                                    label="Target Exam"
                                    name="targetExam"
                                    value={formData.targetExam}
                                    onChange={handleChange}
                                    options={TARGET_EXAM_OPTIONS}
                                    error={errors.targetExam}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Mumbai"
                                    error={errors.city}
                                    required
                                />
                            </div>
                        </motion.div>


                        {/* Demographics Row */}
                        <motion.div
                            className="flex gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ alignItems: 'flex-start', marginTop: '8px' }}
                        >
                            <div style={{ width: '80px' }}>
                                <Input label="Age" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="21" error={errors.age} min="16" max="60" required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Select label="Current Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} error={errors.status} required />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            style={{ marginTop: '8px' }}
                        >
                            <RadioGroup label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={GENDER_OPTIONS} error={errors.gender} required />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            style={{ marginTop: '24px' }}
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
                                        <div className="spinner-border spinner-border-sm" /> Creating Account...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Create Account <ArrowRight size={18} />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="login-footer"
                    >
                        <p>Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Sign In</Link></p>
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
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)' // Teal gradient for "Growth" / New Account
                }}
            >
                {/* Dark overlay for readability */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                {/* Decorative Circles */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '-30%', left: '-20%', width: '700px', height: '700px',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', zIndex: 1
                    }}
                />

                {/* Floating Elements - Hidden on mobile */}
                <FloatingBadge
                    className="hide-mobile" icon={Rocket} text="Start Fast" color="#EF4444" top="15%" right="15%" delay={1}
                />
                <FloatingBadge
                    className="hide-mobile" icon={Users} text="Join Community" color="#3B82F6" bottom="20%" left="10%" delay={1.5}
                />
                <FloatingBadge
                    className="hide-mobile" icon={TrendingUp} text="Track Growth" color="#10B981" top="45%" left="5%" delay={2}
                />

                <div className="brand-content" style={{ position: 'relative', zIndex: 20 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <h2 style={{
                            fontSize: '42px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px', color: '#FFFFFF',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            Join the <br />
                            <span style={{ color: '#ccfbf1', textShadow: '0 0 20px rgba(204, 251, 241, 0.4)' }}>Elite Students</span>
                        </h2>
                        <p style={{
                            fontSize: '18px', color: '#f0fdfa', opacity: 0.95, lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 40px', fontWeight: '500',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            Get access to premium banking study materials, mock tests, and expert guidance.
                        </p>

                        <div className="brand-stats">
                            <div className="brand-stat">
                                <span className="stat-number" style={{ fontWeight: '800' }}>100%</span>
                                <span className="stat-text">Free to Join</span>
                            </div>
                            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
                            <div className="brand-stat">
                                <span className="stat-number" style={{ fontWeight: '800' }}>24/7</span>
                                <span className="stat-text">Access</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

export default RegisterPage;
