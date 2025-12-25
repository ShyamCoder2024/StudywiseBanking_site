import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, RefreshCw,
    Award, AlertTriangle, TrendingUp,
    Crown, Brain, Activity,
    Clock, Flame, Trophy, ChevronUp,
    BarChart3, Timer, GraduationCap, Lightbulb, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ============ ANIMATED COUNTER HOOK (OPTIMIZED) ============
function useAnimatedCounter(end, duration = 1000) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
        const endVal = parseInt(end) || 0;
        if (endVal === 0) { setCount(0); return; }

        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * endVal));
            if (progress < 1) countRef.current = requestAnimationFrame(animate);
        };
        countRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(countRef.current);
    }, [end, duration]);

    return count;
}

// ============ ANIMATED PROGRESS BAR (MEMOIZED) ============
const AnimatedBar = memo(function AnimatedBar({ value, color, delay = 0 }) {
    return (
        <div style={{ height: 10, background: 'var(--color-bg)', borderRadius: 5, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, delay: Math.min(delay, 0.3), ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: 5 }}
            />
        </div>
    );
});

// ============ STAT CARD WITH ANIMATION (MEMOIZED) ============
const StatCard = memo(function StatCard({ icon: Icon, label, value, trend, color, delay }) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.04, type: 'spring', stiffness: 150, damping: 20 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--color-card)',
                border: `1px solid ${hovered ? color + '40' : 'var(--color-border)'}`,
                borderRadius: 18,
                padding: 'clamp(16px, 3vw, 22px)',
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: hovered ? `0 8px 24px ${color}15` : '0 2px 8px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div
                    style={{
                        width: 48, height: 48,
                        background: `${color}15`,
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Icon size={24} style={{ color }} />
                </div>
                {trend !== undefined && (
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: 2,
                            fontSize: 12, fontWeight: 700,
                            color: trend >= 0 ? '#10B981' : '#EF4444',
                            padding: '4px 8px',
                            background: trend >= 0 ? '#10B98115' : '#EF444415',
                            borderRadius: 20
                        }}
                    >
                        <ChevronUp size={14} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </div>
        </motion.div>
    );
});

// ============ CIRCULAR PROGRESS (MEMOIZED) ============
const CircularProgress = memo(function CircularProgress({ value, size = 180, strokeWidth = 12, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const animatedValue = useAnimatedCounter(value, 1200);

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} opacity={0.3}
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ fontSize: 'clamp(36px, 8vw, 48px)', fontWeight: 800, color: 'var(--color-text)' }}>
                    {animatedValue}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase' }}>AI Score</span>
            </div>
        </div>
    );
});

// ============ MAIN COMPONENT ============
export function AIAnalysis() {
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

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
        setTimeout(() => setAnalyzing(false), 1500);
    };

    const data = dashboardData || {};
    const ai = aiAnalysis || {};

    // Use AI-calculated score from backend (composite metric), fallback to accuracy
    const score = ai.aiScore || data.accuracy || ai.accuracy || 0;

    // Use real performance trend from backend (7-day actual scores)
    const performanceTrend = ai.performanceTrend || [];
    const weeklyTrend = performanceTrend.length > 0
        ? performanceTrend.map(p => p.score)
        : (data.performanceGraph?.map(p => p.score) || []);

    // Use actual data from backend - no fake fallbacks
    const strengths = ai.strengths || [];
    const weaknesses = ai.weaknesses || [];

    // Calculate actual weekly trend from recent vs older performance
    const calculateWeeklyTrend = () => {
        if (weeklyTrend.length < 2) return null;
        const recent = weeklyTrend.slice(-3);
        const older = weeklyTrend.slice(0, Math.min(3, weeklyTrend.length - 3));
        if (older.length === 0) return null;
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return Math.round(recentAvg - olderAvg);
    };
    const actualWeeklyTrend = calculateWeeklyTrend();

    // Dynamic rank based on actual AI score
    const getRankLabel = () => {
        if (score >= 85) return "Top 5%";
        if (score >= 75) return "Top 15%";
        if (score >= 60) return "Top 30%";
        if (score >= 40) return "Top 50%";
        return "Keep Going!";
    };

    // Use AI-calculated study plan from backend, with local fallback
    const studyRec = ai.studyPlan || {
        hoursPerDay: score < 40 ? "5-6" : score < 60 ? "4-5" : score < 80 ? "3-4" : "2-3",
        mode: score < 40 ? "Intensive" : score < 60 ? "Focused" : score < 80 ? "Balanced" : "Maintenance",
        color: score < 40 ? "#EF4444" : score < 60 ? "#F59E0B" : score < 80 ? "#10B981" : "#8A75BA",
        morning: { time: "2 hrs", focus: "Core concepts" },
        afternoon: { time: "1.5 hrs", focus: "Practice tests" },
        evening: { time: "1.5 hrs", focus: "Revision" }
    };

    const performanceMetrics = {
        quizzesCompleted: ai.totalAttempts || data.totalAttempts || 0,
        questionsAnswered: ai.totalQuestions || data.totalQuestions || 0,
        correctAnswers: ai.totalCorrect || data.totalCorrect || 0,
        streakDays: data.streakCount || 0,
        xpPoints: data.xpPoints || 0,
        averageScore: data.averageScore || ai.accuracy || 0
    };

    // Responsive styles
    const cardStyle = {
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(16px, 3vw, 22px)',
        padding: 'clamp(18px, 4vw, 28px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease'
    };

    const sectionTitle = {
        fontSize: 'clamp(11px, 2.5vw, 13px)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-text-secondary)',
        marginBottom: 'clamp(16px, 3vw, 24px)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 48, height: 48,
                        border: '4px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)' }}
        >
            {/* ============ HEADER ============ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 80 }}
                style={{
                    ...cardStyle,
                    background: 'linear-gradient(135deg, var(--color-card) 0%, var(--color-primary-light) 100%)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 18px)', flexWrap: 'wrap' }}>
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: 'clamp(50px, 10vw, 64px)', height: 'clamp(50px, 10vw, 64px)',
                            background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                            borderRadius: 'clamp(14px, 3vw, 18px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 28px rgba(138, 117, 186, 0.4)'
                        }}
                    >
                        <Brain color="white" size={28} />
                    </motion.div>
                    <div>
                        <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            Performance Analytics
                            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Sparkles size={20} color="var(--color-primary)" />
                            </motion.span>
                        </h1>
                        <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'var(--color-text-secondary)', margin: '6px 0 0 0' }}>
                            AI-powered insights to accelerate your learning
                        </p>
                    </div>
                </div>
                <motion.button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(138, 117, 186, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 28px)',
                        background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                        color: 'white', border: 'none', borderRadius: 14,
                        fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 6px 24px rgba(138, 117, 186, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Analysis"}
                </motion.button>
            </motion.div>

            {/* ============ STATS GRID - 2 columns mobile, 3 tablet, 6 desktop ============ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'clamp(12px, 2vw, 16px)'
            }}>
                <StatCard icon={Target} label="Quizzes Taken" value={performanceMetrics.quizzesCompleted} color="#8A75BA" delay={1} />
                <StatCard icon={BarChart3} label="Questions" value={performanceMetrics.questionsAnswered} color="#6EBCC3" delay={2} />
                <StatCard icon={Zap} label="Accuracy" value={`${score}%`} color="#F59E0B" delay={3} />
                <StatCard icon={Flame} label="Day Streak" value={performanceMetrics.streakDays} color="#EF4444" delay={4} />
                <StatCard icon={Trophy} label="XP Points" value={performanceMetrics.xpPoints} color="#10B981" delay={5} />
                <StatCard icon={GraduationCap} label="Avg Score" value={`${performanceMetrics.averageScore}%`} color="#8B5CF6" delay={6} />
            </div>

            {/* ============ SCORE & STUDY PLAN - Stack on mobile ============ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>

                {/* AI SCORE CARD */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    whileHover={{ boxShadow: '0 12px 40px rgba(138, 117, 186, 0.15)' }}
                    style={{ ...cardStyle, textAlign: 'center' }}
                >
                    <div style={sectionTitle}>
                        <Brain size={16} color="var(--color-primary)" /> Overall AI Score
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <motion.div
                            animate={{ boxShadow: ['0 0 0 0 rgba(138, 117, 186, 0)', '0 0 50px 15px rgba(138, 117, 186, 0.2)', '0 0 0 0 rgba(138, 117, 186, 0)'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ borderRadius: '50%' }}
                        >
                            <CircularProgress value={score} size={160} color="var(--color-primary)" />
                        </motion.div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            style={{ padding: 'clamp(14px, 3vw, 18px)', background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)' }}
                        >
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Rank</div>
                            <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                                <Crown size={18} color="#F59E0B" fill="#F59E0B" /> {getRankLabel()}
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            style={{ padding: 'clamp(14px, 3vw, 18px)', background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)' }}
                        >
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>This Week</div>
                            <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: actualWeeklyTrend !== null && actualWeeklyTrend >= 0 ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                                <TrendingUp size={18} style={{ transform: actualWeeklyTrend !== null && actualWeeklyTrend < 0 ? 'rotate(180deg)' : 'none' }} />
                                {actualWeeklyTrend !== null ? `${actualWeeklyTrend >= 0 ? '+' : ''}${actualWeeklyTrend}%` : 'N/A'}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* STUDY PLANNER */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    whileHover={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }}
                    style={cardStyle}
                >
                    <div style={sectionTitle}>
                        <Clock size={16} color={studyRec.color} /> Recommended Study Plan
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px, 3vw, 22px)', marginBottom: 24, flexWrap: 'wrap' }}>
                        <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                width: 'clamp(60px, 12vw, 80px)', height: 'clamp(60px, 12vw, 80px)',
                                background: `${studyRec.color}15`,
                                borderRadius: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `2px solid ${studyRec.color}30`,
                                flexShrink: 0
                            }}
                        >
                            <Timer size={32} style={{ color: studyRec.color }} />
                        </motion.div>
                        <div style={{ flex: 1, minWidth: 100 }}>
                            <div style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, color: 'var(--color-text)' }}>{studyRec.hoursPerDay || studyRec.hours || '3-4'}</div>
                            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'var(--color-text-secondary)' }}>Hours per day</div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            style={{
                                padding: '10px 18px',
                                background: `${studyRec.color}15`,
                                borderRadius: 30,
                                fontSize: 13,
                                fontWeight: 700,
                                color: studyRec.color,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {studyRec.level} Mode
                        </motion.div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2vw, 12px)' }}>
                        {[
                            { label: 'Morning', time: studyRec.morning?.time || '2 hrs', desc: studyRec.morning?.focus || 'Core concepts' },
                            { label: 'Afternoon', time: studyRec.afternoon?.time || '1.5 hrs', desc: studyRec.afternoon?.focus || 'Practice tests' },
                            { label: 'Evening', time: studyRec.evening?.time || '1.5 hrs', desc: studyRec.evening?.focus || 'Revision' }
                        ].map((slot, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    padding: 'clamp(12px, 2vw, 16px)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 14,
                                    border: '1px solid var(--color-border)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{slot.label}</div>
                                <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0' }}>{slot.time}</div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{slot.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ============ 7-DAY TREND ============ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)' }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                    <div style={sectionTitle}>
                        <Activity size={16} color="var(--color-primary)" /> 7-Day Performance Trend
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 'clamp(100px, 20vw, 160px)', gap: 'clamp(4px, 1.5vw, 10px)', paddingBottom: 8 }}>
                    {weeklyTrend.slice(-7).map((val, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            transition={{ duration: 0.6, delay: 0.5 + idx * 0.08, ease: 'easeOut' }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
                            style={{
                                flex: 1,
                                background: `linear-gradient(to top, var(--color-primary), #A58FD8)`,
                                borderRadius: '8px 8px 0 0',
                                opacity: 0.5 + idx * 0.08,
                                cursor: 'pointer',
                                position: 'relative',
                                minWidth: 20
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                style={{
                                    position: 'absolute',
                                    top: -30,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--color-text)',
                                    color: 'var(--color-bg)',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {val}%
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(9px, 2vw, 11px)', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 10 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
            </motion.div>

            {/* ============ STRENGTHS & WEAKNESSES ============ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 24px)' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ boxShadow: '0 12px 40px rgba(16, 185, 129, 0.1)' }}
                    style={cardStyle}
                >
                    <div style={sectionTitle}>
                        <Award size={16} color="#10B981" /> Strong Areas
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {strengths.length > 0 ? strengths.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{item.score}%</span>
                                </div>
                                <AnimatedBar value={item.score} color="linear-gradient(to right, #10B981, #34D399)" delay={0.6 + i * 0.1} />
                            </motion.div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                <Star size={32} color="#10B981" style={{ marginBottom: 8, opacity: 0.5 }} />
                                <div style={{ fontSize: 14 }}>Complete more quizzes to discover your strengths!</div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ boxShadow: '0 12px 40px rgba(239, 68, 68, 0.1)' }}
                    style={cardStyle}
                >
                    <div style={sectionTitle}>
                        <AlertTriangle size={16} color="#EF4444" /> Areas to Improve
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {weaknesses.length > 0 ? weaknesses.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{item.score}%</span>
                                </div>
                                <AnimatedBar value={Math.max(item.score, 8)} color="linear-gradient(to right, #EF4444, #F87171)" delay={0.7 + i * 0.1} />
                            </motion.div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                <Trophy size={32} color="#10B981" style={{ marginBottom: 8, opacity: 0.5 }} />
                                <div style={{ fontSize: 14 }}>Great job! No weak areas detected yet.</div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ============ LEARNING INSIGHTS ============ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={cardStyle}
            >
                <div style={sectionTitle}>
                    <Lightbulb size={16} color="#F59E0B" /> AI Learning Insights
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
                    {[
                        { icon: '🎯', title: 'Focus Area', desc: weaknesses[0]?.topic || 'Complete more quizzes', color: '#EF4444' },
                        { icon: '⚡', title: 'Quick Win', desc: 'Practice 10 questions daily', color: '#F59E0B' },
                        { icon: '🏆', title: 'Next Milestone', desc: `Reach ${Math.ceil((score + 10) / 10) * 10}% accuracy`, color: '#10B981' },
                        { icon: '📈', title: 'Growth Potential', desc: 'Improve 15% with consistency', color: '#8A75BA' }
                    ].map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                            whileHover={{ scale: 1.03, y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: 'clamp(16px, 3vw, 22px)',
                                background: 'var(--color-bg)',
                                borderRadius: 18,
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 14,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                                style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}
                            >
                                {insight.icon}
                            </motion.div>
                            <div>
                                <div style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{insight.title}</div>
                                <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{insight.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </motion.div>
    );
}
