import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Target, BookOpen, CheckCircle2, ArrowRight, Zap,
    ClipboardList, Play, Flame, Star, GraduationCap, Sparkles
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
    const [todosLoaded, setTodosLoaded] = useState(false);
    const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 0, percent: 0 });
    const [newQuizzes, setNewQuizzes] = useState([]);
    const [examSettings, setExamSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    // Enrollment and courses state
    const [enrollment, setEnrollment] = useState({ isPaid: false, courses: [] });
    const [enrollmentLoaded, setEnrollmentLoaded] = useState(false);
    const [videoCourses, setVideoCourses] = useState([]);
    // AI Analysis data for AI Coach card
    const [aiAnalysis, setAiAnalysis] = useState(null);
    // Live countdown state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        let isMounted = true;

        // Fetch all data with individual error handling
        const fetchAllData = async () => {
            try {
                // OPTIMIZED: Fetch critical data first (fast endpoints)
                // AI Analysis is deferred to load AFTER page renders
                const results = await Promise.allSettled([
                    fetchDashboardData(isMounted),
                    fetchTodos(isMounted),
                    fetchNewQuizzes(isMounted),
                    fetchExamSettings(isMounted),
                    fetchEnrollment(isMounted),
                    fetchVideoCourses(isMounted)
                    // AI Analysis removed from initial load - loads separately below
                ]);

                // Log any failures for debugging
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.warn(`Dashboard API call ${index} failed: `, result.reason);
                    }
                });
            } catch (error) {
                console.error('Dashboard data fetch error:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // DEFERRED: Load AI Analysis AFTER page renders (non-blocking)
                    // This allows the dashboard to appear instantly
                    fetchAiAnalysis(isMounted);
                }
            }
        };

        fetchAllData();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []);

    // Add 'dashboard-page' class to body for hiding navbar on mobile
    useEffect(() => {
        document.body.classList.add('dashboard-page');
        return () => {
            document.body.classList.remove('dashboard-page');
        };
    }, []);

    // Live countdown timer - updates every second
    useEffect(() => {
        const calculateCountdown = () => {
            let targetDate = null;

            // Priority 1: Use examDateTime from admin settings
            if (examSettings?.examDateTime) {
                targetDate = new Date(examSettings.examDateTime);
            }
            // Priority 2: Use quiz expiry date (only if there are actual active quizzes)
            else if (newQuizzes.length > 0 && newQuizzes[0].expiresAt) {
                targetDate = new Date(newQuizzes[0].expiresAt);
            }
            // Default: 14 days from now as placeholder
            else {
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 14);
            }

            const now = new Date();
            const diff = Math.max(0, targetDate - now);

            return {
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            };
        };

        // Set initial countdown
        setCountdown(calculateCountdown());

        // Update every second for live countdown
        const interval = setInterval(() => {
            setCountdown(calculateCountdown());
        }, 1000);

        return () => clearInterval(interval);
    }, [examSettings, newQuizzes]);

    // Fetch real dashboard data from backend
    const fetchDashboardData = async (isMounted = true) => {
        try {
            const res = await api.get('/student/dashboard');
            if (isMounted) {
                setDashboardData(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Will use mock data as fallback
        }
    };

    const fetchTodos = async (isMounted = true) => {
        try {
            const res = await api.get('/student/global-tasks');
            if (isMounted) {
                setTodos(res.data.data || []);
                if (res.data.progress) {
                    setTaskProgress(res.data.progress);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (isMounted) {
                setTodosLoaded(true);
            }
        }
    };

    const fetchExamSettings = async (isMounted = true) => {
        try {
            const res = await api.get('/student/settings/upcoming_exam');
            if (isMounted && res.data.data) {
                setExamSettings(res.data.data);
            }
        } catch (error) {
            // Use default mock data
        }
    };

    const fetchNewQuizzes = async (isMounted = true) => {
        try {
            // Add cache-busting timestamp to ensure fresh data on every fetch
            // This prevents stale cache from showing incorrect quiz counts
            const timestamp = new Date().getTime();
            const res = await api.get(`/student/quizzes/all?_t=${timestamp}`);
            if (isMounted && res.data.success) {
                // Backend already correctly categorizes active vs completed
                // Active = published quizzes not yet submitted by this user
                // No additional filtering needed - trust backend response
                const activeQuizzes = res.data.data?.active || [];
                setNewQuizzes(activeQuizzes);
            }
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        }
    };

    // Fetch enrollment status
    const fetchEnrollment = async (isMounted = true) => {
        try {
            const res = await api.get('/student/enrollment');
            if (isMounted && res.data && res.data.data) {
                setEnrollment(res.data.data);
            } else if (isMounted) {
                // Fallback if no data returned
                setEnrollment({ isPaid: false, courses: [] });
            }
        } catch (error) {
            console.error('Failed to fetch enrollment:', error);
            // Set default on error
            if (isMounted) {
                setEnrollment({ isPaid: false, courses: [] });
            }
        } finally {
            // ALWAYS set enrollmentLoaded to prevent perpetual loading state
            if (isMounted) {
                setEnrollmentLoaded(true);
            }
        }
    };

    // Fetch video courses
    const fetchVideoCourses = async (isMounted = true) => {
        try {
            const res = await api.get('/student/video-courses');
            if (isMounted) {
                setVideoCourses(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    // Fetch AI Analysis for AI Coach card (real data)
    const fetchAiAnalysis = async (isMounted = true) => {
        try {
            const res = await api.get('/student/ai-analysis');
            if (isMounted && res.data?.data) {
                setAiAnalysis(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch AI analysis:', error);
        }
    };

    // Computed values: Use real data if available, otherwise mock
    // CRITICAL FIX: XP and Streak should ALWAYS come from real dashboardData (even if 0)
    // Only use mock data for accuracy/performance metrics if user has no quiz attempts
    const hasRealData = dashboardData !== null;
    const hasQuizAttempts = dashboardData && dashboardData.totalAttempts > 0;

    const stats = {
        // XP and Streak: Always use real values from backend (they come from User model, not attempts)
        xpPoints: hasRealData ? (dashboardData.xpPoints ?? 0) : MOCK_DASHBOARD_DATA.userStats.points,
        streak: hasRealData ? (dashboardData.streakCount ?? 0) : MOCK_DASHBOARD_DATA.userStats.streak,
        // Accuracy: Use mock only if no quiz attempts (this metric requires attempts)
        accuracy: hasQuizAttempts ? dashboardData.accuracy : MOCK_DASHBOARD_DATA.userStats.accuracy,
    };

    const performanceData = hasQuizAttempts && dashboardData.performanceGraph?.length > 0
        ? dashboardData.performanceGraph.map(p => p.score)
        : MOCK_DASHBOARD_DATA.performance;

    // Get user's target exam (from their profile)
    const targetExam = user?.targetExam || 'SBI PO Prelims';

    // Check if we have new quizzes for notification badge
    const examCountdown = {
        ...countdown,
        hasQuiz: newQuizzes.length > 0
    };


    const toggleTodo = async (id) => {
        try {
            // Optimistic update for todos
            const updatedTodos = todos.map(t => t._id === id ? { ...t, isCompleted: !t.isCompleted } : t);
            setTodos(updatedTodos);

            // Also update progress bar state optimistically
            const completedCount = updatedTodos.filter(t => t.isCompleted).length;
            const totalCount = updatedTodos.length;
            setTaskProgress({
                completed: completedCount,
                total: totalCount,
                percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
            });

            await api.patch(`/student/global-tasks/${id}/toggle`);
        } catch (error) {
            console.error(error);
            fetchTodos(); // Revert on error - this will also restore correct progress
        }
    };

    // Grid Animation Variants - Optimized for faster perceived load
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.01 } // Reduced from 0.02 for faster animation
        }
    };

    const tile = {
        hidden: { y: 15, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 150, damping: 14 }
        }
    };

    return (
        <div className="bento-dashboard" >
            <div className="dashboard-container">
                {/* Mobile-Only: Sticky Profile Button (scrolls with page) */}
                <Link to="/profile" className="mobile-sticky-profile">
                    <AvatarDisplay avatar={user?.avatar} size={40} />
                </Link>

                {/* Header Welcome */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-header-row">
                    <div>
                        {/* Mobile-Only: Integrated Logo & Branding */}
                        <div className="mobile-header-branding">
                            <img src="/logo_new.jpg" alt="StudyWise" className="header-logo" />
                            <span className="header-brand-text">StudyWiseBanking</span>
                        </div>

                        <h1>Hello, {user?.firstName || 'Student'}! 👋</h1>
                        <p>Keep pushing! Your goal is closer than you think.</p>
                    </div>
                    <div className="header-stats-pill">
                        <div className="pill-item">
                            <Flame size={18} style={{ color: '#FF6B35' }} />
                            <span>{stats.streak} Day Streak</span>
                        </div>
                        <div className="pill-item">
                            <Star size={18} style={{ color: '#FFD700', fill: '#FFD700' }} />
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
                    <motion.div
                        className="bento-tile hero-tile clickable"
                        variants={tile}
                        onClick={() => navigate('/tests')}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                    >
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
                                    {newQuizzes.length > 0 ? 'New Test Available!' : (examSettings?.title || 'Upcoming Exam')} | {examSettings?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <h2>{examSettings?.examName?.toUpperCase() || targetExam.toUpperCase()}</h2>
                                {examSettings?.description && (
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '8px 0 0', maxWidth: '300px' }}>
                                        {examSettings.description}
                                    </p>
                                )}
                                <div className="countdown-timer">
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{String(examCountdown.days).padStart(2, '0')}</span>
                                        </div>
                                        <span className="unit">Days</span>
                                    </div>
                                    <div className="time-sep">:</div>
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{String(examCountdown.hours).padStart(2, '0')}</span>
                                        </div>
                                        <span className="unit">Hrs</span>
                                    </div>
                                    <div className="time-sep">:</div>
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{String(examCountdown.minutes).padStart(2, '0')}</span>
                                        </div>
                                        <span className="unit">Min</span>
                                    </div>
                                    <div className="time-sep">:</div>
                                    <div className="time-unit">
                                        <div className="time-box">
                                            <span className="num">{String(examCountdown.seconds).padStart(2, '0')}</span>
                                        </div>
                                        <span className="unit">Sec</span>
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
                                            animate={{ strokeDashoffset: 264 - (264 * (aiAnalysis?.aiScore || stats.accuracy)) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            filter="url(#glow)"
                                        />
                                    </svg>
                                    <div className="coach-score">
                                        <span className="coach-num">{aiAnalysis?.aiScore || stats.accuracy}%</span>
                                    </div>
                                </div>

                                <div className="coach-insights">
                                    <div className="coach-item">
                                        <span className="coach-dot strong"></span>
                                        <div className="coach-text">
                                            <span className="coach-t-label">Strong</span>
                                            <span className="coach-t-val">{aiAnalysis?.strengths?.[0]?.topic || 'Take Quiz'}</span>
                                        </div>
                                    </div>
                                    <div className="coach-item">
                                        <span className="coach-dot focus"></span>
                                        <div className="coach-text">
                                            <span className="coach-t-label">Focus</span>
                                            <span className="coach-t-val">{aiAnalysis?.weaknesses?.[0]?.topic || 'Practice'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    {/* 3. Stats Rows (Clickable) - Go to Performance */}
                    <motion.div
                        className="bento-tile stats-tile-1 clickable"
                        variants={tile}
                        onClick={() => navigate('/performance')}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="stat-top">
                            <Target size={24} className="text-coral" />
                            <div className="trend-up">{hasRealData ? 'Real Data' : 'Demo'}</div>
                        </div>
                        <div className="stat-bottom">
                            <span className="stat-num">{stats.accuracy}%</span>
                            <span className="stat-lbl">Accuracy Rate</span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bento-tile stats-tile-2 clickable"
                        variants={tile}
                        onClick={() => navigate('/analysis')}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="stat-top">
                            <BookOpen size={24} className="text-teal" />
                            <span className="tag-micro">AI Suggested</span>
                        </div>
                        <div className="stat-bottom">
                            <span className="stat-num">{dashboardData?.suggestedStudyHours || '2-3'}h</span>
                            <span className="stat-lbl">Daily Study</span>
                        </div>
                    </motion.div>

                    {/* Tutor's Picks - REMOVED */}

                    {/* 5. Course Card - Premium Interactive Design (Matches AI Coach Style) */}
                    <motion.div
                        className={`bento-tile course-card-dynamic ${enrollmentLoaded ? (enrollment.isPaid ? 'paid' : 'free') : 'loading'} clickable`}
                        variants={tile}
                        onClick={() => navigate('/courses')}
                        whileHover="hover"
                        initial="rest"
                    >
                        {!enrollmentLoaded ? (
                            <div className="course-card-loading">
                                <div className="skeleton-badge" />
                                <div className="skeleton-title" />
                                <div className="skeleton-meta" />
                            </div>
                        ) : enrollment.isPaid ? (
                            /* Paid User - Premium Interactive Design */
                            <>
                                {/* Animated Background (like AI Coach) */}
                                <div className="course-bg-premium">
                                    <div className="course-orb-1"></div>
                                    <div className="course-orb-2"></div>
                                </div>

                                <div className="course-content-premium">
                                    {/* Header Badge */}
                                    <div className="course-header-premium">
                                        <div className="course-badge-premium">
                                            <Sparkles size={12} className="sparkle-anim" />
                                            <span>MY COURSES</span>
                                        </div>
                                        <motion.div
                                            className="course-arrow-premium"
                                            variants={{ rest: { x: 0 }, hover: { x: 4 } }}
                                        >
                                            <ArrowRight size={16} />
                                        </motion.div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="course-main-premium">
                                        {/* Mini Progress Ring (like AI Coach) */}
                                        <div className="course-ring-mini">
                                            <svg viewBox="0 0 60 60" className="course-ring-svg">
                                                <circle cx="30" cy="30" r="24" className="course-ring-track" />
                                                <motion.circle
                                                    cx="30" cy="30" r="24"
                                                    className="course-ring-fill"
                                                    strokeDasharray={151}
                                                    initial={{ strokeDashoffset: 151 }}
                                                    animate={{ strokeDashoffset: 151 - (151 * Math.min(videoCourses.length * 25, 100)) / 100 }}
                                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                                />
                                            </svg>
                                            <div className="course-ring-center">
                                                <GraduationCap size={18} />
                                            </div>
                                        </div>

                                        {/* Course Info - Use REAL enrollment data */}
                                        <div className="course-info-premium">
                                            <div className="course-stat-row">
                                                <span className="course-stat-big">{enrollment.courses?.length || 0}</span>
                                                <span className="course-stat-label">Enrolled</span>
                                            </div>
                                            <div className="course-stat-row">
                                                <span className="course-stat-big">
                                                    {/* Calculate lectures from only enrolled courses */}
                                                    {(() => {
                                                        const enrolledCourseIds = enrollment.courses?.map(c => c.courseId) || [];
                                                        const enrolledCourses = videoCourses.filter(vc =>
                                                            enrolledCourseIds.includes(vc._id)
                                                        );
                                                        return enrolledCourses.reduce((sum, c) => sum + (c.lectureCount || 0), 0);
                                                    })()}
                                                </span>
                                                <span className="course-stat-label">Lectures</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Course Name */}
                                    {enrollment.courses?.length > 0 && (
                                        <div className="course-recent">
                                            <span className="recent-label">Recently:</span>
                                            <span className="recent-name">
                                                {enrollment.courses[0]?.courseName?.slice(0, 22) || 'Your Course'}...
                                            </span>
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <motion.div
                                        className="course-cta-premium"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Play size={14} fill="white" />
                                        <span>Continue Learning</span>
                                    </motion.div>
                                </div>
                            </>
                        ) : (
                            /* Free User - Unlock CTA */
                            <>
                                <div className="free-course-bg">
                                    <div className="unlock-glow" />
                                </div>
                                <div className="free-course-content">
                                    <div className="lock-icon-wrapper">
                                        <Zap size={24} />
                                    </div>
                                    <div className="free-text">
                                        <h3>Unlock Premium</h3>
                                        <p>Get full access to video courses</p>
                                    </div>
                                    <motion.div
                                        className="unlock-btn"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <span>View Courses</span>
                                        <ArrowRight size={14} />
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* 6. Todo Sidebar - Interactive */}
                    <motion.div
                        className="bento-tile todo-tile clickable"
                        variants={tile}
                        onClick={() => navigate('/tasks')}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="tile-header">
                            <h3><ClipboardList size={20} /> Today's Plan</h3>
                            <span className="badge">{todos.filter(t => !t.isCompleted).length}</span>
                        </div>
                        <div className="todo-list-bento">
                            {!todosLoaded ? (
                                /* Loading skeleton */
                                <div className="todo-loading-skeleton">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="skeleton-item" style={{
                                            height: '40px',
                                            background: 'var(--color-border)',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            opacity: 0.6,
                                            animation: 'pulse 1.5s infinite'
                                        }} />
                                    ))}
                                </div>
                            ) : todos.length > 0 ? todos.map(task => (
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


                    {/* 8. Leaderboard */}
                    <motion.div
                        className="bento-tile rank-tile clickable"
                        variants={tile}
                        onClick={() => navigate('/leaderboard')}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Leaderboard limit={10} />
                    </motion.div>
                </motion.div>
            </div>
        </div >
    );
}

export default StudentDashboard;


