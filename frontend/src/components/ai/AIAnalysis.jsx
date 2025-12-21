import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, Lightbulb, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

// Mock Data
const MOCK_AI_INSIGHTS = {
    overallScore: 0,
    summary: "Complete more quizzes to generate personalized AI insights.",
    strengths: [],
    weaknesses: [],
    suggestions: [
        { topic: "Start a Quiz", reason: "Data needed for analysis", icon: "📝", priority: "High" },
        { topic: "Daily Login", reason: "Build consistency", icon: "📅", priority: "Medium" }
    ],
    studyHours: "0",
    questionsAttempted: 0,
    accuracy: 0,
    streakDays: 0
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export function AIAnalysis() {
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

    // Insights aggregation
    const score = data.accuracy || 0;
    const stats = [
        { label: "Study Hours", value: data.suggestedStudyHours || "2-3", icon: BookOpen, color: "var(--color-primary)" },
        { label: "Questions", value: data.totalQuestions || 0, icon: Target, color: "var(--color-success)" },
        { label: "Accuracy", value: `${score}%`, icon: Zap, color: "var(--color-warning)" },
        { label: "Streak", value: data.streakCount || 0, icon: Star, color: "#F59E0B" }
    ];

    const suggestions = ai.suggestions || MOCK_AI_INSIGHTS.suggestions;

    return (
        <motion.div
            className="w-full space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header & Actions */}
            <div className="flex justify-between items-center bg-[var(--color-card)] p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)]">
                <div>
                    <h2 className="text-[var(--color-text)] font-bold text-lg">AI Performance Analysis</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm">Personalized insights based on your recent activity</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                    <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Score Card - Left Column */}
                <motion.div
                    className="col-span-1 lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border border-[var(--color-border)] text-center relative overflow-hidden"
                    style={{ backgroundColor: 'var(--color-card)' }}
                    variants={itemVariants}
                >
                    <div className="relative w-48 h-48 mb-6">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            <circle cx="60" cy="60" r="52" stroke="var(--color-border)" strokeWidth="8" fill="none" />
                            <circle
                                cx="60" cy="60" r="52"
                                stroke="var(--color-primary)" strokeWidth="8" fill="none"
                                strokeDasharray="327"
                                strokeDashoffset={327 - (327 * score) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{score}</span>
                            <span className="text-xs uppercase font-bold mt-1" style={{ color: 'var(--color-primary)' }}>AI Score</span>
                        </div>
                    </div>
                    <p className="text-sm p-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-secondary)] leading-relaxed">
                        {ai.summary || MOCK_AI_INSIGHTS.summary}
                    </p>
                </motion.div>

                {/* Details - Right Column */}
                <div className="col-span-1 lg:col-span-8 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center gap-3 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
                                style={{ backgroundColor: 'var(--color-card)' }}
                                variants={itemVariants}
                            >
                                <div
                                    className="p-2 rounded-md bg-opacity-10"
                                    style={{ backgroundColor: stat.color, color: stat.color }}
                                >
                                    <stat.icon size={20} className="text-white" style={{ stroke: stat.color }} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recommendations List */}
                    <motion.div
                        className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-card)]"
                        style={{ backgroundColor: 'var(--color-card)' }}
                        variants={itemVariants}
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-text)]">
                            <Lightbulb size={20} className="text-amber-500" /> Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-2xl">{s.icon}</div>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                            {s.priority}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 text-[var(--color-text)] line-clamp-1" title={s.topic}>
                                        {s.topic}
                                    </h4>
                                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3" title={s.reason}>
                                        {s.reason}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
