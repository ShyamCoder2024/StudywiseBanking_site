import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Clock, FileText, Award, CheckCircle2,
    ArrowRight, Zap, BookOpen, Target, TrendingUp,
    AlertCircle, ChevronRight
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import api from '../../services/api';
import './TestCenterPage.css';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryHover: '#7A66A8',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    successLight: '#E6F5F7',
    warning: '#ED6771',
    warningLight: '#FCE6E8',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB'
};

export function TestCenterPage() {
    const navigate = useNavigate();
    const [activeQuizzes, setActiveQuizzes] = useState([]);
    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchQuizzes();
        // Removed auto-refresh - backend filtering is reliable
        // Users can manually refresh the page if needed
    }, []);

    const fetchQuizzes = async () => {
        try {
            // Add cache-busting timestamp to ensure fresh data
            const timestamp = new Date().getTime();
            const response = await api.get(`/student/quizzes/all?_t=${timestamp}`);
            if (response.data.success) {
                setActiveQuizzes(response.data.data.active || []);
                setCompletedQuizzes(response.data.data.completed || []);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
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

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return { bg: BRAND.successLight, color: '#065F46' };
            case 'Medium': return { bg: '#FEF9C3', color: '#854D0E' };
            case 'Hard': return { bg: BRAND.warningLight, color: '#991B1B' };
            default: return { bg: BRAND.primaryLight, color: BRAND.primary };
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (loading) {
        return (
            <div className="test-center-loading">
                <Loader />
                <p style={{ marginTop: '20px', color: 'var(--color-text-secondary)' }}>Loading Tests...</p>
            </div>
        );
    }

    const displayQuizzes = activeTab === 'active' ? activeQuizzes : completedQuizzes;

    return (
        <div className="test-center-page">
            {/* Hero Section */}
            <div className="test-center-hero">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="hero-icon">
                        <Target size={48} />
                    </div>
                    <h1>Test Center</h1>
                    <p>Challenge yourself with quizzes and track your progress</p>

                    <div className="hero-stats">
                        <div className="stat-pill">
                            <Zap size={18} />
                            <span>{activeQuizzes.length} Active Tests</span>
                        </div>
                        <div className="stat-pill completed">
                            <CheckCircle2 size={18} />
                            <span>{completedQuizzes.length} Completed</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="test-center-tabs">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <Play size={18} />
                    Active Tests
                    {activeQuizzes.length > 0 && (
                        <span className="tab-badge">{activeQuizzes.length}</span>
                    )}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <CheckCircle2 size={18} />
                    Completed
                    {completedQuizzes.length > 0 && (
                        <span className="tab-badge completed">{completedQuizzes.length}</span>
                    )}
                </button>
            </div>

            {/* Quiz Grid */}
            <div className="test-center-container">
                <AnimatePresence mode="wait">
                    {displayQuizzes.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            className="quiz-grid"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0 }}
                        >
                            {displayQuizzes.map((quiz) => {
                                const diffStyle = getDifficultyColor(quiz.difficulty);
                                return (
                                    <motion.div
                                        key={quiz._id}
                                        className={`quiz-card ${activeTab === 'completed' ? 'completed' : ''}`}
                                        variants={item}
                                        whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {/* Card Header */}
                                        <div className="card-header">
                                            <div className="subject-tag">
                                                <BookOpen size={14} />
                                                {quiz.subjectName}
                                            </div>
                                            <span
                                                className="difficulty-badge"
                                                style={{ backgroundColor: diffStyle.bg, color: diffStyle.color }}
                                            >
                                                {quiz.difficulty}
                                            </span>
                                        </div>

                                        {/* Card Body */}
                                        <div className="card-body">
                                            <h3 className="quiz-title">{quiz.title}</h3>
                                            <p className="quiz-topic">{quiz.topicName}</p>

                                            <div className="quiz-meta">
                                                <div className="meta-item">
                                                    <FileText size={16} />
                                                    <span>{quiz.questionCount} Questions</span>
                                                </div>
                                                <div className="meta-item">
                                                    <Clock size={16} />
                                                    <span>{quiz.duration} mins</span>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="quiz-tags">
                                                {quiz.isMockTest && (
                                                    <span className="tag mock">Mock Test</span>
                                                )}
                                                {quiz.isBigQuiz && (
                                                    <span className="tag big">Big Quiz</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="card-footer">
                                            {activeTab === 'active' ? (
                                                <button
                                                    className="start-btn"
                                                    onClick={() => handleStartQuiz(quiz._id)}
                                                >
                                                    <Play size={18} fill="white" />
                                                    Start Test
                                                    <ChevronRight size={18} />
                                                </button>
                                            ) : (
                                                <div className="completed-footer">
                                                    <div className="score-display">
                                                        <Award size={20} />
                                                        <span className="score">{quiz.score}%</span>
                                                    </div>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => handleViewResult(quiz.attemptId)}
                                                    >
                                                        View Result
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="empty-icon">
                                {activeTab === 'active' ? (
                                    <AlertCircle size={64} />
                                ) : (
                                    <CheckCircle2 size={64} />
                                )}
                            </div>
                            <h3>
                                {activeTab === 'active'
                                    ? 'No Active Tests Available'
                                    : 'No Completed Tests Yet'}
                            </h3>
                            <p>
                                {activeTab === 'active'
                                    ? 'New tests will appear here when your tutor publishes them.'
                                    : 'Complete some tests to see your results here.'}
                            </p>
                            {activeTab === 'completed' && activeQuizzes.length > 0 && (
                                <button
                                    className="empty-action-btn"
                                    onClick={() => setActiveTab('active')}
                                >
                                    View Active Tests
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TestCenterPage;
