import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, RefreshCw,
    Award, AlertTriangle, ArrowRight,
    Crown, LayoutDashboard, Sparkles, Brain, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

    const data = dashboardData || {};
    const ai = aiAnalysis || {};
    const score = data.accuracy || 0;
    const weeklyTrend = [40, 50, 45, 60, 55, 70, 75];

    const stats = [
        { label: "Hours Studied", value: data.suggestedStudyHours || "4-5", icon: BookOpen },
        { label: "Questions", value: data.totalQuestions || 2, icon: Target },
        { label: "Accuracy", value: `${score}%`, icon: Zap },
        { label: "Streak", value: data.streakCount || 0, icon: Star }
    ];

    const strengths = ai.strengths?.length > 0 ? ai.strengths : [
        { topic: "Data Interpretation", score: 85 },
        { topic: "Simplification", score: 92 },
        { topic: "Inequalities", score: 78 }
    ];

    const weaknesses = ai.weaknesses?.length > 0 ? ai.weaknesses : [
        { topic: "General", score: 0 }
    ];

    const suggestions = ai.suggestions?.length > 0 ? ai.suggestions : [
        { topic: "Master General", reason: "Your General score is 0%. Daily practice will boost it quickly!", icon: "📈", priority: "High" },
        { topic: "Take More Quizzes", reason: "Complete at least 5 quizzes to get detailed performance insights", icon: "📝", priority: "High" },
        { topic: "Foundation Building", reason: "Focus on understanding core concepts before timed practice", icon: "📚", priority: "High" }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{
                    width: 48, height: 48,
                    border: '4px solid var(--color-primary)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    const cardStyle = {
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)'
    };

    const sectionTitleStyle = {
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-secondary)',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
            {/* HEADER CARD */}
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <LayoutDashboard color="white" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            AI Performance Analysis
                            <Sparkles size={20} color="var(--color-primary)" />
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                            Your personalized learning insights powered by AI
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(138, 117, 186, 0.3)'
                    }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Analysis"}
                </button>
            </div>

            {/* MAIN CONTENT - Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 24 }}>

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* SCORE CARD */}
                    <div style={{ ...cardStyle, textAlign: 'center' }}>
                        <div style={sectionTitleStyle}>
                            <Brain size={14} /> Overall AI Score
                        </div>

                        {/* Score Ring */}
                        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 24px' }}>
                            <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="60" cy="60" r="52" stroke="var(--color-border)" strokeWidth="10" fill="none" opacity="0.3" />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--color-primary)" />
                                        <stop offset="100%" stopColor="#A58FD8" />
                                    </linearGradient>
                                </defs>
                                <motion.circle
                                    cx="60" cy="60" r="52"
                                    stroke="url(#scoreGrad)" strokeWidth="10" fill="none"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: 327, strokeDashoffset: 327 }}
                                    animate={{ strokeDashoffset: 327 - (327 * score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-text)' }}>{score}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>AI Score</span>
                            </div>
                        </div>

                        {/* Rank & Accuracy */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Rank</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                                    <Crown size={16} color="#F59E0B" fill="#F59E0B" /> Top 15%
                                </div>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Accuracy</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginTop: 4 }}>{score}%</div>
                            </div>
                        </div>
                    </div>

                    {/* TREND CARD */}
                    <div style={cardStyle}>
                        <div style={sectionTitleStyle}>
                            <Activity size={14} /> 7-Day Performance Trend
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, gap: 6, marginBottom: 8 }}>
                            {weeklyTrend.map((val, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    style={{
                                        flex: 1,
                                        background: 'linear-gradient(to top, var(--color-primary), #A58FD8)',
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.6 + idx * 0.05
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* STATS ROW */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {stats.map((stat, i) => (
                            <div key={i} style={cardStyle}>
                                <div style={{
                                    width: 40, height: 40,
                                    background: 'var(--color-bg)',
                                    borderRadius: 10,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 12
                                }}>
                                    <stat.icon size={20} color="var(--color-primary)" />
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>{stat.value}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginTop: 4 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* STRENGTHS & WEAKNESSES */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Strengths */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={18} color="#10B981" />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Strong Areas</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {strengths.map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{item.score}%</span>
                                        </div>
                                        <div style={{ height: 8, background: 'var(--color-bg)', borderRadius: 4, overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                style={{ height: '100%', background: 'linear-gradient(to right, #10B981, #34D399)', borderRadius: 4 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 36, height: 36, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={18} color="#EF4444" />
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Areas to Improve</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {weaknesses.map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{item.score}%</span>
                                        </div>
                                        <div style={{ height: 8, background: 'var(--color-bg)', borderRadius: 4, overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(item.score, 5)}%` }}
                                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                style={{ height: '100%', background: 'linear-gradient(to right, #EF4444, #F87171)', borderRadius: 4 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RECOMMENDATIONS */}
                    <div>
                        <div style={{ ...sectionTitleStyle, marginBottom: 16 }}>
                            <Sparkles size={14} color="var(--color-primary)" /> AI-Powered Recommendations
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {suggestions.map((s, i) => (
                                <div key={i} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ fontSize: 28, padding: 8, background: 'var(--color-bg)', borderRadius: 12 }}>{s.icon}</div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700,
                                            padding: '4px 10px', borderRadius: 20,
                                            background: s.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: s.priority === 'High' ? '#EF4444' : '#F59E0B',
                                            textTransform: 'uppercase'
                                        }}>{s.priority}</span>
                                    </div>
                                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 8px 0' }}>{s.topic}</h4>
                                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>{s.reason}</p>
                                    <button
                                        onClick={() => navigate('/subjects')}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 10,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8
                                        }}
                                    >
                                        Start Practice <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for spin animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </motion.div>
    );
}
