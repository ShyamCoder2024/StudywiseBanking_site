import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight, BarChart2,
    CheckCircle2, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock Data
const MOCK_AI_INSIGHTS = {
    overallScore: 0,
    summary: "Complete more quizzes to generate personalized AI insights.",
    strengths: [
        { topic: "Data Interpretation", score: 85, detail: "Strong accuracy" },
        { topic: "Simplification", score: 92, detail: "Fast solving speed" },
        { topic: "Inequalities", score: 78, detail: "Good concept clarity" }
    ],
    weaknesses: [
        { topic: "Quadratic Eq.", score: 45, detail: "Accuracy low" },
        { topic: "Number Series", score: 50, detail: "Time management needed" },
        { topic: "Arithmetic", score: 40, detail: "Concept revision needed" }
    ],
    suggestions: [
        { topic: "Speed Math Practice", reason: "Improve calculation speed by 20%", icon: "⚡", priority: "High" },
        { topic: "Daily Reasoning Quiz", reason: "Maintain your strong areas", icon: "🧠", priority: "Medium" },
        { topic: "Full Length Mock", reason: "Test your endurance", icon: "📝", priority: "High" }
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
    hidden: { opacity: 0, y: 20 },
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
    // const weeklyTrend = MOCK_AI_INSIGHTS.weeklyTrend; // For SVG graph

    return (
        <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="flex items-center justify-between p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-sm bg-[var(--color-card)]"
                variants={itemVariants}
            >
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-text)]">
                        <Zap className="fill-current text-yellow-500" /> AI Performance Analysis
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Deep dive insights into your preparation strategy
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-6 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95 text-white shadow-md hover:shadow-lg"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Data"}
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT SIDEBAR - PROFILE & SCORE (3 Columns) */}
                <motion.div className="col-span-1 lg:col-span-4 flex flex-col gap-6" variants={itemVariants}>
                    <div className="flex-1 p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] bg-[var(--color-card)] flex flex-col items-center text-center">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-6">Overall Assessment</h3>

                        {/* Score Ring */}
                        <div className="relative w-48 h-48 mb-6">
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
                                <span className="text-5xl font-extrabold text-[var(--color-text)]">{score}</span>
                                <span className="text-xs font-bold text-[var(--color-primary)] uppercase mt-1">AI Score</span>
                            </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="w-full bg-[var(--color-bg)] rounded-lg p-3 border border-[var(--color-border)] mb-6 flex justify-between items-center">
                            <span className="text-sm text-[var(--color-text-secondary)]">Class Rank</span>
                            <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                <TrendingUp size={16} /> Top 15%
                            </span>
                        </div>

                        {/* Trend Graph (SVG) */}
                        <div className="w-full mt-auto">
                            <div className="text-left text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase">Weakly Performance Trend</div>
                            <div className="h-24 w-full relative border-b border-[var(--color-border)] flex items-end justify-between px-1">
                                {MOCK_AI_INSIGHTS.weeklyTrend.map((val, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="w-1/12 bg-[var(--color-primary)] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity relative group"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {val}%
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT CONTENT - STATS & ACTION (8 Columns) */}
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

                    {/* 1. Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)] flex flex-row items-center gap-3 hover:-translate-y-1 transition-transform"
                                variants={itemVariants}
                            >
                                <div className="p-3 rounded-xl bg-[var(--color-bg)]" style={{ color: stat.color }}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-[var(--color-text)]">{stat.value}</div>
                                    <div className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 2. Strengths & Weaknesses (Split View) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Strengths */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-4">
                                <Award className="text-green-500" size={18} /> Strong Areas
                            </h3>
                            <div className="space-y-4">
                                {strengths.map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-green-600">{item.score}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
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

                        {/* Weaknesses */}
                        <motion.div
                            className="bg-[var(--color-card)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-6"
                            variants={itemVariants}
                        >
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-4">
                                <AlertTriangle className="text-red-500" size={18} /> Areas to Focus
                            </h3>
                            <div className="space-y-4">
                                {weaknesses.map((item, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-red-500">{item.score}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
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

                    {/* 3. Action Cards (Recommendations) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suggestions.map((s, i) => (
                            <motion.div
                                key={i}
                                className="bg-[var(--color-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)] flex flex-col h-full hover:border-[var(--color-primary)] transition-colors"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-2xl p-2 bg-[var(--color-bg)] rounded-lg">{s.icon}</div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] uppercase">{s.priority}</span>
                                </div>

                                <h4 className="font-bold text-[var(--color-text)] text-sm mb-2">{s.topic}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-6 line-clamp-2">{s.reason}</p>

                                <button
                                    className="mt-auto w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-transform active:scale-95"
                                    style={{ backgroundColor: 'var(--color-primary)' }}
                                    onClick={() => navigate('/quizzes')}
                                >
                                    Take Action
                                </button>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
