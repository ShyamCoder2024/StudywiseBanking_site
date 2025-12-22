import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, ArrowLeft, Clock, Target, SkipForward } from 'lucide-react';
import api from '../../services/api';
import './TestReviewPage.css';

export function TestReviewPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReview();
    }, [attemptId]);

    const fetchReview = async () => {
        try {
            const response = await api.get(`/attempts/${attemptId}/review`);
            if (response.data.success) {
                setReviewData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch review:', error);
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

    if (!reviewData) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <h3>Unable to load test review</h3>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index); // A, B, C, D...
    };

    return (
        <div className="page test-review-page">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <button className="back-nav" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Back to Results
                    </button>
                </motion.div>

                {/* Header */}
                <motion.div
                    className="review-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-page-title">{reviewData.quizTitle}</h1>
                    <p className="text-secondary">Review your answers</p>

                    <div className="review-stats">
                        <div className="stat-item correct">
                            <CheckCircle size={20} />
                            <span>{reviewData.correctAnswers} Correct</span>
                        </div>
                        <div className="stat-item wrong">
                            <XCircle size={20} />
                            <span>{reviewData.wrongAnswers} Wrong</span>
                        </div>
                        <div className="stat-item skipped">
                            <SkipForward size={20} />
                            <span>{reviewData.unanswered} Skipped</span>
                        </div>
                        <div className="stat-item time">
                            <Clock size={20} />
                            <span>{reviewData.timeTaken}</span>
                        </div>
                        <div className="stat-item score">
                            <Target size={20} />
                            <span>{reviewData.score}%</span>
                        </div>
                    </div>
                </motion.div>

                {/* Questions */}
                <div className="questions-list">
                    {reviewData.questions.map((q, index) => (
                        <motion.div
                            key={q.questionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card className={`question-review-card ${q.isCorrect === true ? 'correct' : q.isCorrect === false ? 'wrong' : 'skipped'}`}>
                                <div className="question-header">
                                    <span className="question-number">Q{q.questionNumber}</span>
                                    <span className={`status-badge ${q.isCorrect === true ? 'correct' : q.isCorrect === false ? 'wrong' : 'skipped'}`}>
                                        {q.isCorrect === true ? (
                                            <><CheckCircle size={14} /> Correct</>
                                        ) : q.isCorrect === false ? (
                                            <><XCircle size={14} /> Wrong</>
                                        ) : (
                                            <><SkipForward size={14} /> Skipped</>
                                        )}
                                    </span>
                                </div>

                                <div className="question-text">
                                    {q.questionText}
                                </div>

                                {q.options && q.options.length > 0 && (
                                    <div className="options-list">
                                        {q.options.map((option, optIndex) => {
                                            const isStudentAnswer = q.studentAnswer === option;
                                            const isCorrectAnswer = q.correctAnswer === option;

                                            let optionClass = '';
                                            if (isCorrectAnswer) optionClass = 'correct-answer';
                                            else if (isStudentAnswer && !isCorrectAnswer) optionClass = 'wrong-answer';

                                            return (
                                                <div key={optIndex} className={`option-item ${optionClass}`}>
                                                    <span className="option-label">{getOptionLabel(optIndex)}</span>
                                                    <span className="option-text">{option}</span>
                                                    {isCorrectAnswer && (
                                                        <CheckCircle size={16} className="option-icon correct" />
                                                    )}
                                                    {isStudentAnswer && !isCorrectAnswer && (
                                                        <XCircle size={16} className="option-icon wrong" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.studentAnswer && !q.options?.length && (
                                    <div className="descriptive-answer">
                                        <strong>Your Answer:</strong>
                                        <p>{q.studentAnswer}</p>
                                    </div>
                                )}

                                {q.explanation && (
                                    <div className="explanation">
                                        <strong>💡 Explanation:</strong>
                                        <p>{q.explanation}</p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Actions */}
                <motion.div
                    className="review-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button variant="primary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}

export default TestReviewPage;
