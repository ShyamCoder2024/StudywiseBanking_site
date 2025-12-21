import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight, BarChart2
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
    streakDays: 0,
    weeklyTrend: [40, 50, 45, 60, 55, 70, 0] // Mock trend data
};

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
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
        { label: "Questions", value: data.totalQuestions || 0, icon: Target, color: "var(--color-success)" },
        { label: "Accuracy", value: `${score}%`, icon: Zap, color: "var(--color-warning)" },
        { label: "Day Streak", value: data.streakCount || 0, icon: Star, color: "#F59E0B" }
    ];

    const strengths = ai.strengths && ai.strengths.length > 0 ? ai.strengths : MOCK_AI_INSIGHTS.strengths;
    const weaknesses = ai.weaknesses && ai.weaknesses.length > 0 ? ai.weaknesses : MOCK_AI_INSIGHTS.weaknesses;
    const suggestions = ai.suggestions || MOCK_AI_INSIGHTS.suggestions;
    const weeklyTrend = MOCK_AI_INSIGHTS.weeklyTrend; // Ideally from backend

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
                        Real-time insights tailored to your learning curve.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md border border-transparent"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Updating..." : "Refresh Insights"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. HERO COLUMN - Score, Rank & Trend */}
                <motion.div
                    className="col-span-1 lg:col-span-4 flex flex-col gap-6"
                    variants={itemVariants}
                >
                    {/* Main Score Card */}
                    <div
                        className="flex-1 flex flex-col items-center p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] text-center relative overflow-hidden"
                        style={{ backgroundColor: 'var(--color-card)' }}
                    >
                        <div className="relative w-56 h-56 mb-8 mt-4">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 drop-shadow-2xl">
                                <circle cx="60" cy="60" r="52" stroke="var(--color-border)" strokeWidth="8" fill="none" opacity="0.4" />
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
                                <span className="text-6xl font-extrabold tracking-tighter" style={{ color: 'var(--color-text)' }}>{score}</span>
                                <span className="text-sm font-bold uppercase tracking-wider mt-2 px-3 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" style={{ color: 'var(--color-primary)' }}>AI Score</span>
                            </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="mb-8 w-full">
                            <div className="flex justify-between items-center text-sm px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                                <span className="text-[var(--color-text-secondary)]">Class Rank:</span>
                                <span className="font-bold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                                    <TrendingUp size={16} className="text-green-500" /> Top 15%
                                </span>
                            </div>
                        </div>

                        {/* Weekly Trend Graph (CSS Bars) */}
                        <div className="w-full mt-auto">
                            <div className="flex justify-between items-end h-24 gap-2 px-2">
                                {weeklyTrend.map((val, idx) => (
                                    <div key={idx} className="w-full flex flex-col items-center gap-1 group">
                                        <div
                                            className="w-full rounded-t-sm transition-all group-hover:opacity-80 relative"
                                            style={{
                                                height: `${val}%`,
                                                backgroundColor: idx === 6 ? 'var(--color-primary)' : 'var(--color-border)'
                                            }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-1 rounded pointer-events-none">
                                                {val}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] uppercase text-center mt-2 text-[var(--color-text-secondary)] font-medium">Last 7 Days Performance</div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. STATS & ANALYSIS COLUMN */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex flex-row items-center justify-between shadow-[var(--shadow-card)] transition-all cursor-default group"
                                style={{ backgroundColor: 'var(--color-card)' }}
                                variants={itemVariants}
                                whileHover={{ y: -3 }}
                            >
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1" style={{ color: 'var(--color-text)' }}>{stat.label}</div>
                                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                                </div>
                                <div
                                    className="p-3 rounded-xl bg-opacity-10 transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: stat.color, color: stat.color }}
                                >
                                    <stat.icon size={22} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Deep Analysis (Strengths vs Weaknesses) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Strengths */}
                        <motion.div
                            className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col h-full"
                            style={{ backgroundColor: 'var(--color-card)' }}
                            variants={itemVariants}
                        >
                            <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <Award className="text-green-500" size={20} /> Strong Areas
                            </h3>
                            <div className="space-y-5">
                                {strengths.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{item.topic}</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                                            <motion.div
                                                className="h-full bg-green-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col h-full"
                            style={{ backgroundColor: 'var(--color-card)' }}
                            variants={itemVariants}
                        >
                            <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <AlertTriangle className="text-red-500" size={20} /> Focus Areas
                            </h3>
                            <div className="space-y-5">
                                {weaknesses.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{item.topic}</span>
                                            <span className="font-bold text-red-500 dark:text-red-400">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                                            <motion.div
                                                className="h-full bg-red-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Actionable Recommendations */}
                    <motion.div variants={itemVariants}>
                        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                            <Lightbulb size={20} className="text-amber-500" /> Recommended Actions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suggestions.map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between h-full bg-[var(--color-card)] relative overflow-hidden group hover:border-[var(--color-primary)] transition-colors"
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)] opacity-[0.03] rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-3xl">{s.icon}</div>
                                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)]" style={{ color: 'var(--color-text-secondary)' }}>
                                                {s.priority}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-base mb-1" style={{ color: 'var(--color-text)' }}>{s.topic}</h4>
                                        <p className="text-xs line-clamp-2 mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                            {s.reason}
                                        </p>
                                    </div>

                                    <button
                                        className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95"
                                        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                                        onClick={() => navigate('/quizzes')}
                                    >
                                        Start Practice <ArrowRight size={14} />
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
