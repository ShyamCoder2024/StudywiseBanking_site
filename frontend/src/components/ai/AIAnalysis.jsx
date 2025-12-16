import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, TrendingUp, AlertTriangle, Lightbulb, ChevronRight,
    CheckCircle, Target, Zap, BookOpen, RefreshCw, Sparkles,
    Clock, Award, BarChart2, Calendar, ArrowUpRight, Star
} from 'lucide-react';
import './AIAnalysis.css';

// Mock AI Data - In real app, fetch from backend
const MOCK_AI_INSIGHTS = {
    overallScore: 78,
    scoreChange: +12,
    summary: "You are showing strong consistency in Reasoning, but Quantitative Aptitude needs more focus on speed. Your accuracy has improved by 12% this week.",
    strengths: [
        { topic: "Syllogism", score: 95, detail: "Excellent accuracy" },
        { topic: "Reading Comprehension", score: 88, detail: "Strong comprehension" },
        { topic: "Data Interpretation", score: 85, detail: "Good with basics" }
    ],
    weaknesses: [
        { topic: "Time & Distance", score: 45, detail: "Needs practice" },
        { topic: "Quadratic Equations", score: 52, detail: "Speed issues" },
        { topic: "Current Affairs", score: 60, detail: "Last 3 months" }
    ],
    suggestions: [
        {
            topic: "Speed Math Techniques",
            reason: "Master Vedic math shortcuts to reduce calculation time by 40%",
            icon: "⚡",
            priority: "High"
        },
        {
            topic: "Daily Current Affairs",
            reason: "15 minutes daily reading to ace the GA section",
            icon: "📰",
            priority: "Medium"
        },
        {
            topic: "Practice Mock Tests",
            reason: "Take 2 full-length mocks weekly for exam readiness",
            icon: "📝",
            priority: "High"
        }
    ],
    weeklyProgress: [65, 68, 72, 70, 75, 78, 78],
    studyHours: 24,
    questionsAttempted: 456,
    accuracy: 72,
    streakDays: 8,
    rank: 156,
    totalUsers: 2340,
    nextMilestone: 80,
    completedTopics: 12,
    totalTopics: 18
};

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1, x: 0,
        transition: { type: "spring", stiffness: 100 }
    }
};

export function AIAnalysis() {
    const [analyzing, setAnalyzing] = useState(false);
    const [insights, setInsights] = useState(MOCK_AI_INSIGHTS);
    const [displayScore, setDisplayScore] = useState(0);

    // Animated number counter effect
    useEffect(() => {
        const targetScore = insights.overallScore;
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        let step = 0;

        // Reset to 0 first
        setDisplayScore(0);

        const timer = setInterval(() => {
            step++;
            // Easing function for smooth deceleration
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(targetScore * eased));

            if (step >= steps) {
                setDisplayScore(targetScore);
                clearInterval(timer);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [insights.overallScore]);

    const handleRefreshAnalysis = () => {
        setAnalyzing(true);
        setDisplayScore(0);
        setTimeout(() => {
            setAnalyzing(false);
            // Re-trigger count animation manually
            const targetScore = insights.overallScore;
            const duration = 1500;
            const steps = 60;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplayScore(Math.round(targetScore * eased));

                if (step >= steps) {
                    setDisplayScore(targetScore);
                    clearInterval(timer);
                }
            }, duration / steps);
        }, 2000);
    };

    return (
        <div className="ai-analysis-page">
            {/* Hero Header */}
            <motion.div
                className="ai-hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="ai-hero-content">
                    <div className="ai-hero-icon">
                        <Brain size={28} />
                        <Sparkles className="sparkle-icon" size={14} />
                    </div>
                    <div className="ai-hero-text">
                        <h1>AI Performance Analysis</h1>
                        <p>Personalized insights to optimize your preparation</p>
                    </div>
                </div>
                <motion.button
                    className="btn-analyze-premium"
                    onClick={handleRefreshAnalysis}
                    disabled={analyzing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <RefreshCw size={16} className={analyzing ? 'spinning' : ''} />
                    {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                </motion.button>
            </motion.div>

            {/* Main Content Grid */}
            <motion.div
                className="ai-content-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Score Overview Section - Clean Premium Design */}
                <motion.div className="ai-score-section" variants={cardVariants}>
                    <div className="score-ring-container">
                        <svg viewBox="0 0 120 120" className="score-ring">
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
                                </linearGradient>
                            </defs>
                            <circle cx="60" cy="60" r="52" className="score-ring-bg" />
                            <motion.circle
                                cx="60" cy="60" r="52"
                                className="score-ring-progress"
                                strokeDasharray="327"
                                initial={{ strokeDashoffset: 327 }}
                                animate={{ strokeDashoffset: 327 - (327 * insights.overallScore) / 100 }}
                                transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
                            />
                        </svg>
                        <div className="score-ring-center">
                            <motion.span
                                className="score-value"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                {displayScore}
                            </motion.span>
                            <span className="score-label">AI Score</span>
                            <motion.div
                                className="score-change positive"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <TrendingUp size={11} />
                                <span>+{insights.scoreChange}%</span>
                            </motion.div>
                        </div>
                    </div>
                    <div className="score-details">
                        <motion.p
                            className="score-summary"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        >
                            {insights.summary}
                        </motion.p>
                        <motion.div
                            className="score-milestone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <span>Next Milestone: {insights.nextMilestone}</span>
                            <div className="milestone-bar">
                                <motion.div
                                    className="milestone-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(insights.overallScore / insights.nextMilestone) * 100}%` }}
                                    transition={{ duration: 1.2, delay: 1, ease: [0.4, 0, 0.2, 1] }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Stats Row */}
                <motion.div className="ai-quick-stats" variants={cardVariants}>
                    <motion.div className="quick-stat" whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}>
                        <div className="quick-stat-icon purple"><BookOpen size={20} /></div>
                        <div className="quick-stat-info">
                            <span className="stat-value">{insights.studyHours}h</span>
                            <span className="stat-label">Study Time</span>
                        </div>
                    </motion.div>
                    <motion.div className="quick-stat" whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}>
                        <div className="quick-stat-icon blue"><Target size={20} /></div>
                        <div className="quick-stat-info">
                            <span className="stat-value">{insights.questionsAttempted}</span>
                            <span className="stat-label">Questions</span>
                        </div>
                    </motion.div>
                    <motion.div className="quick-stat" whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}>
                        <div className="quick-stat-icon green"><Zap size={20} /></div>
                        <div className="quick-stat-info">
                            <span className="stat-value">{insights.accuracy}%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                    </motion.div>
                    <motion.div className="quick-stat" whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}>
                        <div className="quick-stat-icon orange"><Award size={20} /></div>
                        <div className="quick-stat-info">
                            <span className="stat-value">#{insights.rank}</span>
                            <span className="stat-label">Rank</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Strengths Section */}
                <motion.div className="ai-card strengths-card" variants={cardVariants}>
                    <div className="card-header">
                        <TrendingUp className="header-icon success" size={20} />
                        <h3>Your Strengths</h3>
                        <span className="count-badge success">{insights.strengths.length}</span>
                    </div>
                    <motion.div className="skill-list" variants={containerVariants}>
                        {insights.strengths.map((item, i) => (
                            <motion.div
                                key={i}
                                className="skill-item success"
                                variants={listItemVariants}
                                whileHover={{ x: 4, backgroundColor: "var(--color-success-light)" }}
                            >
                                <div className="skill-info">
                                    <CheckCircle size={16} className="skill-icon" />
                                    <span className="skill-name">{item.topic}</span>
                                </div>
                                <div className="skill-score-wrapper">
                                    <div className="skill-progress">
                                        <motion.div
                                            className="skill-progress-fill success"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.score}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                        />
                                    </div>
                                    <span className="skill-percent">{item.score}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Weaknesses Section */}
                <motion.div className="ai-card weaknesses-card" variants={cardVariants}>
                    <div className="card-header">
                        <AlertTriangle className="header-icon danger" size={20} />
                        <h3>Areas to Improve</h3>
                        <span className="count-badge danger">{insights.weaknesses.length}</span>
                    </div>
                    <motion.div className="skill-list" variants={containerVariants}>
                        {insights.weaknesses.map((item, i) => (
                            <motion.div
                                key={i}
                                className="skill-item danger"
                                variants={listItemVariants}
                                whileHover={{ x: 4, backgroundColor: "var(--color-warning-light)" }}
                            >
                                <div className="skill-info">
                                    <AlertTriangle size={16} className="skill-icon" />
                                    <span className="skill-name">{item.topic}</span>
                                </div>
                                <div className="skill-score-wrapper">
                                    <div className="skill-progress">
                                        <motion.div
                                            className="skill-progress-fill danger"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.score}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                        />
                                    </div>
                                    <span className="skill-percent">{item.score}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Progress Card - NEW */}
                <motion.div className="ai-card progress-card" variants={cardVariants}>
                    <div className="card-header">
                        <BarChart2 className="header-icon primary" size={20} />
                        <h3>Weekly Progress</h3>
                    </div>
                    <div className="progress-chart">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="chart-bar-wrapper">
                                <motion.div
                                    className="chart-bar"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${insights.weeklyProgress[i]}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                />
                                <span className="chart-label">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="progress-footer">
                        <div className="streak-info">
                            <Star size={16} className="streak-icon" />
                            <span>{insights.streakDays} Day Streak!</span>
                        </div>
                        <div className="topics-info">
                            <span>{insights.completedTopics}/{insights.totalTopics} Topics</span>
                        </div>
                    </div>
                </motion.div>

                {/* AI Recommendations */}
                <motion.div className="ai-card recommendations-card" variants={cardVariants}>
                    <div className="card-header">
                        <Lightbulb className="header-icon warning" size={20} />
                        <h3>AI Recommendations</h3>
                        <span className="badge">Personalized</span>
                    </div>
                    <div className="recommendation-list">
                        {insights.suggestions.map((suggestion, i) => (
                            <motion.div
                                key={i}
                                className="recommendation-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.12 }}
                                whileHover={{ scale: 1.01, x: 5 }}
                            >
                                <div className="recommendation-icon">{suggestion.icon}</div>
                                <div className="recommendation-content">
                                    <div className="recommendation-header">
                                        <h4>{suggestion.topic}</h4>
                                        <span className={`priority-badge ${suggestion.priority.toLowerCase()}`}>
                                            {suggestion.priority}
                                        </span>
                                    </div>
                                    <p>{suggestion.reason}</p>
                                </div>
                                <motion.button
                                    className="btn-start"
                                    whileHover={{ scale: 1.05, backgroundColor: "var(--color-primary)" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Start <ChevronRight size={14} />
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
