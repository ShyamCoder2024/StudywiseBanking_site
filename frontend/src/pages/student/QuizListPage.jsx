import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Play, Eye, Clock, FileQuestion } from 'lucide-react';
import api from '../../services/api';
import './ContentPages.css';

export function QuizListPage() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [topicId]);

    const fetchQuizzes = async () => {
        try {
            const response = await api.get(`/student/topics/${topicId}/quizzes`);
            if (response.data.success) {
                setTopic(response.data.data.topic);
                setQuizzes(response.data.data.quizzes);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
    };

    const handleViewResult = (attemptId) => {
        navigate(`/result/${attemptId}`);
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
                <Link to={`/subjects/${topic?.subjectId || '1'}/topics`} className="back-nav">
                    ← Back to Topics
                </Link>

                <div className="page-header">
                    <h1 className="text-page-title">{topic?.name || 'Quizzes'}</h1>
                    <p className="text-secondary">Choose a quiz to practice</p>
                </div>

                <div className="content-grid quiz-grid">
                    {quizzes.map((quiz, index) => (
                        <motion.div
                            key={quiz._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`quiz-card ${quiz.isCompleted ? 'completed' : ''}`}>
                                <div className="quiz-card-header">
                                    <div className="quiz-card-info">
                                        <h3 className="text-card-title">{quiz.title}</h3>
                                        <div className="quiz-badges">
                                            <span className={`badge badge-${quiz.difficulty === 'Easy' ? 'success' : quiz.difficulty === 'Medium' ? 'primary' : 'warning'}`}>
                                                {quiz.difficulty}
                                            </span>
                                            {quiz.isCompleted && (
                                                <span className="badge badge-completed">
                                                    <CheckCircle size={12} /> Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-card-meta">
                                    <div className="quiz-meta-item">
                                        <FileQuestion size={16} />
                                        <span>{quiz.questionCount} Questions</span>
                                    </div>
                                    <div className="quiz-meta-item">
                                        <Clock size={16} />
                                        <span>{quiz.duration} mins</span>
                                    </div>
                                </div>

                                {quiz.isCompleted && quiz.score !== null && (
                                    <div className="quiz-score-display">
                                        <span className={`score-badge ${quiz.score >= 70 ? 'high' : quiz.score >= 50 ? 'medium' : 'low'}`}>
                                            Score: {quiz.score}%
                                        </span>
                                    </div>
                                )}

                                <div className="quiz-card-footer">
                                    {quiz.isCompleted ? (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleViewResult(quiz.attemptId)}
                                            className="view-result-btn"
                                        >
                                            <Eye size={16} />
                                            View Results
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            onClick={() => handleStartQuiz(quiz._id)}
                                        >
                                            <Play size={16} />
                                            Start Quiz
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {quizzes.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3 className="text-section-title">No Quizzes Available</h3>
                        <p className="text-secondary">Quizzes will be added soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizListPage;
