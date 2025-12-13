import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import './StudentDashboard.css';

export function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalAttempts: 0,
        averageScore: 0,
        weakAreas: [],
        recentAttempts: [],
        recommendations: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/student/dashboard');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Use mock data for demo
            setStats({
                totalAttempts: 12,
                averageScore: 72,
                weakAreas: [
                    { name: 'Quantitative Aptitude', score: 45 },
                    { name: 'English Grammar', score: 55 },
                ],
                recentAttempts: [
                    { id: '1', quizName: 'Banking Awareness Mock', score: 85, date: '2024-01-10' },
                    { id: '2', quizName: 'Reasoning - Syllogism', score: 70, date: '2024-01-09' },
                    { id: '3', quizName: 'Quant - Number Series', score: 65, date: '2024-01-08' },
                ],
                recommendations: [
                    { id: '1', type: 'quiz', title: 'Practice Number Series', description: 'Based on your weak areas' },
                    { id: '2', type: 'video', title: 'English Grammar Tips', description: 'Improve your score' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                {/* Welcome Section */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="text-page-title">
                            Welcome, {user?.firstName || 'Student'}
                        </h1>
                        <p className="text-secondary">Continue your banking exam preparation</p>
                    </div>
                </div>

                {/* Primary CTA */}
                <Card className="cta-card">
                    <div className="cta-content">
                        <div className="cta-icon">🎯</div>
                        <div className="cta-text">
                            <h2 className="text-section-title">Ready to Test Your Knowledge?</h2>
                            <p className="text-secondary">Take a quiz now and track your progress</p>
                        </div>
                        <Link to="/subjects">
                            <Button variant="primary" size="lg">
                                Start Test
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <Card className="stat-card">
                        <div className="stat-value">{stats.totalAttempts}</div>
                        <div className="stat-label">Tests Taken</div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-value">{stats.averageScore}%</div>
                        <div className="stat-label">Average Score</div>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Recent Attempts */}
                    <section className="dashboard-section">
                        <h3 className="text-section-title mb-2">Recent Attempts</h3>
                        <div className="attempts-list">
                            {stats.recentAttempts.length > 0 ? (
                                stats.recentAttempts.map((attempt) => (
                                    <Link to={`/result/${attempt.id}`} key={attempt.id}>
                                        <Card className="attempt-card">
                                            <div className="attempt-info">
                                                <h4 className="text-card-title">{attempt.quizName}</h4>
                                                <p className="text-meta">{attempt.date}</p>
                                            </div>
                                            <div className={`attempt-score ${attempt.score >= 70 ? 'good' : attempt.score >= 50 ? 'average' : 'poor'}`}>
                                                {attempt.score}%
                                            </div>
                                        </Card>
                                    </Link>
                                ))
                            ) : (
                                <Card className="empty-card">
                                    <p className="text-secondary text-center">No attempts yet. Start a test!</p>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* Weak Areas */}
                    <section className="dashboard-section">
                        <h3 className="text-section-title mb-2">Weak Areas</h3>
                        <div className="weak-areas-list">
                            {stats.weakAreas.length > 0 ? (
                                stats.weakAreas.map((area, index) => (
                                    <Card key={index} className="weak-area-card">
                                        <div className="weak-area-info">
                                            <h4 className="text-card-title">{area.name}</h4>
                                            <div className="progress">
                                                <div
                                                    className="progress-bar warning"
                                                    style={{ width: `${area.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="badge badge-warning">{area.score}%</span>
                                    </Card>
                                ))
                            ) : (
                                <Card className="empty-card">
                                    <p className="text-secondary text-center">Take more tests to identify weak areas</p>
                                </Card>
                            )}
                        </div>
                    </section>
                </div>

                {/* Recommendations */}
                <section className="dashboard-section mt-4">
                    <h3 className="text-section-title mb-2">Recommended for You</h3>
                    <div className="recommendations-grid">
                        {stats.recommendations.map((rec) => (
                            <Card key={rec.id} className="recommendation-card">
                                <div className="recommendation-icon">
                                    {rec.type === 'quiz' ? '📝' : '🎬'}
                                </div>
                                <div className="recommendation-content">
                                    <h4 className="text-card-title">{rec.title}</h4>
                                    <p className="text-meta">{rec.description}</p>
                                </div>
                                <Button variant="secondary" size="sm">
                                    {rec.type === 'quiz' ? 'Start' : 'Watch'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default StudentDashboard;
