import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './AuthPages.css';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors({ email: 'Please enter a valid email' });
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            const response = await authService.sendOTP(formData.email);
            if (response.success) {
                setSuccessMessage('OTP sent to your email');
                setStep(2);
            }
        } catch (error) {
            setApiError(error.error?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!formData.otp || formData.otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            const response = await authService.verifyOTP(formData.email, formData.otp);
            if (response.success) {
                setSuccessMessage('OTP verified successfully');
                setStep(3);
            }
        } catch (error) {
            setApiError(error.error?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
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
            const response = await authService.resetPassword(
                formData.email,
                formData.otp,
                formData.newPassword
            );
            if (response.success) {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please login with your new password.' }
                });
            }
        } catch (error) {
            setApiError(error.error?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderProgressSteps = () => (
        <div className="auth-progress">
            <div className="auth-progress-step">
                <div className={`auth-progress-dot ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                    {step > 1 ? '✓' : '1'}
                </div>
            </div>
            <div className={`auth-progress-line ${step > 1 ? 'active' : ''}`}></div>
            <div className="auth-progress-step">
                <div className={`auth-progress-dot ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                    {step > 2 ? '✓' : '2'}
                </div>
            </div>
            <div className={`auth-progress-line ${step > 2 ? 'active' : ''}`}></div>
            <div className="auth-progress-step">
                <div className={`auth-progress-dot ${step === 3 ? 'active' : ''}`}>
                    3
                </div>
            </div>
        </div>
    );

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card" hoverable={false}>
                    <div className="auth-header">
                        <h1 className="text-page-title">Reset Password</h1>
                        <p className="text-secondary">
                            {step === 1 && 'Enter your email to receive OTP'}
                            {step === 2 && 'Enter the OTP sent to your email'}
                            {step === 3 && 'Create a new password'}
                        </p>
                    </div>

                    {renderProgressSteps()}

                    {apiError && (
                        <div className="alert alert-warning mb-3">
                            {apiError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert alert-success mb-3">
                            {successMessage}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="auth-form">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your registered email"
                                error={errors.email}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                block
                                loading={loading}
                                disabled={loading}
                            >
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="auth-form">
                            <Input
                                label="OTP"
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit OTP"
                                error={errors.otp}
                                maxLength={6}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                block
                                loading={loading}
                                disabled={loading}
                            >
                                Verify OTP
                            </Button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-block mt-2"
                                onClick={() => {
                                    setStep(1);
                                    setSuccessMessage('');
                                }}
                            >
                                Back to Email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="auth-form">
                            <Input
                                label="New Password"
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                error={errors.newPassword}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                error={errors.confirmPassword}
                                required
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                block
                                loading={loading}
                                disabled={loading}
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="auth-footer">
                        <p>
                            Remember your password?{' '}
                            <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
