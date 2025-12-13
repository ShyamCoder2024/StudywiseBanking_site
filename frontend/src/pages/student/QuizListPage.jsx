import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
            const response = await api.get(`/topics/${topicId}/quizzes`);
            if (response.data.success) {
                setTopic(response.data.data.topic);
                setQuizzes(response.data.data.quizzes);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            // Mock data
            setTopic({ name: 'Number Series', subjectId: '1' });
            setQuizzes([
                { _id: '1', title: 'Number Series - Basics', questionCount: 10, duration: 15, difficulty: 'Easy' },
                { _id: '2', title: 'Number Series - Intermediate', questionCount: 15, duration: 20, difficulty: 'Medium' },
                { _id: '3', title: 'Number Series - Advanced', questionCount: 20, duration: 30, difficulty: 'Hard' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quizId) => {
        navigate(`/quiz/${quizId}`);
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
                    <p className="text-secondary">Choose a quiz to start practicing</p>
                </div>

                <div className="content-grid">
                    {quizzes.map((quiz) => (
                        <Card key={quiz._id} className="quiz-card">
                            <div className="quiz-card-header">
                                <div className="quiz-card-info">
                                    <h3 className="text-card-title">{quiz.title}</h3>
                                    <span className={`badge badge-${quiz.difficulty === 'Easy' ? 'success' : quiz.difficulty === 'Medium' ? 'primary' : 'warning'}`}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="quiz-card-meta">
                                <div className="quiz-meta-item">
                                    <span>📝</span>
                                    <span>{quiz.questionCount} Questions</span>
                                </div>
                                <div className="quiz-meta-item">
                                    <span>⏱️</span>
                                    <span>{quiz.duration} mins</span>
                                </div>
                            </div>

                            <div className="quiz-card-footer">
                                <Button
                                    variant="primary"
                                    onClick={() => handleStartQuiz(quiz._id)}
                                >
                                    Start Quiz
                                </Button>
                            </div>
                        </Card>
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
