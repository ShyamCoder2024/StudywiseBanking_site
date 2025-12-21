import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight, BarChart2,
    CheckCircle2, Crown, Sparkles, LayoutDashboard
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
            {/* Header - Simple & Clean */}
            <motion.div
                className="flex flex-col md:flex-row items-center justify-between gap-4 px-1"
                variants={itemVariants}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm">
                        <LayoutDashboard size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text)]">AI Performance Analysis</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">Real-time insights for your preparation</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:brightness-105 active:scale-95 text-white shadow-md bg-[var(--color-primary)]"
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Insights"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                {/* 1. LEFT PROFILE SIDEBAR */}
                <motion.div className="col-span-1 xl:col-span-4 h-full" variants={itemVariants}>
                    <div className="h-full p-8 rounded-[24px] border border-[var(--color-border)] shadow-[var(--shadow-card)] bg-[var(--color-card)] flex flex-col items-center text-center relative overflow-hidden">

                        {/* Gradient Accent */}
                        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none"></div>

                        <h3 className="relative z-10 text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-6">Overall Assessment</h3>

                        {/* Score Ring */}
                        <div className="relative z-10 w-56 h-56 mb-8 transform transition-transform hover:scale-105">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 drop-shadow-2xl">
                                <circle cx="60" cy="60" r="50" stroke="var(--color-border)" strokeWidth="8" fill="none" className="opacity-30" />
                                <motion.circle
                                    cx="60" cy="60" r="50"
                                    stroke="var(--color-primary)" strokeWidth="8" fill="none"
                                    initial={{ strokeDasharray: 314, strokeDashoffset: 314 }}
                                    animate={{ strokeDashoffset: 314 - (314 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-[var(--color-text)] tracking-tight">{score}</span>
                                <div className="px-3 py-1 bg-[var(--color-bg)] rounded-full border border-[var(--color-border)] mt-2">
                                    <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wide">AI Score</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="relative z-10 w-full grid grid-cols-2 gap-3 mb-8">
                            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-center">
                                <div className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold">Class Rank</div>
                                <div className="text-lg font-bold text-[var(--color-text)] flex justify-center items-center gap-1">
                                    <Crown size={14} className="text-yellow-500 fill-current" /> Top 15%
                                </div>
                            </div>
                            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-center">
                                <div className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold">Accuracy</div>
                                <div className="text-lg font-bold text-[var(--color-text)]">
                                    {data.accuracy || 0}%
                                </div>
                            </div>
                        </div>

                        {/* Trend Graph */}
                        <div className="relative z-10 w-full mt-auto">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <span className="text-xs font-bold text-[var(--color-text)] uppercase">Weekly Trend</span>
                            </div>
                            <div className="h-32 w-full flex items-end justify-between gap-2 px-2 pb-2">
                                {MOCK_AI_INSIGHTS.weeklyTrend.map((val, idx) => (
                                    <div key={idx} className="w-full flex flex-col justify-end h-full gap-1 group">
                                        <motion.div
                                            className="w-full bg-[var(--color-primary)] rounded-t-sm opacity-50 group-hover:opacity-100 transition-all duration-300 relative"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${val}%` }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        >
                                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--color-bg)] text-[var(--color-text)] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--color-border)] pointer-events-none">
                                                {val}
                                            </div>
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. RIGHT CONTENT AREA */}
                <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-5 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)] flex flex-col justify-between hover:border-[var(--color-primary)] transition-colors group h-28"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] tracking-wider">{stat.label}</span>
                                    <stat.icon size={18} style={{ color: stat.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-3xl font-bold text-[var(--color-text)]">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Strengths */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-[24px] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6 text-sm uppercase tracking-wide">
                                <Award className="text-green-500" size={18} /> Strong Areas
                            </h3>
                            <div className="space-y-6">
                                {strengths.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-xs">{item.score}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-green-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-[24px] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6 text-sm uppercase tracking-wide">
                                <AlertTriangle className="text-red-500" size={18} /> Focus Areas
                            </h3>
                            <div className="space-y-6">
                                {weaknesses.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-red-500 dark:text-red-400 text-xs">{item.score}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-500 rounded-full"
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
                                className="bg-[var(--color-card)] p-6 rounded-[24px] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                                variants={itemVariants}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-2xl">{s.icon}</div>
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase">{s.priority}</span>
                                    </div>
                                    <h4 className="font-bold text-[var(--color-text)] text-sm mb-2 line-clamp-1">{s.topic}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6 line-clamp-2">{s.reason}</p>
                                </div>

                                <button
                                    className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 hover:gap-3"
                                    style={{
                                        backgroundColor: 'var(--color-primary-light, rgba(147, 51, 234, 0.1))',
                                        color: 'var(--color-primary)'
                                    }}
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
