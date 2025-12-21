import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart2, Target, Award, Zap } from 'lucide-react';
import api from '../../services/api';

// Mock data for fallback
const MOCK_PERFORMANCE = {
    accuracy: 78,
    totalAttempts: 12,
    xpPoints: 2450,
    performanceGraph: [65, 72, 58, 80, 75, 82, 78]
};

export default function PerformancePage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const res = await api.get('/student/dashboard');
                setData(res.data.data);
            } catch (error) {
                console.error('Failed to fetch performance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, []);

    // Use real data if available, otherwise mock
    const hasRealData = data && data.totalAttempts > 0;
    const stats = {
        accuracy: hasRealData ? data.accuracy : MOCK_PERFORMANCE.accuracy,
        totalAttempts: hasRealData ? data.totalAttempts : MOCK_PERFORMANCE.totalAttempts,
        xpPoints: hasRealData ? data.xpPoints : MOCK_PERFORMANCE.xpPoints,
    };

    const performanceGraph = hasRealData && data.performanceGraph?.length > 0
        ? data.performanceGraph.map(p => p.score)
        : MOCK_PERFORMANCE.performanceGraph;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="page-container"
            style={{ padding: '20px', paddingBottom: '100px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} style={{ color: 'var(--color-text)' }} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-text)' }}>Performance Analytics</h1>
                    <span style={{ fontSize: '0.85rem', color: hasRealData ? '#10b981' : '#f59e0b' }}>
                        {hasRealData ? '📊 Real Data' : '🧪 Demo Mode'}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>Accuracy Rate</p>
                        <Target size={20} style={{ color: '#10b981' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>{stats.accuracy}%</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        Based on {hasRealData ? data.totalCorrect : '~'} correct answers
                    </span>
                </div>

                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>Tests Taken</p>
                        <BarChart2 size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#3b82f6' }}>{stats.totalAttempts}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total Attempted</span>
                </div>

                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>Total XP</p>
                        <Award size={20} style={{ color: '#f59e0b' }} />
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#f59e0b' }}>{stats.xpPoints}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Experience Points</span>
                </div>
            </div>

            {/* Performance Graph */}
            <div style={{ background: 'var(--color-card)', padding: '30px', borderRadius: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={20} style={{ color: '#8b5cf6' }} />
                    Recent Performance
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', padding: '10px 0' }}>
                    {performanceGraph.map((score, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <motion.div
                                style={{
                                    width: '40px',
                                    background: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
                                    borderRadius: '8px 8px 0 0',
                                    minHeight: '20px'
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${score * 1.8}px` }}
                                transition={{ delay: 0.1 * i, duration: 0.5 }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {score}%
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {hasRealData && data.performanceGraph?.[i]?.date
                                    ? new Date(data.performanceGraph[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]
                                }
                            </span>
                        </div>
                    ))}
                </div>
                {!hasRealData && (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '20px' }}>
                        📝 Take some quizzes to see your real performance data!
                    </p>
                )}
            </div>

            {/* AI Recommendations */}
            {hasRealData && data.studyRecommendation && (
                <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))', padding: '20px', borderRadius: '16px', marginTop: '20px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>💡 AI Recommendation</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{data.studyRecommendation}</p>
                    <p style={{ margin: '8px 0 0 0', color: '#8b5cf6', fontWeight: '600' }}>
                        Suggested daily study: {data.suggestedStudyHours} hours
                    </p>
                </div>
            )}
        </motion.div>
    );
}

