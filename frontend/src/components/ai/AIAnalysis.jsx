import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight, BarChart2,
    CheckCircle2, Crown, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock Data
const MOCK_AI_INSIGHTS = {
    overallScore: 0,
    summary: "Complete more quizzes to generate personalized AI insights.",
    strengths: [
        { topic: "Data Interpretation", score: 85, detail: "Strong accuracy" },
        { topic: "Simplification", score: 92, detail: "Differentiation speed high" },
        { topic: "Inequalities", score: 78, detail: "Good concept clarity" }
    ],
    weaknesses: [
        { topic: "Quadratic Eq.", score: 45, detail: "High error rate" },
        { topic: "Number Series", score: 50, detail: "Taking too long" },
        { topic: "Arithmetic", score: 40, detail: "Concept revision needed" }
    ],
    suggestions: [
        { topic: "Speed Math Practice", reason: "Improve calculation speed by 20% to boost overall score.", icon: "⚡", priority: "High" },
        { topic: "Daily Reasoning Quiz", reason: "Maintain your strong areas with consistent practice.", icon: "🧠", priority: "Medium" },
        { topic: "Full Length Mock", reason: "Test your endurance and time management skills.", icon: "📝", priority: "High" }
    ],
    studyHours: "2.5",
    questionsAttempted: 142,
    accuracy: 68,
    streakDays: 5,
    weeklyTrend: [40, 50, 45, 60, 55, 70, 75]
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
    hidden: { opacity: 0, y: 15 },
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
        { label: "Hours Studied", value: data.suggestedStudyHours || "2-3", icon: BookOpen, color: "var(--color-primary)" },
        { label: "Questions", value: data.totalQuestions || 0, icon: Target, color: "var(--color-success)" },
        { label: "Accuracy", value: `${score}%`, icon: Zap, color: "var(--color-warning)" },
        { label: "Streak", value: data.streakCount || 0, icon: Star, color: "#F59E0B" }
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
            {/* Header */}
            <motion.div
                className="flex items-center justify-between p-6 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm"
                variants={itemVariants}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--color-bg)] rounded-lg">
                        <LayoutDashboard className="text-[var(--color-primary)]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">AI Performance Analysis</h2>
                        <p className="text-sm text-[var(--color-text-secondary)]">Your personalized learning insights</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm text-white transition-transform active:scale-95 shadow-md"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* 1. LEFT SIDEBAR - SCORE & TREND (4 Columns) */}
                <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
                    <motion.div
                        className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-8 flex flex-col items-center text-center"
                        variants={itemVariants}
                    >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-6">Overall Score</h3>

                        {/* Score Ring */}
                        <div className="relative w-48 h-48 mb-6">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
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
                                <span className="text-5xl font-black text-[var(--color-text)]">{score}</span>
                                <span className="text-xs font-bold text-[var(--color-primary)] uppercase mt-1">AI Score</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                <span className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Rank</span>
                                <span className="block text-lg font-bold text-[var(--color-text)] flex justify-center items-center gap-1">
                                    <Crown size={14} className="text-yellow-500 fill-current" /> Top 15%
                                </span>
                            </div>
                            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                                <span className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Accuracy</span>
                                <span className="block text-lg font-bold text-[var(--color-text)]">{data.accuracy || 0}%</span>
                            </div>
                        </div>

                        <div className="w-full pt-4 border-t border-[var(--color-border)]">
                            <div className="text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase mb-4">7 Day Trend</div>
                            <div className="flex items-end justify-between h-24 gap-1">
                                {MOCK_AI_INSIGHTS.weeklyTrend.map((val, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="w-full bg-[var(--color-primary)] rounded-t-sm opacity-60 hover:opacity-100 transition-opacity relative group"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                            {val}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 2. RIGHT CONTENT - STATS & DETAILS (8 Columns) */}
                <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="bg-[var(--color-card)] p-5 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col gap-2 hover:-translate-y-1 transition-transform"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]">
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</div>
                                    <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6">
                                <Award className="text-green-500" size={20} /> Strong Areas
                            </h3>
                            <div className="space-y-5">
                                {strengths.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-green-600">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-green-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)]"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6">
                                <AlertTriangle className="text-red-500" size={20} /> Areas to Improve
                            </h3>
                            <div className="space-y-5">
                                {weaknesses.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-red-500">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {suggestions.map((s, i) => (
                            <motion.div
                                key={i}
                                className="bg-[var(--color-card)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col h-full hover:shadow-md transition-shadow"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-2xl p-2 bg-[var(--color-bg)] rounded-lg">{s.icon}</div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase">{s.priority}</span>
                                </div>
                                <h4 className="font-bold text-[var(--color-text)] text-sm mb-2">{s.topic}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6 flex-1">{s.reason}</p>

                                <button
                                    className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                    onClick={() => navigate('/quizzes')}
                                >
                                    Start Practice <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
