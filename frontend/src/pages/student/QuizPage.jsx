import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import api from '../../services/api';
import './QuizPage.css';

export function QuizPage() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Autosave every 30 seconds
    useEffect(() => {
        if (!quiz) return;

        const autosaveInterval = setInterval(() => {
            autosaveAnswers();
        }, 30000);

        return () => clearInterval(autosaveInterval);
    }, [quiz, answers]);

    const fetchQuiz = async () => {
        try {
            const response = await api.get(`/quizzes/${quizId}/start`);
            if (response.data.success) {
                setQuiz(response.data.data.quiz);
                setQuestions(response.data.data.questions);
                setTimeLeft(response.data.data.quiz.duration * 60);
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
            // Mock data for demo
            setQuiz({ title: 'Number Series - Basics', duration: 15 });
            setQuestions([
                {
                    _id: '1',
                    type: 'mcq',
                    text: 'What comes next in the series: 2, 4, 8, 16, ?',
                    options: ['24', '32', '30', '28'],
                },
                {
                    _id: '2',
                    type: 'mcq',
                    text: 'Find the missing number: 1, 1, 2, 3, 5, 8, ?',
                    options: ['11', '12', '13', '14'],
                },
                {
                    _id: '3',
                    type: 'descriptive',
                    text: 'Explain the pattern in the Fibonacci sequence and its applications in real life.',
                },
            ]);
            setTimeLeft(15 * 60);
        } finally {
            setLoading(false);
        }
    };

    const autosaveAnswers = async () => {
        try {
            await api.post(`/quizzes/${quizId}/autosave`, { answers });
            console.log('Answers autosaved');
        } catch (error) {
            console.error('Autosave failed:', error);
        }
    };

    const handleSelectOption = (questionId, option) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const handleTextAnswer = (questionId, text) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: text,
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit && !showConfirmSubmit) {
            setShowConfirmSubmit(true);
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
            if (response.data.success) {
                navigate(`/result/${response.data.data.attemptId}`);
            }
        } catch (error) {
            console.error('Submit failed:', error);
            // Demo navigation
            navigate('/result/demo-attempt-id');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).filter((key) => answers[key]).length;
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="quiz-page">
            {/* Sticky Header */}
            <header className="quiz-header">
                <div className="container quiz-header-content">
                    <div className="quiz-title">
                        <h1 className="text-card-title">{quiz?.title}</h1>
                        <span className="text-meta">
                            {getAnsweredCount()}/{questions.length} answered
                        </span>
                    </div>
                    <div className={`quiz-timer ${timeLeft <= 60 ? 'warning' : ''}`}>
                        <span>⏱️</span>
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </header>

            {/* Question Area */}
            <main className="quiz-main">
                <div className="container">
                    <div className="quiz-progress">
                        <div className="progress">
                            <div
                                className="progress-bar"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                        <span className="text-meta">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                    </div>

                    <div className="quiz-question">
                        <p className="quiz-question-text">{currentQuestion.text}</p>

                        {currentQuestion.type === 'mcq' ? (
                            <div className="quiz-options">
                                {currentQuestion.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`quiz-option ${answers[currentQuestion._id] === option ? 'selected' : ''}`}
                                        onClick={() => handleSelectOption(currentQuestion._id, option)}
                                    >
                                        <div className="quiz-option-radio"></div>
                                        <span>{option}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="quiz-descriptive">
                                <Textarea
                                    name={`answer-${currentQuestion._id}`}
                                    value={answers[currentQuestion._id] || ''}
                                    onChange={(e) => handleTextAnswer(currentQuestion._id, e.target.value)}
                                    placeholder="Write your answer here..."
                                    rows={8}
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="quiz-navigation">
                        <Button
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                        >
                            ← Previous
                        </Button>

                        {currentIndex < questions.length - 1 ? (
                            <Button variant="primary" onClick={handleNext}>
                                Next →
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                onClick={() => handleSubmit(false)}
                                loading={submitting}
                            >
                                Submit Quiz
                            </Button>
                        )}
                    </div>

                    {/* Question Navigation Pills */}
                    <div className="quiz-pills">
                        {questions.map((q, index) => (
                            <button
                                key={q._id}
                                className={`quiz-pill ${currentIndex === index ? 'active' : ''} ${answers[q._id] ? 'answered' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3 className="text-section-title">Submit Quiz?</h3>
                        <p className="text-secondary mb-3">
                            You have answered {getAnsweredCount()} out of {questions.length} questions.
                            {getAnsweredCount() < questions.length && (
                                <span className="text-warning"> Some questions are unanswered.</span>
                            )}
                        </p>
                        <div className="modal-actions">
                            <Button variant="secondary" onClick={() => setShowConfirmSubmit(false)}>
                                Continue Quiz
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleSubmit(true)}
                                loading={submitting}
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizPage;
