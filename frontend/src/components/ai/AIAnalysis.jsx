import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Target, Zap, Star, RefreshCw,
    Award, AlertTriangle, TrendingUp, TrendingDown,
    Crown, LayoutDashboard, Sparkles, Brain, Activity,
    Clock, Calendar, Flame, Trophy, ChevronUp, ChevronDown,
    BarChart3, PieChart, Timer, GraduationCap, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ============ ANIMATED COUNTER HOOK ============
function useAnimatedCounter(end, duration = 1500) {
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

// ============ ANIMATED PROGRESS BAR ============
function AnimatedBar({ value, color, delay = 0 }) {
    return (
        <div style={{ height: 10, background: 'var(--color-bg)', borderRadius: 5, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, delay, ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: 5 }}
            />
        </div>
    );
}

// ============ STAT CARD WITH ANIMATION ============
function StatCard({ icon: Icon, label, value, trend, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                    width: 44, height: 44,
                    background: `${color}15`,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon size={22} style={{ color }} />
                </div>
                {trend !== undefined && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        fontSize: 12, fontWeight: 600,
                        color: trend >= 0 ? '#10B981' : '#EF4444'
                    }}>
                        {trend >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        </motion.div>
    );
}

// ============ CIRCULAR PROGRESS ============
function CircularProgress({ value, size = 180, strokeWidth = 12, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const animatedValue = useAnimatedCounter(value, 2000);

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
                    transition={{ duration: 2, ease: 'easeOut' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--color-text)' }}>{animatedValue}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase' }}>AI Score</span>
            </div>
        </div>
    );
}

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

    // Data Processing
    const data = dashboardData || {};
    const ai = aiAnalysis || {};
    const score = data.accuracy || 0;
    const weeklyTrend = data.performanceGraph?.map(p => p.score) || [40, 50, 45, 60, 55, 70, 75];

    const strengths = ai.strengths?.length > 0 ? ai.strengths : [
        { topic: "Data Interpretation", score: 85 },
        { topic: "Simplification", score: 92 },
        { topic: "Inequalities", score: 78 }
    ];

    const weaknesses = ai.weaknesses?.length > 0 ? ai.weaknesses : [
        { topic: "General", score: 0 }
    ];

    // Calculate study time recommendation
    const getStudyRecommendation = () => {
        if (score < 40) return { hours: "5-6", level: "Intensive", color: "#EF4444" };
        if (score < 60) return { hours: "4-5", level: "Focused", color: "#F59E0B" };
        if (score < 80) return { hours: "3-4", level: "Balanced", color: "#10B981" };
        return { hours: "2-3", level: "Maintenance", color: "#8A75BA" };
    };
    const studyRec = getStudyRecommendation();

    // Performance metrics
    const performanceMetrics = {
        quizzesCompleted: data.totalAttempts || 0,
        questionsAnswered: data.totalQuestions || 0,
        correctAnswers: data.totalCorrect || 0,
        streakDays: data.streakCount || 0,
        xpPoints: data.xpPoints || 0,
        averageScore: data.averageScore || 0
    };

    // Styles
    const cardStyle = {
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
    };

    const sectionTitle = {
        fontSize: 13,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-text-secondary)',
        marginBottom: 20,
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
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
            {/* ============ HEADER ============ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        style={{
                            width: 60, height: 60,
                            background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                            borderRadius: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(138, 117, 186, 0.35)'
                        }}
                    >
                        <Brain color="white" size={30} />
                    </motion.div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            Performance Analytics
                            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Sparkles size={22} color="var(--color-primary)" />
                            </motion.span>
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '6px 0 0 0' }}>
                            AI-powered insights to accelerate your learning journey
                        </p>
                    </div>
                </div>
                <motion.button
                    onClick={handleRefresh}
                    disabled={analyzing}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, var(--color-primary), #A58FD8)',
                        color: 'white', border: 'none', borderRadius: 14,
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(138, 117, 186, 0.4)'
                    }}
                >
                    <RefreshCw size={18} className={analyzing ? "animate-spin" : ""} />
                    {analyzing ? "Analyzing..." : "Refresh Analysis"}
                </motion.button>
            </motion.div>

            {/* ============ STATS ROW ============ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon={Target} label="Quizzes Taken" value={performanceMetrics.quizzesCompleted} color="#8A75BA" delay={1} />
                <StatCard icon={BarChart3} label="Questions" value={performanceMetrics.questionsAnswered} color="#6EBCC3" delay={2} />
                <StatCard icon={Zap} label="Accuracy" value={`${score}%`} trend={5} color="#F59E0B" delay={3} />
                <StatCard icon={Flame} label="Day Streak" value={performanceMetrics.streakDays} color="#EF4444" delay={4} />
                <StatCard icon={Trophy} label="XP Points" value={performanceMetrics.xpPoints} color="#10B981" delay={5} />
                <StatCard icon={GraduationCap} label="Avg Score" value={`${performanceMetrics.averageScore}%`} color="#8B5CF6" delay={6} />
            </div>

            {/* ============ MAIN GRID ============ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>

                {/* LEFT COLUMN - Score & Study Plan */}
                <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

                    {/* AI SCORE CARD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ ...cardStyle, textAlign: 'center' }}
                    >
                        <div style={sectionTitle}>
                            <Brain size={16} color="var(--color-primary)" /> Overall AI Score
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                            <motion.div
                                animate={{ boxShadow: ['0 0 0 0 rgba(138, 117, 186, 0)', '0 0 40px 10px rgba(138, 117, 186, 0.2)', '0 0 0 0 rgba(138, 117, 186, 0)'] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ borderRadius: '50%' }}
                            >
                                <CircularProgress value={score} color="var(--color-primary)" />
                            </motion.div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 14, border: '1px solid var(--color-border)' }}
                            >
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Rank</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                                    <Crown size={18} color="#F59E0B" fill="#F59E0B" /> Top 15%
                                </div>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                style={{ padding: 16, background: 'var(--color-bg)', borderRadius: 14, border: '1px solid var(--color-border)' }}
                            >
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>This Week</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                                    <TrendingUp size={18} /> +12%
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* STUDY PLANNER CARD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        style={cardStyle}
                    >
                        <div style={sectionTitle}>
                            <Clock size={16} color={studyRec.color} /> Recommended Study Plan
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    width: 80, height: 80,
                                    background: `${studyRec.color}15`,
                                    borderRadius: 20,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `2px solid ${studyRec.color}30`
                                }}
                            >
                                <Timer size={36} style={{ color: studyRec.color }} />
                            </motion.div>
                            <div>
                                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)' }}>{studyRec.hours}</div>
                                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Hours per day</div>
                            </div>
                            <div style={{
                                marginLeft: 'auto',
                                padding: '8px 16px',
                                background: `${studyRec.color}15`,
                                borderRadius: 30,
                                fontSize: 13,
                                fontWeight: 700,
                                color: studyRec.color
                            }}>
                                {studyRec.level} Mode
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'Morning', time: '2 hrs', desc: 'Core concepts' },
                                { label: 'Afternoon', time: '1.5 hrs', desc: 'Practice tests' },
                                { label: 'Evening', time: '1.5 hrs', desc: 'Revision' }
                            ].map((slot, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        padding: 14,
                                        background: 'var(--color-bg)',
                                        borderRadius: 12,
                                        border: '1px solid var(--color-border)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{slot.label}</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '4px 0' }}>{slot.time}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{slot.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* PERFORMANCE TREND */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ ...cardStyle, gridColumn: 'span 12' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={sectionTitle}>
                            <Activity size={16} color="var(--color-primary)" /> 7-Day Performance Trend
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            Last updated: Today
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, gap: 8, paddingBottom: 8 }}>
                        {weeklyTrend.slice(-7).map((val, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }}
                                whileHover={{ opacity: 1, scale: 1.08 }}
                                style={{
                                    flex: 1,
                                    background: `linear-gradient(to top, var(--color-primary), #A58FD8)`,
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.5 + idx * 0.08,
                                    cursor: 'pointer',
                                    position: 'relative'
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
                                        fontSize: 12,
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {val}%
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 8 }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                    </div>
                </motion.div>

                {/* STRENGTHS & WEAKNESSES */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ ...cardStyle, gridColumn: 'span 6' }}
                >
                    <div style={sectionTitle}>
                        <Award size={16} color="#10B981" /> Strong Areas
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {strengths.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{item.score}%</span>
                                </div>
                                <AnimatedBar value={item.score} color="linear-gradient(to right, #10B981, #34D399)" delay={0.6 + i * 0.1} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ ...cardStyle, gridColumn: 'span 6' }}
                >
                    <div style={sectionTitle}>
                        <AlertTriangle size={16} color="#EF4444" /> Areas to Improve
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {weaknesses.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.topic}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{item.score}%</span>
                                </div>
                                <AnimatedBar value={Math.max(item.score, 8)} color="linear-gradient(to right, #EF4444, #F87171)" delay={0.7 + i * 0.1} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* LEARNING INSIGHTS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ ...cardStyle, gridColumn: 'span 12' }}
                >
                    <div style={sectionTitle}>
                        <Lightbulb size={16} color="#F59E0B" /> AI Learning Insights
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                        {[
                            { icon: '🎯', title: 'Focus Area', desc: weaknesses[0]?.topic || 'Complete more quizzes', color: '#EF4444' },
                            { icon: '⚡', title: 'Quick Win', desc: 'Practice 10 questions daily to boost accuracy', color: '#F59E0B' },
                            { icon: '🏆', title: 'Next Milestone', desc: `Reach ${Math.ceil((score + 10) / 10) * 10}% accuracy for bonus XP`, color: '#10B981' },
                            { icon: '📈', title: 'Growth Potential', desc: 'You can improve by 15% with consistent practice', color: '#8A75BA' }
                        ].map((insight, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02, y: -4 }}
                                style={{
                                    padding: 20,
                                    background: 'var(--color-bg)',
                                    borderRadius: 16,
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 14,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: 28 }}>{insight.icon}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{insight.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{insight.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @media (max-width: 1024px) {
                    [style*="gridColumn: span 6"] { grid-column: span 12 !important; }
                }
                @media (max-width: 768px) {
                    [style*="gridTemplateColumns: repeat(12"] { grid-template-columns: 1fr !important; }
                    [style*="gridColumn: span"] { grid-column: span 1 !important; }
                }
            `}</style>
        </motion.div>
    );
}
