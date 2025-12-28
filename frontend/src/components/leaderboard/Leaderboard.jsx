import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Timer, Users, RefreshCw } from 'lucide-react';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Leaderboard.css';

export function Leaderboard({ limit }) {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Fetch leaderboard from backend - REAL STUDENTS ONLY
    const fetchLeaderboard = useCallback(async (isRetry = false) => {
        try {
            if (!isRetry) setLoading(true);
            setError(null);

            // Use the configured api service (has correct base URL for production)
            const res = await api.get('/student/leaderboard');

            if (res.data.success && res.data.data?.leaderboard) {
                const leaderboardArray = res.data.data.leaderboard;
                if (leaderboardArray.length > 0) {
                    // Transform backend data to match our format
                    const students = leaderboardArray.map((student, index) => ({
                        id: student._id,
                        name: student.name || 'Student',
                        score: student.xpPoints || 0,
                        accuracy: student.avgScore || 0,
                        testsCompleted: student.testsCompleted || 0,
                        avatar: student.avatar,
                        isCurrentUser: student.isCurrentUser,
                        rank: student.rank || (index + 1)
                    }));
                    setLeaderboardData(students);
                    setRetryCount(0); // Reset retry count on success
                } else {
                    // No students in leaderboard - that's okay, not an error
                    setLeaderboardData([]);
                }
            } else {
                // API returned success: false
                throw new Error('Failed to fetch leaderboard data');
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            setError(err.message || 'Failed to load leaderboard');

            // Auto-retry up to 2 times with increasing delay
            if (retryCount < 2) {
                const delay = 1000 * (retryCount + 1);
                console.log(`📊 Leaderboard auto-retry in ${delay}ms...`);
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchLeaderboard(true);
                }, delay);
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Manual retry handler
    const handleRetry = () => {
        setRetryCount(0);
        fetchLeaderboard();
    };

    const listData = limit ? leaderboardData.slice(3, limit) : leaderboardData.slice(3, 50);

    // Helper to get top 3 with fallback
    const getTopStudent = (index) => leaderboardData[index] || null;

    // Loading state
    if (loading && leaderboardData.length === 0) {
        return (
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h3><Trophy className="text-yellow-500" /> Top Performers</h3>
                </div>
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div className="leaderboard-loading-spinner" style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(99, 102, 241, 0.2)',
                        borderTop: '3px solid #6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px'
                    }} />
                    Loading leaderboard...
                </div>
            </div>
        );
    }

    // Error state with retry button
    if (error && leaderboardData.length === 0) {
        return (
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h3><Trophy className="text-yellow-500" /> Top Performers</h3>
                </div>
                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 12px', fontSize: '0.9rem' }}>
                        {retryCount >= 2 ? 'Unable to load leaderboard' : 'Connecting...'}
                    </p>
                    {retryCount >= 2 && (
                        <button
                            onClick={handleRetry}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                background: 'var(--color-primary, #6366f1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Empty state - No students have activity yet
    if (leaderboardData.length === 0) {
        return (
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h3><Trophy className="text-yellow-500" /> Top Performers</h3>
                    <span className="period-badge">Weekly</span>
                </div>
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <Users size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>No rankings yet</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Complete tests to earn XP and climb the leaderboard!
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h3><Trophy className="text-yellow-500" /> Top Performers</h3>
                <span className="period-badge">Weekly</span>
            </div>

            {/* Top 3 Podium - Only show if we have at least 1 student */}
            {leaderboardData.length > 0 && (
                <div className="top-three">
                    {/* 2nd Place */}
                    {getTopStudent(1) && (
                        <motion.div className="podium-item second" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.2 }}>
                            <div className="podium-avatar-wrapper">
                                <AvatarDisplay avatar={getTopStudent(1).avatar} size={64} />
                                <div className="rank-badge silver">2</div>
                            </div>
                            <span className={`podium-name ${getTopStudent(1).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(1).name}</span>
                            <span className="podium-score">{getTopStudent(1).score} XP</span>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {getTopStudent(0) && (
                        <motion.div className="podium-item first" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.1 }}>
                            <Crown className="crown-icon" size={32} />
                            <div className="podium-avatar-wrapper">
                                <AvatarDisplay avatar={getTopStudent(0).avatar} size={88} selected={true} />
                                <div className="rank-badge gold">1</div>
                            </div>
                            <span className={`podium-name ${getTopStudent(0).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(0).name}</span>
                            <span className="podium-score">{getTopStudent(0).score} XP</span>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {getTopStudent(2) && (
                        <motion.div className="podium-item third" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.3 }}>
                            <div className="podium-avatar-wrapper">
                                <AvatarDisplay avatar={getTopStudent(2).avatar} size={64} />
                                <div className="rank-badge bronze">3</div>
                            </div>
                            <span className={`podium-name ${getTopStudent(2).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(2).name}</span>
                            <span className="podium-score">{getTopStudent(2).score} XP</span>
                        </motion.div>
                    )}
                </div>
            )}

            {/* List 4-End */}
            <div className="leaderboard-list">
                <div className="list-header-row">
                    <span className="w-rank">#</span>
                    <span className="w-user">Student</span>
                    <span className="w-score">XP</span>
                    <span className="w-time">Tests</span>
                </div>
                {listData.map((student, index) => (
                    <motion.div
                        key={student.id}
                        className={`leaderboard-row ${student.isCurrentUser ? 'current-user-row' : ''}`}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 * (index % 10) }}
                    >
                        <span className="rank-number">#{student.rank}</span>
                        <div className="user-info">
                            <AvatarDisplay avatar={student.avatar} size={40} />
                            <span className={`user-name ${student.isCurrentUser ? 'current-user-highlight' : ''}`}>{student.name}</span>
                        </div>
                        <span className="user-score font-bold">{student.score}</span>
                        <div className="user-time">
                            <span>{student.testsCompleted || 0}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* View Full Leaderboard Hint (Only if limited) */}
            {limit && (
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#6366f1', fontWeight: '500' }}>
                    Tap to see full ranking
                </div>
            )}
        </div>
    );
}
