import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart2, Target, Award, Zap } from 'lucide-react';
import api from '../../services/api';

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
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} style={{ color: 'var(--color-text)' }} />
                </button>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', margin: 0, color: 'var(--color-text)' }}>Performance Analytics</h1>
                    <span style={{ fontSize: '0.85rem', color: hasRealData ? '#10b981' : '#f59e0b' }}>
                        {hasRealData ? '📊 Real Data' : '🧪 Demo Mode'}
                    </span>
                </div>
            </div>

            {/* Stats Cards - Mobile Optimized Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(10px, 2vw, 20px)',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: 'var(--color-card)',
                    padding: 'clamp(12px, 3vw, 20px)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <Target size={20} style={{ color: '#10b981', marginBottom: '8px' }} />
                    <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', margin: 0, color: '#10b981' }}>{stats.accuracy}%</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', margin: '4px 0 0' }}>Accuracy</p>
                </div>

                <div style={{
                    background: 'var(--color-card)',
                    padding: 'clamp(12px, 3vw, 20px)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <BarChart2 size={20} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                    <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', margin: 0, color: '#3b82f6' }}>{stats.totalAttempts}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', margin: '4px 0 0' }}>Tests</p>
                </div>

                <div style={{
                    background: 'var(--color-card)',
                    padding: 'clamp(12px, 3vw, 20px)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <Award size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                    <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', margin: 0, color: '#f59e0b' }}>{stats.xpPoints}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', margin: '4px 0 0' }}>XP</p>
                </div>
            </div>

            {/* Performance Graph - Mobile Optimized */}
            <div style={{
                background: 'var(--color-card)',
                padding: 'clamp(16px, 4vw, 30px)',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden'
            }}>
                <h3 style={{
                    margin: '0 0 16px 0',
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: 'clamp(0.9rem, 3vw, 1.1rem)'
                }}>
                    <Zap size={18} style={{ color: '#8b5cf6' }} />
                    Recent Performance
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: 'clamp(120px, 25vw, 200px)',
                    padding: '10px 0',
                    gap: 'clamp(4px, 1vw, 8px)',
                    overflowX: 'auto',
                    overflowY: 'hidden'
                }}>
                    {performanceGraph.map((score, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: 'clamp(28px, 8vw, 50px)',
                            flex: 1
                        }}>
                            <motion.div
                                style={{
                                    width: 'clamp(20px, 6vw, 40px)',
                                    background: 'linear-gradient(180deg, #8b5cf6, #6366f1)',
                                    borderRadius: '6px 6px 0 0',
                                    minHeight: '10px'
                                }}
                                initial={{ height: 0 }}
                                animate={{ height: `${score * (window.innerWidth < 480 ? 1.2 : 1.8)}px` }}
                                transition={{ delay: 0.1 * i, duration: 0.5 }}
                            />
                            <span style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                {score}%
                            </span>
                            <span style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.7rem)', color: 'var(--color-text-muted)' }}>
                                {hasRealData && data.performanceGraph?.[i]?.date
                                    ? new Date(data.performanceGraph[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]
                                }
                            </span>
                        </div>
                    ))}
                </div>
                {!hasRealData && (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '16px' }}>
                        📝 Take some quizzes to see your real performance data!
                    </p>
                )}
            </div>

            {/* AI Recommendations */}
            {hasRealData && data.studyRecommendation && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
                    padding: 'clamp(16px, 4vw, 20px)',
                    borderRadius: '16px',
                    marginTop: '20px',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>💡 AI Recommendation</h4>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>{data.studyRecommendation}</p>
                    <p style={{ margin: '8px 0 0 0', color: '#8b5cf6', fontWeight: '600', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                        Suggested daily study: {data.suggestedStudyHours} hours
                    </p>
                </div>
            )}
        </motion.div>
    );
}
