import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input, Select, RadioGroup } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './AuthPages.css';

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

export function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        gender: '',
        age: '',
        status: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
        }
        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else if (parseInt(formData.age) < 16 || parseInt(formData.age) > 60) {
            newErrors.age = 'Age must be between 16 and 60';
        }
        if (!formData.status) {
            newErrors.status = 'Please select your current status';
        }

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
            if (response.success) {
                navigate('/login', {
                    state: { message: 'Registration successful! Please login.' }
                });
            }
        } catch (error) {
            setApiError(error.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container" style={{ maxWidth: '480px' }}>
                <Card className="auth-card" hoverable={false}>
                    <div className="auth-header">
                        <h1 className="text-page-title">Create Account</h1>
                        <p className="text-secondary">Start your banking exam preparation</p>
                    </div>

                    {apiError && (
                        <div className="alert alert-warning mb-3">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form register-form">
                        <div className="flex gap-2">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                error={errors.firstName}
                                required
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                error={errors.lastName}
                                required
                            />
                        </div>

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Mobile Number"
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            error={errors.mobile}
                            required
                        />

                        <div className="flex gap-2">
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                error={errors.password}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                error={errors.confirmPassword}
                                required
                            />
                        </div>

                        <RadioGroup
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={GENDER_OPTIONS}
                            error={errors.gender}
                            required
                        />

                        <div className="flex gap-2">
                            <Input
                                label="Age"
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Your age"
                                error={errors.age}
                                min="16"
                                max="60"
                                required
                            />
                            <Select
                                label="Current Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={STATUS_OPTIONS}
                                error={errors.status}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            block
                            loading={loading}
                            disabled={loading}
                            className="mt-3"
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default RegisterPage;
