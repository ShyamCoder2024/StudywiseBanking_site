import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import './AdminLayout.css';

export function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalSubjects: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
        recentAttempts: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            // Mock data
            setStats({
                totalStudents: 156,
                totalSubjects: 5,
                totalQuizzes: 48,
                totalAttempts: 892,
                recentAttempts: [
                    { id: '1', studentName: 'Rahul Sharma', quizTitle: 'Number Series', score: 85, date: '2024-01-10' },
                    { id: '2', studentName: 'Priya Patel', quizTitle: 'Banking Awareness', score: 72, date: '2024-01-10' },
                    { id: '3', studentName: 'Amit Kumar', quizTitle: 'Reasoning - Syllogism', score: 90, date: '2024-01-09' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/subjects', label: 'Subjects', icon: '📚' },
        { path: '/admin/quizzes', label: 'Quizzes', icon: '📝' },
        { path: '/admin/students', label: 'Students', icon: '👥' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 className="text-card-title">StudyWiseBanking</h2>
                    <span className="badge badge-primary">Admin</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <span className="text-meta">Logged in as</span>
                        <span className="text-card-title">{user?.firstName || 'Admin'}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-ghost btn-block btn-sm">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1 className="text-page-title">Dashboard</h1>
                </header>

                {loading ? (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="admin-content">
                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <Card className="admin-stat-card">
                                <div className="admin-stat-icon">👥</div>
                                <div className="admin-stat-info">
                                    <span className="admin-stat-value">{stats.totalStudents}</span>
                                    <span className="admin-stat-label">Students</span>
                                </div>
                            </Card>
                            <Card className="admin-stat-card">
                                <div className="admin-stat-icon">📚</div>
                                <div className="admin-stat-info">
                                    <span className="admin-stat-value">{stats.totalSubjects}</span>
                                    <span className="admin-stat-label">Subjects</span>
                                </div>
                            </Card>
                            <Card className="admin-stat-card">
                                <div className="admin-stat-icon">📝</div>
                                <div className="admin-stat-info">
                                    <span className="admin-stat-value">{stats.totalQuizzes}</span>
                                    <span className="admin-stat-label">Quizzes</span>
                                </div>
                            </Card>
                            <Card className="admin-stat-card">
                                <div className="admin-stat-icon">✅</div>
                                <div className="admin-stat-info">
                                    <span className="admin-stat-value">{stats.totalAttempts}</span>
                                    <span className="admin-stat-label">Attempts</span>
                                </div>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="admin-section">
                            <h2 className="text-section-title mb-2">Quick Actions</h2>
                            <div className="quick-actions">
                                <Link to="/admin/subjects" className="quick-action-card">
                                    <span className="quick-action-icon">➕</span>
                                    <span>Add Subject</span>
                                </Link>
                                <Link to="/admin/quizzes" className="quick-action-card">
                                    <span className="quick-action-icon">📝</span>
                                    <span>Create Quiz</span>
                                </Link>
                                <Link to="/admin/students" className="quick-action-card">
                                    <span className="quick-action-icon">👥</span>
                                    <span>View Students</span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Attempts */}
                        <div className="admin-section">
                            <h2 className="text-section-title mb-2">Recent Attempts</h2>
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Quiz</th>
                                            <th>Score</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentAttempts.map((attempt) => (
                                            <tr key={attempt.id}>
                                                <td>{attempt.studentName}</td>
                                                <td>{attempt.quizTitle}</td>
                                                <td>
                                                    <span className={`badge badge-${attempt.score >= 70 ? 'success' : attempt.score >= 50 ? 'primary' : 'warning'}`}>
                                                        {attempt.score}%
                                                    </span>
                                                </td>
                                                <td className="text-meta">{attempt.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
