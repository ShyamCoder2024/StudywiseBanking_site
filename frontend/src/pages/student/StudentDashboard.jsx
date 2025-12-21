import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Activity, TrendingUp, Award, Target, BookOpen, Clock,
    CheckCircle2, ArrowRight, Zap, BarChart2, Calendar,
    ClipboardList, AlertCircle, Play, Flame, Star, Youtube, GraduationCap, X
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchTodos();
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
                        <div className="hero-content-bento">
                            <div className="exam-countdown">
                                <span className="label">Upcoming Exam | {MOCK_DASHBOARD_DATA.upcomingExam.date}</span>
                                <h2>{MOCK_DASHBOARD_DATA.upcomingExam.name}</h2>
                                <div className="countdown-timer">
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{MOCK_DASHBOARD_DATA.upcomingExam.daysLeft}</span>
                                        </div>
                                        <span className="unit">Days</span>
                                    </div>
                                    <div className="time-sep">:</div>
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">--</span>
                                        </div>
                                        <span className="unit">Hrs</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hero-action">
                                <div className="btn-action-glow">
                                    Start Test <Play size={16} fill="white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. AI Insights Card - Premium Design with Animations */}
                    <motion.div
                        className="bento-tile dashboard-ai-card clickable"
                        variants={tile}
                        onClick={() => navigate('/analysis')}
                        whileHover={{ y: -6 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Animated gradient background */}
                        <div className="dashboard-ai-bg">
                            <motion.div
                                className="ai-bg-glow"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="dashboard-ai-content">
                            <div className="dashboard-ai-header">
                                <motion.div
                                    className="ai-spark-icon"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    <Zap size={18} />
                                </motion.div>
                                <span>AI Insights</span>
                                <motion.span whileHover={{ x: 4 }}>
                                    <ArrowRight size={16} className="header-arrow" />
                                </motion.span>
                            </div>

                            <div className="dashboard-ai-body">
                                <div className="ai-accuracy-display">
                                    <motion.div
                                        className="accuracy-circle"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.3 }}
                                    >
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" className="circle-track" />
                                            <motion.circle
                                                cx="50" cy="50" r="42"
                                                className="circle-progress"
                                                strokeDasharray={264}
                                                initial={{ strokeDashoffset: 264 }}
                                                animate={{ strokeDashoffset: 264 - (264 * stats.accuracy) / 100 }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                            />
                                        </svg>
                                        <div className="accuracy-text">
                                            <span className="accuracy-number">{stats.accuracy}%</span>
                                            <span className="accuracy-label">Accuracy</span>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="ai-insights-list">
                                    <motion.div
                                        className="insight-row strength"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <span className="insight-icon">✓</span>
                                        <span className="insight-text">Strong: <strong>Reasoning</strong></span>
                                    </motion.div>
                                    <motion.div
                                        className="insight-row focus"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <span className="insight-icon">!</span>
                                        <span className="insight-text">Focus: <strong>Math</strong></span>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                className="dashboard-ai-cta"
                                whileHover={{ scale: 1.02 }}
                            >
                                <span>View Full Analysis</span>
                                <ArrowRight size={14} />
                            </motion.div>
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
