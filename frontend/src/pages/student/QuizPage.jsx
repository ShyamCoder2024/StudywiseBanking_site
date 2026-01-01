import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Loader } from '../../components/ui/Loader';
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
    const [startTime, setStartTime] = useState(null); // Track actual quiz start time
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [accessError, setAccessError] = useState(null); // For restricted access

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
                setStartTime(new Date().toISOString()); // Record actual start time
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);

            // Check if quiz was already completed
            if (error.response?.data?.alreadyCompleted) {
                const attemptId = error.response.data.attemptId;
                alert('You have already completed this test. Redirecting to your results...');
                navigate(`/result/${attemptId}`);
                return;
            }

            // Check if quiz is restricted (paid only, course required, etc.)
            if (error.response?.data?.restricted) {
                setAccessError({
                    type: error.response.data.restrictionType || 'restricted',
                    message: error.response.data.message || 'You do not have access to this test.',
                    requiredCourse: error.response.data.requiredCourse
                });
                setLoading(false);
                return;
            }

            // Other API errors - show message inline
            if (error.response?.data?.message) {
                setAccessError({
                    type: 'error',
                    message: error.response.data.message
                });
                setLoading(false);
                return;
            }

            // Mock data for demo (development only)
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
        } catch (error) {
            // Silently fail autosave
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
            // Send answers and startTime for accurate time tracking
            const response = await api.post(`/quizzes/${quizId}/submit`, {
                answers,
                startTime // Send the actual start time to backend
            });
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
                <Loader />
            </div>
        );
    }

    // Access Error Screen - Show enrollment prompt instead of crashing
    if (accessError) {
        return (
            <div className="quiz-page">
                <div className="quiz-access-error">
                    <div className="access-error-card">
                        <div className="access-error-icon">
                            {accessError.type === 'paid_only' ? '🔒' : accessError.type === 'course_required' ? '📚' : '⚠️'}
                        </div>
                        <h2 className="access-error-title">
                            {accessError.type === 'paid_only' ? 'Premium Content' :
                                accessError.type === 'course_required' ? 'Course Enrollment Required' :
                                    'Access Restricted'}
                        </h2>
                        <p className="access-error-message">{accessError.message}</p>
                        {accessError.type === 'paid_only' && (
                            <p className="access-error-hint">
                                Please enroll in a course to access premium tests and unlock exclusive content.
                            </p>
                        )}
                        <div className="access-error-actions">
                            <Button variant="secondary" onClick={() => navigate(-1)}>
                                ← Go Back
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const message = encodeURIComponent(`Hi! I need to enroll in a course to access premium tests. Please help me with enrollment.`);
                                    const whatsappUrl = `https://wa.me/919518329260?text=${message}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                            >
                                📱 Contact on WhatsApp to Enroll
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    // Guard against empty questions array
    if (!currentQuestion) {
        return (
            <div className="quiz-page">
                <div className="quiz-access-error">
                    <div className="access-error-card">
                        <div className="access-error-icon">❌</div>
                        <h2 className="access-error-title">Quiz Not Available</h2>
                        <p className="access-error-message">This quiz could not be loaded. Please try again later.</p>
                        <div className="access-error-actions">
                            <Button variant="primary" onClick={() => navigate('/tests')}>
                                Back to Test Center
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
