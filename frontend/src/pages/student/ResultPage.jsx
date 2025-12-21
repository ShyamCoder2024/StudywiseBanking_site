import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, SkipForward, Clock, Sparkles, ArrowRight, Brain } from 'lucide-react';
import api from '../../services/api';
import './ResultPage.css';

export function ResultPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            const response = await api.get(`/attempts/${attemptId}`);
            if (response.data.success) {
                setResult(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch result:', error);
            // Mock data
            setResult({
                quizTitle: 'Number Series - Basics',
                score: 75,
                totalQuestions: 10,
                correctAnswers: 7,
                wrongAnswers: 2,
                unanswered: 1,
                timeTaken: '12:30',
                submittedAt: '2024-01-10',
                aiAnalysis: {
                    overallFeedback: 'Good performance! You have a solid foundation in number series.',
                },
                recommendations: [
                    { type: 'quiz', title: 'Number Series - Intermediate', id: '2' },
                    { type: 'video', title: 'Mastering Number Patterns', url: '#' },
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

    const getScoreColor = (score) => {
        if (score >= 70) return 'success';
        if (score >= 50) return 'warning-amber';
        return 'warning';
    };

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="page result-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link to="/dashboard" className="back-nav">
                        ← Back to Dashboard
                    </Link>
                </motion.div>

                {/* Result Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="result-summary">
                        <div className="result-header">
                            <h1 className="text-page-title">{result.quizTitle}</h1>
                            <p className="text-meta">Submitted on {result.submittedAt}</p>
                        </div>

                        <motion.div
                            className={`result-score score-${getScoreColor(result.score)}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
                        >
                            <div className="score-circle">
                                <span className="score-value">{result.score}%</span>
                                <span className="score-label">Score</span>
                            </div>
                        </motion.div>

                        {/* Interactive Stats Cards */}
                        <motion.div
                            className="result-stats"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.div
                                className="result-stat stat-correct"
                                variants={item}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="stat-icon-wrapper correct"
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <CheckCircle size={24} />
                                </motion.div>
                                <motion.span
                                    className="stat-value"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                >
                                    {result.correctAnswers}
                                </motion.span>
                                <span className="stat-label">Correct</span>
                            </motion.div>

                            <motion.div
                                className="result-stat stat-wrong"
                                variants={item}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="stat-icon-wrapper wrong"
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                >
                                    <XCircle size={24} />
                                </motion.div>
                                <motion.span
                                    className="stat-value"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.7, type: 'spring' }}
                                >
                                    {result.wrongAnswers}
                                </motion.span>
                                <span className="stat-label">Wrong</span>
                            </motion.div>

                            <motion.div
                                className="result-stat stat-skipped"
                                variants={item}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="stat-icon-wrapper skipped"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                >
                                    <SkipForward size={24} />
                                </motion.div>
                                <motion.span
                                    className="stat-value"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.8, type: 'spring' }}
                                >
                                    {result.unanswered}
                                </motion.span>
                                <span className="stat-label">Skipped</span>
                            </motion.div>

                            <motion.div
                                className="result-stat stat-time"
                                variants={item}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.div
                                    className="stat-icon-wrapper time"
                                    animate={{ rotate: 360 }}
                                    transition={{ delay: 0.8, duration: 1, ease: 'linear' }}
                                >
                                    <Clock size={24} />
                                </motion.div>
                                <motion.span
                                    className="stat-value"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9, type: 'spring' }}
                                >
                                    {result.timeTaken}
                                </motion.span>
                                <span className="stat-label">Time</span>
                            </motion.div>
                        </motion.div>
                    </Card>
                </motion.div>

                {/* AI Coach Tab - Premium Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="ai-coach-section"
                >
                    <motion.button
                        className="ai-coach-tab"
                        onClick={() => navigate('/analysis')}
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(139, 92, 246, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="ai-coach-tab-bg"></div>
                        <div className="ai-coach-tab-content">
                            <div className="ai-coach-left">
                                <motion.div
                                    className="ai-icon-wrapper"
                                    animate={{
                                        boxShadow: [
                                            '0 0 20px rgba(139, 92, 246, 0.3)',
                                            '0 0 40px rgba(139, 92, 246, 0.5)',
                                            '0 0 20px rgba(139, 92, 246, 0.3)'
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Brain size={32} color="white" />
                                </motion.div>
                                <div className="ai-coach-text">
                                    <span className="ai-coach-title">
                                        <Sparkles size={16} className="sparkle" />
                                        AI Coach Insights
                                    </span>
                                    <span className="ai-coach-subtitle">
                                        View detailed analysis, strengths, weaknesses & study recommendations
                                    </span>
                                </div>
                            </div>
                            <motion.div
                                className="ai-coach-arrow"
                                animate={{ x: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight size={24} />
                            </motion.div>
                        </div>
                    </motion.button>
                </motion.div>

                {/* Recommendations */}
                <motion.section
                    className="result-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h3 className="text-section-title mb-2">Recommended Next Steps</h3>
                    <div className="recommendations-list">
                        {result.recommendations.map((rec, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                            >
                                <Card className="recommendation-item">
                                    <div className="rec-icon">
                                        {rec.type === 'quiz' ? '📝' : '🎬'}
                                    </div>
                                    <div className="rec-content">
                                        <h4 className="text-card-title">{rec.title}</h4>
                                        <span className="badge badge-primary">
                                            {rec.type === 'quiz' ? 'Practice Quiz' : 'Video'}
                                        </span>
                                    </div>
                                    <Button variant="secondary" size="sm">
                                        {rec.type === 'quiz' ? 'Start' : 'Watch'}
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Actions */}
                <motion.div
                    className="result-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <Link to="/subjects">
                        <Button variant="primary" size="lg">
                            Take Another Test
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

export default ResultPage;
