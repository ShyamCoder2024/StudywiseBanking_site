import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, TrendingUp, AlertTriangle, Lightbulb, ChevronRight,
    CheckCircle, Target, Zap, BookOpen, RefreshCw, Sparkles,
    Star, BarChart2
} from 'lucide-react';
import api from '../../services/api';
import './AIAnalysis.css';

// Mock AI Data
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
    studyHours: "2-3",
    questionsAttempted: 456,
    accuracy: 72,
    streakDays: 8,
    rank: 156,
    totalUsers: 2340,
    nextMilestone: 80,
    completedTopics: 12,
    totalTopics: 18
};

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

const generateAISuggestions = (accuracy, weakAreas) => {
    const suggestions = [];
    if (accuracy < 50) {
        suggestions.push({ topic: "Foundation Building", reason: "Focus on core concepts.", icon: "📚", priority: "High" });
    }
    if (accuracy < 70) {
        suggestions.push({ topic: "Daily Practice", reason: "Study 3-4 hours daily.", icon: "⏰", priority: "High" });
    }
    if (weakAreas && weakAreas.length > 0) {
        suggestions.push({ topic: `Focus on ${weakAreas[0]}`, reason: "Work on weak areas.", icon: "🎯", priority: "High" });
    }
    suggestions.push({ topic: "Take Quizzes", reason: "Identify gaps.", icon: "📝", priority: accuracy < 70 ? "High" : "Medium" });
    return suggestions.slice(0, 3);
};

export function AIAnalysis() {
    const [analyzing, setAnalyzing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        fetchDashboardData();
        fetchAIAnalysis();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/student/dashboard');
            setDashboardData(res.data.data);
        } catch (error) {
            console.error('Failed dashboard data', error);
        }
    };

    const fetchAIAnalysis = async () => {
        try {
            const res = await api.get('/student/ai-analysis');
            if (res.data.success) setAiAnalysis(res.data.data);
        } catch (error) {
            console.error('Failed AI analysis', error);
        }
    };

    const hasRealData = dashboardData && dashboardData.totalAttempts > 0;
    const hasAiData = aiAnalysis && aiAnalysis.summary;

    const insights = hasRealData ? {
        overallScore: dashboardData.accuracy || 0,
        scoreChange: dashboardData.accuracy > 50 ? Math.round((dashboardData.accuracy - 50) / 5) : 0,
        summary: hasAiData ? aiAnalysis.summary : "Keep practicing to improve your scores.",
        strengths: hasAiData && aiAnalysis.strengths ? aiAnalysis.strengths : [],
        weaknesses: hasAiData && aiAnalysis.weaknesses ? aiAnalysis.weaknesses : [],
        suggestions: hasAiData && aiAnalysis.suggestions ? aiAnalysis.suggestions : generateAISuggestions(dashboardData.accuracy, []),
        weeklyProgress: dashboardData.performanceGraph ? dashboardData.performanceGraph.map(p => p.score) : [],
        studyHours: dashboardData.suggestedStudyHours || "2-3",
        questionsAttempted: dashboardData.totalQuestions || 0,
        accuracy: dashboardData.accuracy || 0,
        streakDays: dashboardData.streakCount || 0,
        nextMilestone: 80,
    } : MOCK_AI_INSIGHTS;

    useEffect(() => {
        setDisplayScore(insights.overallScore);
    }, [insights.overallScore]);

    const handleRefreshAnalysis = async () => {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex justify-between items-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Performance Analysis</h1>
                    <p className="text-gray-500 dark:text-gray-400">Personalized insights</p>
                </div>
                <button
                    onClick={handleRefreshAnalysis}
                    className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                    disabled={analyzing}
                >
                    {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
            </motion.div>

            {/* Grid */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-6" variants={containerVariants} initial="hidden" animate="visible">

                {/* Score Card - CLEAN DESIGN */}
                <motion.div className="col-span-1 lg:col-span-4 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/40 rounded-3xl p-8 flex flex-col items-center shadow-lg" variants={cardVariants}>
                    <div className="relative w-48 h-48 mb-6">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                            {/* Background Circle */}
                            <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-100 dark:text-gray-700" />
                            {/* Progress Circle */}
                            <circle
                                cx="60" cy="60" r="52"
                                stroke="currentColor" strokeWidth="8" fill="none"
                                className="text-purple-600 dark:text-purple-500"
                                strokeDasharray="327"
                                strokeDashoffset={327 - (327 * insights.overallScore) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{displayScore}</span>
                            <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 mt-1">AI Score</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        {insights.summary}
                    </p>
                </motion.div>

                {/* Right Column */}
                <div className="col-span-1 lg:col-span-8 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Study Hours', value: insights.studyHours, icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
                            { label: 'Questions', value: insights.questionsAttempted, icon: Target, color: 'text-blue-600 bg-blue-100' },
                            { label: 'Accuracy', value: `${insights.accuracy}%`, icon: Zap, color: 'text-green-600 bg-green-100' },
                            { label: 'Streak', value: `${insights.streakDays}`, icon: Star, color: 'text-orange-600 bg-orange-100' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
                                    <stat.icon size={20} />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="text-amber-500" size={20} /> Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insights.suggestions.map((s, i) => (
                                <div key={i} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-2xl">{s.icon}</div>
                                        <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white dark:bg-gray-600 rounded-md shadow-sm">{s.priority}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{s.topic}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
