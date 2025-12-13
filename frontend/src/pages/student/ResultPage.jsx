import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import './ResultPage.css';

export function ResultPage() {
    const { attemptId } = useParams();
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
                strengths: [
                    'Good understanding of arithmetic progression',
                    'Quick calculation speed',
                ],
                weaknesses: [
                    'Fibonacci and geometric series need improvement',
                    'Review pattern recognition techniques',
                ],
                aiAnalysis: {
                    overallFeedback: 'Good performance! You have a solid foundation in number series. Focus on practicing more complex patterns to improve further.',
                    topicSuggestions: [
                        { topic: 'Geometric Progression', reason: 'Struggled with GP-based questions' },
                        { topic: 'Mixed Patterns', reason: 'Improve pattern recognition skills' },
                    ],
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

    return (
        <div className="page result-page">
            <div className="container">
                <Link to="/dashboard" className="back-nav">
                    ← Back to Dashboard
                </Link>

                {/* Result Summary */}
                <Card className="result-summary">
                    <div className="result-header">
                        <h1 className="text-page-title">{result.quizTitle}</h1>
                        <p className="text-meta">Submitted on {result.submittedAt}</p>
                    </div>

                    <div className={`result-score score-${getScoreColor(result.score)}`}>
                        <div className="score-circle">
                            <span className="score-value">{result.score}%</span>
                            <span className="score-label">Score</span>
                        </div>
                    </div>

                    <div className="result-stats">
                        <div className="result-stat">
                            <span className="stat-icon">✅</span>
                            <span className="stat-value">{result.correctAnswers}</span>
                            <span className="stat-label">Correct</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-icon">❌</span>
                            <span className="stat-value">{result.wrongAnswers}</span>
                            <span className="stat-label">Wrong</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-icon">⏭️</span>
                            <span className="stat-value">{result.unanswered}</span>
                            <span className="stat-label">Skipped</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-icon">⏱️</span>
                            <span className="stat-value">{result.timeTaken}</span>
                            <span className="stat-label">Time</span>
                        </div>
                    </div>
                </Card>

                {/* Strengths & Weaknesses */}
                <div className="result-grid">
                    <Card className="analysis-card">
                        <h3 className="text-section-title">
                            <span className="section-icon">💪</span> Strengths
                        </h3>
                        <ul className="analysis-list success">
                            {result.strengths.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="analysis-card">
                        <h3 className="text-section-title">
                            <span className="section-icon">📈</span> Areas to Improve
                        </h3>
                        <ul className="analysis-list warning">
                            {result.weaknesses.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* AI Analysis */}
                {result.aiAnalysis && (
                    <Card className="ai-analysis-card">
                        <h3 className="text-section-title">
                            <span className="section-icon">🤖</span> AI Analysis
                        </h3>
                        <p className="ai-feedback">{result.aiAnalysis.overallFeedback}</p>

                        {result.aiAnalysis.topicSuggestions?.length > 0 && (
                            <div className="topic-suggestions">
                                <h4 className="text-card-title mt-3 mb-2">Suggested Topics to Review</h4>
                                <div className="suggestions-list">
                                    {result.aiAnalysis.topicSuggestions.map((suggestion, index) => (
                                        <div key={index} className="suggestion-item">
                                            <span className="suggestion-topic">{suggestion.topic}</span>
                                            <span className="text-meta">{suggestion.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Recommendations */}
                <section className="result-section">
                    <h3 className="text-section-title mb-2">Recommended Next Steps</h3>
                    <div className="recommendations-list">
                        {result.recommendations.map((rec, index) => (
                            <Card key={index} className="recommendation-item">
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
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <div className="result-actions">
                    <Link to="/subjects">
                        <Button variant="primary" size="lg">
                            Take Another Test
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResultPage;
