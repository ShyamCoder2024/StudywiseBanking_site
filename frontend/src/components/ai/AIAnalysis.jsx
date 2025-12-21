import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, RefreshCw,
    TrendingUp, Award, AlertTriangle, ArrowRight,
    Crown, LayoutDashboard, Sparkles, Brain, Clock,
    ChevronRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.02, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
};

// Animated Counter Component
function AnimatedCounter({ value, duration = 1.5 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value) || 0;
        if (start === end) return;

        const incrementTime = (duration * 1000) / end;
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
}

// Glassmorphism Card Component
function GlassCard({ children, className = "", gradient = false, hover = true, delay = 0 }) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={hover ? { y: -4, scale: 1.01 } : {}}
            className={`
                relative overflow-hidden rounded-2xl
                bg-[var(--color-card)] 
                border border-[var(--color-border)]
                shadow-[var(--shadow-card)]
                backdrop-blur-sm
                transition-all duration-300
                ${hover ? 'hover:shadow-[var(--shadow-hover)] hover:border-[var(--color-primary)]/30' : ''}
                ${className}
            `}
            style={{
                transitionDelay: `${delay}ms`,
            }}
        >
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-[var(--color-success)]/5 pointer-events-none" />
            )}
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

// Animated Progress Bar Component
function AnimatedProgressBar({ value, color = "primary", delay = 0 }) {
    const colorMap = {
        primary: "from-[var(--color-primary)] to-[#A58FD8]",
        success: "from-emerald-500 to-teal-400",
        warning: "from-rose-500 to-orange-400",
        info: "from-blue-500 to-cyan-400"
    };

    return (
        <div className="h-2.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
            <motion.div
                className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, delay: delay * 0.1, ease: "easeOut" }}
            />
        </div>
    );
}

export function AIAnalysis() {
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dashRes, aiRes] = await Promise.all([
                api.get('/student/dashboard'),
                api.get('/student/ai-analysis').catch(() => ({ data: { success: false } }))
            ]);

            if (dashRes.data.success) setDashboardData(dashRes.data.data);
            if (aiRes.data.success) setAiAnalysis(aiRes.data.data);
        } catch (error) {
            console.error("Error fetching analysis data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setAnalyzing(true);
        await fetchData();
        setTimeout(() => setAnalyzing(false), 1000);
    };

    // Data Processing
    const data = dashboardData || {};
    const ai = aiAnalysis || {};

    const score = data.accuracy || 0;
    const weeklyTrend = [40, 50, 45, 60, 55, 70, 75];

    const stats = [
        { label: "Hours Studied", value: data.suggestedStudyHours || "4-5", icon: Clock, color: "var(--color-primary)", bgColor: "var(--color-primary-light)" },
        { label: "Questions", value: data.totalQuestions || 2, icon: Target, color: "var(--color-success)", bgColor: "var(--color-success-light)" },
        { label: "Accuracy", value: `${score}%`, icon: Zap, color: "var(--color-warning)", bgColor: "var(--color-warning-light)" },
        { label: "Streak", value: data.streakCount || 0, icon: Star, color: "#F59E0B", bgColor: "#FEF3C7" }
    ];

    const defaultStrengths = [
        { topic: "Data Interpretation", score: 85 },
        { topic: "Simplification", score: 92 },
        { topic: "Inequalities", score: 78 }
    ];

    const defaultWeaknesses = [
        { topic: "General", score: 0 }
    ];

    const defaultSuggestions = [
        { topic: "Master General", reason: "Your General score is 0%. Daily practice will boost it quickly!", icon: "📈", priority: "High" },
        { topic: "Take More Quizzes", reason: "Complete at least 5 quizzes to get detailed performance insights", icon: "📝", priority: "High" },
        { topic: "Foundation Building", reason: "Focus on understanding core concepts before timed practice", icon: "📚", priority: "High" }
    ];

    const strengths = ai.strengths && ai.strengths.length > 0 ? ai.strengths : defaultStrengths;
    const weaknesses = ai.weaknesses && ai.weaknesses.length > 0 ? ai.weaknesses : defaultWeaknesses;
    const suggestions = ai.suggestions && ai.suggestions.length > 0 ? ai.suggestions : defaultSuggestions;

    const priorityColors = {
        High: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
        Medium: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
        Low: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <GlassCard className="p-6" gradient hover={false}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <motion.div
                            className="p-3 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[#A58FD8]"
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                        >
                            <LayoutDashboard className="text-white" size={28} />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                                AI Performance Analysis
                                <Sparkles className="text-[var(--color-primary)]" size={20} />
                            </h2>
                            <p className="text-sm text-[var(--color-text-secondary)]">Your personalized learning insights powered by AI</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={handleRefresh}
                        disabled={analyzing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)' }}
                    >
                        <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                        {analyzing ? "Analyzing..." : "Refresh Analysis"}
                    </motion.button>
                </div>
            </GlassCard>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column - Score & Trend */}
                <div className="lg:col-span-4 space-y-6">

                    {/* AI Score Card */}
                    <GlassCard className="p-8" gradient>
                        <div className="text-center">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-6 flex items-center justify-center gap-2">
                                <Brain size={14} /> Overall AI Score
                            </h3>

                            {/* Animated Score Ring */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                {/* Glow Effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 blur-xl"
                                    variants={pulseVariants}
                                    animate="pulse"
                                />

                                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 relative z-10">
                                    {/* Background Circle */}
                                    <circle
                                        cx="60" cy="60" r="52"
                                        stroke="var(--color-border)"
                                        strokeWidth="10"
                                        fill="none"
                                        opacity="0.3"
                                    />
                                    {/* Gradient Definition */}
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="var(--color-primary)" />
                                            <stop offset="100%" stopColor="#A58FD8" />
                                        </linearGradient>
                                    </defs>
                                    {/* Progress Circle */}
                                    <motion.circle
                                        cx="60" cy="60" r="52"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="10"
                                        fill="none"
                                        initial={{ strokeDasharray: 327, strokeDashoffset: 327 }}
                                        animate={{ strokeDashoffset: 327 - (327 * score) / 100 }}
                                        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-[var(--color-text)]">
                                        <AnimatedCounter value={score} />
                                    </span>
                                    <span className="text-xs font-bold text-[var(--color-primary)] uppercase mt-1 tracking-wider">AI Score</span>
                                </div>
                            </div>

                            {/* Rank & Accuracy Quick Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <motion.div
                                    className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <span className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Rank</span>
                                    <span className="flex items-center justify-center gap-1 text-lg font-bold text-[var(--color-text)] mt-1">
                                        <Crown size={16} className="text-amber-400 fill-amber-400" />
                                        Top 15%
                                    </span>
                                </motion.div>
                                <motion.div
                                    className="p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <span className="block text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">Accuracy</span>
                                    <span className="block text-lg font-bold text-[var(--color-text)] mt-1">{score}%</span>
                                </motion.div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 7-Day Trend Card */}
                    <GlassCard className="p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
                            <Activity size={14} /> 7-Day Performance Trend
                        </h3>
                        <div className="flex items-end justify-between h-32 gap-2 pt-6">
                            {weeklyTrend.map((val, idx) => (
                                <motion.div
                                    key={idx}
                                    className="flex-1 bg-gradient-to-t from-[var(--color-primary)] to-[#A58FD8] rounded-t-md relative group cursor-pointer"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 0.6, delay: 0.8 + idx * 0.1, ease: "easeOut" }}
                                    whileHover={{ opacity: 1, scale: 1.05 }}
                                    style={{ opacity: 0.6 + (idx * 0.05) }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--color-text)] text-[var(--color-bg)] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {val}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-[10px] text-[var(--color-text-secondary)] font-medium">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <span key={day}>{day}</span>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column - Stats, Strengths, Weaknesses, Recommendations */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <GlassCard key={i} className="p-5" delay={i * 50}>
                                <div className="flex items-start justify-between mb-3">
                                    <motion.div
                                        className="p-2.5 rounded-xl"
                                        style={{ backgroundColor: stat.bgColor }}
                                        whileHover={{ rotate: [0, -5, 5, 0] }}
                                    >
                                        <stat.icon size={20} style={{ color: stat.color }} />
                                    </motion.div>
                                </div>
                                <div className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</div>
                                <div className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mt-1">{stat.label}</div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Strong Areas */}
                        <GlassCard className="p-6">
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-5">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Award className="text-emerald-500" size={18} />
                                </div>
                                Strong Areas
                            </h3>
                            <div className="space-y-4">
                                {strengths.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 + i * 0.1 }}
                                    >
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-emerald-500">{item.score}%</span>
                                        </div>
                                        <AnimatedProgressBar value={item.score} color="success" delay={i + 10} />
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* Areas to Improve */}
                        <GlassCard className="p-6">
                            <h3 className="font-bold flex items-center gap-2 text-[var(--color-text)] mb-5">
                                <div className="p-2 rounded-lg bg-rose-500/10">
                                    <AlertTriangle className="text-rose-500" size={18} />
                                </div>
                                Areas to Improve
                            </h3>
                            <div className="space-y-4">
                                {weaknesses.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.2 + i * 0.1 }}
                                    >
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-semibold text-[var(--color-text)]">{item.topic}</span>
                                            <span className="font-bold text-rose-500">{item.score}%</span>
                                        </div>
                                        <AnimatedProgressBar value={item.score || 5} color="warning" delay={i + 12} />
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* AI Recommendations */}
                    <div>
                        <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                            <Sparkles className="text-[var(--color-primary)]" size={18} />
                            AI-Powered Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suggestions.map((s, i) => {
                                const colors = priorityColors[s.priority] || priorityColors.Medium;
                                return (
                                    <GlassCard key={i} className="p-5 flex flex-col h-full" delay={i * 100}>
                                        <div className="flex justify-between items-start mb-4">
                                            <motion.div
                                                className="text-3xl p-2 bg-[var(--color-bg)] rounded-xl"
                                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                            >
                                                {s.icon}
                                            </motion.div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} ${colors.border} border uppercase tracking-wide`}>
                                                {s.priority}
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-[var(--color-text)] text-sm mb-2">{s.topic}</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-5 flex-1">{s.reason}</p>

                                        <motion.button
                                            whileHover={{ scale: 1.02, x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary)]/20"
                                            style={{ background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)' }}
                                            onClick={() => navigate('/subjects')}
                                        >
                                            Start Practice <ArrowRight size={14} />
                                        </motion.button>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
