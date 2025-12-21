import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight, BarChart2,
    CheckCircle2, Crown, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock Data - Enhanced for specific UI states
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
            {/* CLEAN HEADER - Transparent background for modern look */}
            <motion.div
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2"
                variants={itemVariants}
            >
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-text)]">
                        <Sparkles className="fill-current text-[var(--color-primary)]" size={24} /> AI Performance Analysis
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mt-1 ml-8">
                        Data-driven insights tailored to your preparation journey
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-95 text-white shadow-lg shadow-[var(--color-primary)]/20"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Analysis"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* LEFT SIDEBAR - PROFILE & SCORE (3 Columns on Large Screens) */}
                <motion.div className="col-span-1 xl:col-span-4 flex flex-col gap-6 h-full" variants={itemVariants}>
                    <div className="flex-1 p-8 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] bg-[var(--color-card)] flex flex-col items-center text-center relative overflow-hidden">

                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-[var(--color-primary)] opacity-5 pointer-events-none rounded-b-[50%]"></div>

                        <div className="relative z-10 w-full flex flex-col items-center h-full">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-8">Overall Assessment</h3>

                            {/* Score Ring */}
                            <div className="relative w-52 h-52 mb-8 transform hover:scale-105 transition-transform duration-500">
                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 drop-shadow-2xl">
                                    <circle cx="60" cy="60" r="52" stroke="var(--color-border)" strokeWidth="6" fill="none" opacity="0.3" />
                                    <motion.circle
                                        cx="60" cy="60" r="52"
                                        stroke="var(--color-primary)" strokeWidth="6" fill="none"
                                        initial={{ strokeDasharray: 327, strokeDashoffset: 327 }}
                                        animate={{ strokeDashoffset: 327 - (327 * score) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-6xl font-black text-[var(--color-text)] tracking-tight">{score}</span>
                                    <div className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-full mt-2 uppercase tracking-wide">AI Score</div>
                                </div>
                            </div>

                            {/* Rank Badge */}
                            <div className="w-full bg-[var(--color-bg)] rounded-2xl p-4 border border-[var(--color-border)] mb-8 flex justify-between items-center shadow-sm">
                                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Class Rank</span>
                                <span className="text-sm font-bold text-green-600 flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                                    <Crown size={14} className="fill-current" /> Top 15%
                                </span>
                            </div>

                            {/* Trend Graph - Fixed spacing */}
                            <div className="w-full mt-auto pt-4 border-t border-[var(--color-border)]">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-[var(--color-text)] uppercase">Performance Trend</span>
                                    <span className="text-xs text-[var(--color-text-secondary)]">Last 7 Days</span>
                                </div>
                                <div className="h-32 w-full flex items-end justify-between gap-2">
                                    {MOCK_AI_INSIGHTS.weeklyTrend.map((val, idx) => (
                                        <div key={idx} className="w-full flex flex-col justify-end h-full gap-1 group">
                                            <div
                                                className="w-full bg-[var(--color-primary)] rounded-t-md opacity-40 group-hover:opacity-100 transition-all duration-300 relative"
                                                style={{ height: `${val}%` }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT CONTENT - STATS & ACTION (8 Columns) */}
                <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">

                    {/* 1. Quick Stats Grid - Premium Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)] flex flex-col items-start gap-3 hover:-translate-y-1 transition-all duration-300 group"
                                variants={itemVariants}
                            >
                                <div className="w-full flex justify-between items-start">
                                    <div className="p-2.5 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                        <stat.icon size={20} />
                                    </div>
                                    <ArrowRight size={14} className="text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                                <div className="mt-1">
                                    <div className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</div>
                                    <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mt-1">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 2. Strengths & Weaknesses (Split View) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Strengths */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 md:p-8"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6 text-lg">
                                <Award className="text-green-500" size={20} /> Strong Areas
                            </h3>
                            <div className="space-y-6">
                                {strengths.map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-green-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1 opacity-80">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Weaknesses */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6 md:p-8"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-6 text-lg">
                                <AlertTriangle className="text-red-500" size={20} /> Focus Areas
                            </h3>
                            <div className="space-y-6">
                                {weaknesses.map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-red-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1 opacity-80">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* 3. Action Cards - Refined Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {suggestions.map((s, i) => (
                            <motion.div
                                key={i}
                                className="bg-[var(--color-card)] p-6 rounded-3xl border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col h-full hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-md"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-2xl p-2.5 bg-[var(--color-bg)] rounded-xl">{s.icon}</div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase tracking-wide">{s.priority}</span>
                                </div>

                                <h4 className="font-bold text-[var(--color-text)] text-sm mb-2">{s.topic}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-8 line-clamp-2">{s.reason}</p>

                                <button
                                    className="mt-auto w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border hover:bg-[var(--color-primary)] hover:text-white"
                                    style={{
                                        borderColor: 'var(--color-primary)',
                                        color: 'var(--color-primary)'
                                    }}
                                    onClick={() => navigate('/quizzes')}
                                >
                                    Start Practice
                                </button>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
