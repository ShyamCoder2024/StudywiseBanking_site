import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Activity, TrendingUp, Award, Target, BookOpen, Clock,
    CheckCircle2, ArrowRight, Zap, BarChart2, Calendar,
    ClipboardList, AlertCircle, Play, Flame, Star, Youtube, GraduationCap, X, Sparkles, Bell
} from 'lucide-react';
import { AIAnalysis } from '../../components/ai/AIAnalysis';
import { Leaderboard } from '../../components/leaderboard/Leaderboard';
import { AvatarDisplay } from '../../components/ui/AvatarDisplay';
import api from '../../services/api';
import './StudentDashboard.css';

// Mock Data for testing (used when student has no real attempts)
const MOCK_DASHBOARD_DATA = {
    userStats: {
        points: 2450,
        rank: 12,
        streak: 8,
        accuracy: 78,
        examsCleared: 2,
        weakAreas: ['Time & Work', 'Puzzles']
    },
    upcomingExam: {
        name: "SBI PO Prelims",
        daysLeft: 14,
        date: "Oct 24, 2025"
    },
    tutorVideos: [
        { id: 101, title: "Speed Math Tricks - multiply in 5s", thumbnail: "https://img.youtube.com/vi/ABCD123/hqdefault.jpg", views: "12k" },
        { id: 102, title: "Current Affairs - Dec Week 2", thumbnail: "https://img.youtube.com/vi/XYZ987/hqdefault.jpg", views: "8k" }
    ],
    courses: [
        { id: 'c1', title: "Complete Banking Batch 2025", progress: 45, total: 100 },
        { id: 'c2', title: "Data Interpretation Pro", progress: 12, total: 50 }
    ],
    performance: [65, 72, 58, 80, 75, 82, 78],
};

export function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Dashboard data state (real + mock fallback)
    const [dashboardData, setDashboardData] = useState(null);
    const [todos, setTodos] = useState([]);
    const [newQuizzes, setNewQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchTodos();
        fetchNewQuizzes();
    }, []);

    // Fetch real dashboard data from backend
    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/student/dashboard');
            setDashboardData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Will use mock data as fallback
        }
    };

    const fetchTodos = async () => {
        try {
            const res = await api.get('/student/global-tasks');
            setTodos(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch new quizzes that user hasn't seen yet
    const fetchNewQuizzes = async () => {
        try {
            const res = await api.get('/student/quizzes/all');
            const activeQuizzes = res.data.data?.active || [];
            // Filter quizzes that are not expired
            const pendingQuizzes = activeQuizzes.filter(q => !q.isExpired);
            setNewQuizzes(pendingQuizzes);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        }
    };

    // Computed values: Use real data if available, otherwise mock
    const hasRealData = dashboardData && dashboardData.totalAttempts > 0;

    const stats = {
        xpPoints: hasRealData ? dashboardData.xpPoints : MOCK_DASHBOARD_DATA.userStats.points,
        streak: hasRealData ? dashboardData.streakCount : MOCK_DASHBOARD_DATA.userStats.streak,
        accuracy: hasRealData ? dashboardData.accuracy : MOCK_DASHBOARD_DATA.userStats.accuracy,
    };

    const performanceData = hasRealData && dashboardData.performanceGraph?.length > 0
        ? dashboardData.performanceGraph.map(p => p.score)
        : MOCK_DASHBOARD_DATA.performance;

    // Get user's target exam (from their profile)
    const targetExam = user?.targetExam || 'SBI PO Prelims';

    // Calculate days until a mock exam date (for countdown display)
    const getExamCountdown = () => {
        // If there are pending quizzes, show countdown until first one expires
        if (newQuizzes.length > 0 && newQuizzes[0].expiresAt) {
            const expiresAt = new Date(newQuizzes[0].expiresAt);
            const now = new Date();
            const diff = expiresAt - now;
            const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            return { days, hours, hasQuiz: true };
        }
        return { days: 14, hours: 0, hasQuiz: false };
    };

    const examCountdown = getExamCountdown();


    const toggleTodo = async (id) => {
        try {
            // Optimistic update
            setTodos(todos.map(t => t._id === id ? { ...t, isCompleted: !t.isCompleted } : t));
            await api.patch(`/student/global-tasks/${id}/toggle`);
        } catch (error) {
            console.error(error);
            fetchTodos(); // Revert on error
        }
    };

    // Grid Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const tile = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 12 }
        }
    };

    return (
        <div className="bento-dashboard">
            <div className="dashboard-container">
                {/* Header Welcome */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-header-row">
                    <div>
                        <h1>Hello, {user?.firstName || 'Student'}! 👋</h1>
                        <p>Keep pushing! Your goal is closer than you think.</p>
                    </div>
                    <div className="header-stats-pill">
                        <div className="pill-item">
                            <Flame size={18} className="text-orange" />
                            <span>{stats.streak} Day Streak</span>
                        </div>
                        <div className="pill-item">
                            <Star size={18} className="text-yellow" />
                            <span>{stats.xpPoints} XP</span>
                        </div>
                    </div>
                </motion.div>

                {/* BENTO GRID LAYOUT */}
                <motion.div
                    className="bento-grid"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {/* 1. Hero / Exam Countdown (Large Tile) */}
                    <motion.div className="bento-tile hero-tile clickable" variants={tile} onClick={() => navigate('/tests')}>
                        <div className="hero-bg-overlay"></div>

                        {/* New Quiz Notification Badge */}
                        {newQuizzes.length > 0 && (
                            <div className="quiz-notification-badge">
                                <span className="notification-dot"></span>
                                <span className="notification-count">{newQuizzes.length} New</span>
                            </div>
                        )}

                        <div className="hero-content-bento">
                            <div className="exam-countdown">
                                <span className="label">
                                    {newQuizzes.length > 0 ? 'New Test Available!' : 'Upcoming Exam'} | {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <h2>{targetExam.toUpperCase()}</h2>
                                <div className="countdown-timer">
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{examCountdown.days}</span>
                                        </div>
                                        <span className="unit">{newQuizzes.length > 0 ? 'Days Left' : 'Days'}</span>
                                    </div>
                                    <div className="time-sep">:</div>
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{examCountdown.hours || '--'}</span>
                                        </div>
                                        <span className="unit">Hrs</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-action">
                                <div className="btn-action-glow">
                                    {newQuizzes.length > 0 ? 'Take Test' : 'Start Test'} <Play size={16} fill="white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. AI Coach Card - THE VOID / ULTRA PREMIUM DESIGN */}
                    <motion.div
                        className="bento-tile ai-coach-card clickable"
                        variants={tile}
                        onClick={() => navigate('/analysis')}
                        whileHover="hover"
                        initial="rest"
                    >
                        {/* Animated Deep Background */}
                        <div className="ai-coach-bg">
                            <div className="ai-orb-1"></div>
                            <div className="ai-orb-2"></div>
                            <div className="ai-grid-overlay"></div>
                        </div>

                        <div className="ai-coach-content">
                            <div className="ai-coach-header">
                                <div className="coach-badge">
                                    <Sparkles size={14} className="sparkle-icon" />
                                    <span>AI COACH</span>
                                </div>
                                <motion.div
                                    className="coach-arrow"
                                    variants={{
                                        rest: { x: 0, opacity: 0.6 },
                                        hover: { x: 4, opacity: 1 }
                                    }}
                                >
                                    <ArrowRight size={16} />
                                </motion.div>
                            </div>

                            <div className="ai-coach-main">
                                <div className="coach-ring-container">
                                    <svg viewBox="0 0 100 100" className="coach-ring">
                                        {/* Glow Filter */}
                                        <defs>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#a78bfa" />
                                                <stop offset="100%" stopColor="#c084fc" />
                                            </linearGradient>
                                        </defs>

                                        <circle cx="50" cy="50" r="42" className="coach-track" />
                                        <motion.circle
                                            cx="50" cy="50" r="42"
                                            className="coach-progress"
                                            stroke="url(#ringGradient)"
                                            strokeDasharray={264}
                                            initial={{ strokeDashoffset: 264 }}
                                            animate={{ strokeDashoffset: 264 - (264 * stats.accuracy) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            filter="url(#glow)"
                                        />
                                    </svg>
                                    <div className="coach-score">
                                        <span className="coach-num">{stats.accuracy}%</span>
                                        <span className="coach-lbl">Accuracy</span>
                                    </div>
                                </div>

                                <div className="coach-insights">
                                    <div className="coach-item">
                                        <span className="coach-dot strong"></span>
                                        <div className="coach-text">
                                            <span className="coach-t-label">Strong</span>
                                            <span className="coach-t-val">Reasoning</span>
                                        </div>
                                    </div>
                                    <div className="coach-item">
                                        <span className="coach-dot focus"></span>
                                        <div className="coach-text">
                                            <span className="coach-t-label">Focus</span>
                                            <span className="coach-t-val">Math</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    {/* 3. Stats Rows (Clickable) - Go to Performance */}
                    <motion.div className="bento-tile stats-tile-1 clickable" variants={tile} onClick={() => navigate('/performance')}>
                        <div className="stat-top">
                            <Target size={24} className="text-coral" />
                            <div className="trend-up">{hasRealData ? 'Real Data' : 'Demo'}</div>
                        </div>
                        <div className="stat-bottom">
                            <span className="stat-num">{stats.accuracy}%</span>
                            <span className="stat-lbl">Accuracy Rate</span>
                        </div>
                    </motion.div>

                    <motion.div className="bento-tile stats-tile-2 clickable" variants={tile} onClick={() => navigate('/analysis')}>
                        <div className="stat-top">
                            <BookOpen size={24} className="text-teal" />
                            <span className="tag-micro">AI Suggested</span>
                        </div>
                        <div className="stat-bottom">
                            <span className="stat-num">{dashboardData?.suggestedStudyHours || '2-3'}h</span>
                            <span className="stat-lbl">Daily Study</span>
                        </div>
                    </motion.div>

                    {/* 4. Tutor Videos (New Section) */}
                    <motion.div className="bento-tile video-tile clickable" variants={tile} onClick={() => navigate('/videos')}>
                        <div className="tile-header">
                            <h3><Youtube size={20} className="text-red" /> Tutor's Picks</h3>
                        </div>
                        <div className="video-list-mini">
                            <div className="video-card-mini">
                                <div className="play-icon"><Play size={20} fill="white" /></div>
                                <div className="video-info">
                                    <h4>Math Tricks: 5s Multiply</h4>
                                    <span>Added Today</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 5. My Courses (New Section) */}
                    <motion.div className="bento-tile course-tile clickable" variants={tile} onClick={() => navigate('/subjects')}>
                        <div className="tile-header">
                            <h3><GraduationCap size={20} className="text-blue" /> My Courses</h3>
                        </div>
                        <div className="course-progress-list">
                            {MOCK_DASHBOARD_DATA.courses.map(course => (
                                <div key={course.id} className="course-item-mini">
                                    <div className="course-info-row">
                                        <span className="c-name">{course.title}</span>
                                        <span className="c-pct">{course.progress}%</span>
                                    </div>
                                    <div className="progress-bar-track">
                                        <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 6. Todo Sidebar - Interactive */}
                    <motion.div className="bento-tile todo-tile clickable" variants={tile} onClick={() => navigate('/tasks')}>
                        <div className="tile-header">
                            <h3><ClipboardList size={20} /> Today's Plan</h3>
                            <span className="badge">{todos.filter(t => !t.done).length}</span>
                        </div>
                        <div className="todo-list-bento">
                            {todos.length > 0 ? todos.map(task => (
                                <div key={task._id} className="todo-item-bento">
                                    <div
                                        className={`checkbox ${task.isCompleted ? 'checked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card navigation
                                            toggleTodo(task._id);
                                        }}
                                    >
                                        {task.isCompleted && <CheckCircle2 size={14} />}
                                    </div>
                                    <div className="todo-text">
                                        <p className={task.isCompleted ? 'strike' : ''}>{task.content}</p>
                                        <span className={`todo-tag todo-tag-${(task.tag || 'General').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {task.tag || 'General'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-gray-400 text-xs py-4">No tasks assigned.</div>
                            )}
                        </div>
                    </motion.div>

                    {/* 7. Performance Graph */}
                    <motion.div className="bento-tile graph-tile clickable" variants={tile} onClick={() => navigate('/performance')}>
                        <div className="tile-header">
                            <h3><BarChart2 size={20} /> Performance Trend</h3>
                        </div>
                        <div className="graph-bars">
                            {performanceData.map((score, i) => (
                                <div key={i} className="bar-wrapper">
                                    <motion.div
                                        className="graph-bar"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${score}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1) }}
                                    />
                                    <span className="bar-label">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>


                    {/* 8. Leaderboard */}
                    <motion.div className="bento-tile rank-tile clickable" variants={tile} onClick={() => navigate('/leaderboard')}>
                        <Leaderboard limit={10} />
                    </motion.div>
                </motion.div>
            </div>

            <BottomNav />
        </div >
    );
}

function BottomNav() {
    const navigate = useNavigate();
    const navItems = [
        { id: '/dashboard', icon: <Activity size={20} />, label: 'Home' },
        { id: '/subjects', icon: <BookOpen size={20} />, label: 'Subjects' },
        { id: '/tasks', icon: <CheckCircle2 size={20} />, label: 'Tasks' },
        { id: '/analysis', icon: <Zap size={20} />, label: 'AI' },
        { id: '/leaderboard', icon: <Award size={20} />, label: 'Rank' },
    ];

    return (
        <div className="mobile-bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`nav-item ${window.location.pathname === item.id ? 'active' : ''}`}
                    onClick={() => navigate(item.id)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
}

export default StudentDashboard;
