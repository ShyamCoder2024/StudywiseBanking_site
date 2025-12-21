import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, TrendingDown, Award, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock Data
const MOCK_AI_INSIGHTS = {
    overallScore: 0,
    summary: "Complete more quizzes to generate personalized AI insights.",
    strengths: [
        { topic: "Data Interpretation", score: 85, detail: "Strong accuracy" },
        { topic: "Simplification", score: 92, detail: "Fast solving speed" }
    ],
    weaknesses: [
        { topic: "Quadratic Eq.", score: 45, detail: "Accuracy low" },
        { topic: "Number Series", score: 50, detail: "Time management needed" }
    ],
    suggestions: [
        { topic: "Start a Quiz", reason: "Data needed for analysis", icon: "📝", priority: "High" },
        { topic: "Daily Login", reason: "Build consistency", icon: "📅", priority: "Medium" }
    ],
    studyHours: "0",
    questionsAttempted: 0,
    accuracy: 0,
    streakDays: 0
};

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

const hoverScale = {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300 }
};

export function AIAnalysis() {
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, aiRes] = await Promise.all([
                api.get('/student/dashboard'),
                api.get('/student/ai-analysis').catch(() => ({ data: { success: false } }))
            ]);

            if (dashRes.data.success) setDashboardData(dashRes.data.data);
            if (aiRes.data.success) setAiAnalysis(aiRes.data.data);
        } catch (error) {
            console.error("Error fetching analysis data", error);
        }
    };

    const handleRefresh = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            fetchData();
        }, 1500);
    };

    // Merge logic
    const data = dashboardData || {};
    const ai = aiAnalysis || {};

    const score = data.accuracy || 0;
    const stats = [
        { label: "Study Hours", value: data.suggestedStudyHours || "2-3", icon: BookOpen, color: "var(--color-primary)" },
        { label: "Questions Solved", value: data.totalQuestions || 0, icon: Target, color: "var(--color-success)" },
        { label: "Accuracy Rate", value: `${score}%`, icon: Zap, color: "var(--color-warning)" },
        { label: "Day Streak", value: data.streakCount || 0, icon: Star, color: "#F59E0B" }
    ];

    const strengths = ai.strengths && ai.strengths.length > 0 ? ai.strengths : MOCK_AI_INSIGHTS.strengths;
    const weaknesses = ai.weaknesses && ai.weaknesses.length > 0 ? ai.weaknesses : MOCK_AI_INSIGHTS.weaknesses;
    const suggestions = ai.suggestions || MOCK_AI_INSIGHTS.suggestions;

    return (
        <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Card */}
            <motion.div
                className="flex flex-col md:flex-row justify-between items-center p-6 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)]"
                style={{ backgroundColor: 'var(--color-card)' }}
                variants={itemVariants}
            >
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <Zap className="fill-current text-yellow-500" /> AI Performance Analysis
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Deep dive into your learning patterns and areas for improvement.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Insights"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. HERO COLUMN - Score & Summary */}
                <motion.div className="col-span-1 lg:col-span-4 space-y-6">
                    {/* Score Card */}
                    <motion.div
                        className="flex flex-col items-center justify-center p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] text-center relative overflow-hidden h-full"
                        style={{ backgroundColor: 'var(--color-card)' }}
                        variants={itemVariants}
                        whileHover={hoverScale}
                    >
                        <div className="relative w-56 h-56 mb-6">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 drop-shadow-xl">
                                <circle cx="60" cy="60" r="52" stroke="var(--color-border)" strokeWidth="8" fill="none" opacity="0.3" />
                                <motion.circle
                                    cx="60" cy="60" r="52"
                                    stroke="var(--color-primary)" strokeWidth="8" fill="none"
                                    initial={{ strokeDasharray: 327, strokeDashoffset: 327 }}
                                    animate={{ strokeDashoffset: 327 - (327 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>{score}</span>
                                <span className="text-sm font-bold uppercase tracking-wider mt-2 opacity-80" style={{ color: 'var(--color-primary)' }}>AI Score</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl w-full text-sm leading-relaxed border border-[var(--color-border)] opacity-90" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                            {ai.summary || MOCK_AI_INSIGHTS.summary}
                        </div>
                    </motion.div>
                </motion.div>

                {/* 2. STATS & LISTS COLUMN */}
                <div className="col-span-1 lg:col-span-8 space-y-6">

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex flex-col items-center justify-center gap-3 shadow-[var(--shadow-card)] transition-all cursor-default"
                                style={{ backgroundColor: 'var(--color-card)' }}
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-hover)' }}
                            >
                                <div
                                    className="p-3 rounded-full bg-opacity-10 mb-1"
                                    style={{ backgroundColor: stat.color, color: stat.color }}
                                >
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                                    <div className="text-xs font-medium uppercase tracking-wide opacity-70" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Strengths & Weaknesses Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <motion.div
                            className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] h-full"
                            style={{ backgroundColor: 'var(--color-card)' }}
                            variants={itemVariants}
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                                <Award className="text-green-500" size={20} /> Your Strengths
                            </h3>
                            <div className="space-y-3">
                                {strengths.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-[var(--radius-md)] bg-opacity-30 border border-green-100 dark:border-green-900/30" style={{ backgroundColor: 'var(--color-success-light)' }}>
                                        <div>
                                            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.topic}</div>
                                            <div className="text-xs opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{item.detail}</div>
                                        </div>
                                        <span className="font-bold text-green-600 dark:text-green-400">{item.score}%</span>
                                    </div>
                                ))}
                                {strengths.length === 0 && <p className="text-sm italic opacity-60">No data yet.</p>}
                            </div>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] h-full"
                            style={{ backgroundColor: 'var(--color-card)' }}
                            variants={itemVariants}
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                                <AlertTriangle className="text-red-500" size={20} /> Areas to Improve
                            </h3>
                            <div className="space-y-3">
                                {weaknesses.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-[var(--radius-md)] bg-opacity-30 border border-red-100 dark:border-red-900/30" style={{ backgroundColor: 'var(--color-warning-light)' }}>
                                        <div>
                                            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.topic}</div>
                                            <div className="text-xs opacity-80" style={{ color: 'var(--color-text-secondary)' }}>{item.detail}</div>
                                        </div>
                                        <span className="font-bold text-red-600 dark:text-red-400">{item.score}%</span>
                                    </div>
                                ))}
                                {weaknesses.length === 0 && <p className="text-sm italic opacity-60">No data yet.</p>}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recommendations List */}
                    <motion.div
                        className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]"
                        style={{ backgroundColor: 'var(--color-card)' }}
                        variants={itemVariants}
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                            <Lightbulb size={20} className="text-amber-500" /> AI Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestions.map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col justify-between h-full relative overflow-hidden group"
                                    whileHover={{ y: -3, borderColor: 'var(--color-primary)' }}
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-primary)] opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>

                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-2xl p-2 rounded-lg bg-[var(--color-card)] shadow-sm">{s.icon}</div>
                                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                                {s.priority}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1 text-[var(--color-text)] line-clamp-1" title={s.topic}>
                                            {s.topic}
                                        </h4>
                                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4" title={s.reason}>
                                            {s.reason}
                                        </p>
                                    </div>

                                    <button
                                        className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1 hover:gap-2 transition-all mt-auto"
                                        onClick={() => navigate('/quizzes')}
                                    >
                                        Take Action <ArrowRight size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
