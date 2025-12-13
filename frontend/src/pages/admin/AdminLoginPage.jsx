import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import '../AuthPages.css';

export function AdminLoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.adminLogin(formData);
            if (response.success) {
                login(response.data.user, response.data.token);
                navigate('/admin');
            }
        } catch (err) {
            setError(err.error?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card" hoverable={false}>
                    <div className="auth-header">
                        <h1 className="text-page-title">Admin Login</h1>
                        <p className="text-secondary">Access the admin dashboard</p>
                    </div>

                    {error && (
                        <div className="alert alert-warning mb-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter admin username"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            block
                            loading={loading}
                            disabled={loading}
                            className="mt-3"
                        >
                            Login to Admin
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <a href="/login">← Back to Student Login</a>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default AdminLoginPage;
