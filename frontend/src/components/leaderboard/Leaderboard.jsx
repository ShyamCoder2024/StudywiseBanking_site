import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Timer } from 'lucide-react';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import { useAuth } from '../../context/AuthContext';
import { getAvatarByIndex } from '../../utils/avatars';
import './Leaderboard.css';

// Generate mock leaderboard data using consistent avatars
const generateLeaderboardData = () => {
    const names = [
        "Priya Sharma", "Rahul Verma", "Amit Patel", "Sneha Gupta", "Vikram Singh",
        "Aditya Kumar", "Neha Reddy", "Rohan Das", "Kavita Iyer", "Arjun Mehta",
        "Sanya Malhotra", "Dev Mishra", "Ananya Joshi", "Karan Kapoor", "Pooja Hegde",
        "Manish Malhotra", "Kiara Advani", "Sidharth Malhotra", "Alia Bhatt", "Ranbir Kapoor",
        "Deepika Padukone", "Ranveer Singh", "Shahrukh Khan", "Salman Khan", "Aamir Khan",
        "Akshay Kumar", "Ajay Devgn", "Hrithik Roshan", "Tiger Shroff", "Varun Dhawan",
        "Shraddha Kapoor", "Kriti Sanon", "Disha Patani", "Tara Sutaria", "Ananya Panday",
        "Sara Ali Khan", "Janhvi Kapoor", "Khushi Kapoor", "Shanaya Kapoor", "Suhana Khan",
        "Aryan Khan", "AbRam Khan", "Taimur Ali Khan", "Jeh Ali Khan", "Inaya Naumi Kemmu",
        "Vamika Kohli", "Akaay Kohli", "Raha Kapoor", "Malti Marie Jonas", "Devi Singh Grover"
    ];

    let students = names.map((name, index) => {
        // Random Score between 4000 and 10000
        const score = Math.floor(Math.random() * (10000 - 4000) + 4000);
        // Random Time between 10 mins (600s) and 60 mins (3600s)
        const timeTaken = Math.floor(Math.random() * (3600 - 600) + 600);

        // Use avatar from shared utility for consistency
        const avatar = getAvatarByIndex(index);

        return {
            id: `mock-${index}`,
            name,
            score,
            timeTaken,
            avatar
        };
    });

    // Sort: 1. Score (Desc), 2. Time (Asc)
    students.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
    });

    // Assign Rank
    return students.map((student, index) => ({
        ...student,
        rank: index + 1
    }));
};

// Generate once
const MOCK_LEADERBOARD_DATA = generateLeaderboardData();

export function Leaderboard({ limit }) {
    const { user } = useAuth();
    const [backendData, setBackendData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch leaderboard from backend
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/student/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data.leaderboard?.length > 0) {
                        // Check if any student has XP > 0 (real activity)
                        const hasRealActivity = data.data.leaderboard.some(s => s.xpPoints > 0);
                        if (hasRealActivity) {
                            setBackendData(data.data);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // Use backend data if available and has real activity, otherwise use mock
    const leaderboardData = React.useMemo(() => {
        if (backendData && backendData.leaderboard?.length > 0) {
            // Transform backend data to match our format
            return backendData.leaderboard.map((student, index) => ({
                id: student._id,
                name: student.name,
                score: student.xpPoints,
                timeTaken: 0, // Backend doesn't track time for leaderboard
                avatar: student.avatar,
                isCurrentUser: student.isCurrentUser,
                rank: index + 1
            }));
        }

        // Fall back to mock data (with user merged in)
        if (!user) return MOCK_LEADERBOARD_DATA;

        // Check if user is already in the mock data (by name or a unique identifier)
        const existingIndex = MOCK_LEADERBOARD_DATA.findIndex(
            s => s.name === `${user.firstName} ${user.lastName}`
        );

        let data;
        if (existingIndex >= 0) {
            // User already exists, update their avatar
            data = MOCK_LEADERBOARD_DATA.map((s, idx) => {
                if (idx === existingIndex) {
                    return { ...s, avatar: user.avatar, isCurrentUser: true };
                }
                return s;
            });
        } else {
            // Add user to the list with a realistic score
            const userEntry = {
                id: 'current-user',
                name: `${user.firstName || 'You'} ${user.lastName || ''}`.trim(),
                score: Math.floor(Math.random() * (9000 - 5000) + 5000),
                timeTaken: Math.floor(Math.random() * (2500 - 800) + 800),
                avatar: user.avatar,
                isCurrentUser: true
            };
            data = [...MOCK_LEADERBOARD_DATA, userEntry];
        }

        // Re-sort and re-rank
        data.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
        });

        return data.map((student, index) => ({
            ...student,
            rank: index + 1
        }));
    }, [user, backendData]);

    const listData = limit ? leaderboardData.slice(3, limit) : leaderboardData.slice(3, 50);

    // Helper to get top 3 with fallback
    const getTopStudent = (index) => leaderboardData[index] || { name: '-', score: 0, timeTaken: 0, avatar: null };


    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h3><Trophy className="text-yellow-500" /> Top Performers</h3>
                <span className="period-badge">Weekly</span>
            </div>

            {/* Top 3 Podium */}
            <div className="top-three">
                {/* 2nd Place */}
                <motion.div className="podium-item second" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="podium-avatar-wrapper">
                        <AvatarDisplay avatar={getTopStudent(1).avatar} size={64} />
                        <div className="rank-badge silver">2</div>
                    </div>
                    <span className={`podium-name ${getTopStudent(1).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(1).name}</span>
                    <span className="podium-score">{getTopStudent(1).score} XP</span>
                    <span className="podium-time">{Math.floor(getTopStudent(1).timeTaken / 60)}m</span>
                </motion.div>

                {/* 1st Place */}
                <motion.div className="podium-item first" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Crown className="crown-icon" size={32} />
                    <div className="podium-avatar-wrapper">
                        <AvatarDisplay avatar={getTopStudent(0).avatar} size={88} selected={true} />
                        <div className="rank-badge gold">1</div>
                    </div>
                    <span className={`podium-name ${getTopStudent(0).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(0).name}</span>
                    <span className="podium-score">{getTopStudent(0).score} XP</span>
                    <span className="podium-time">{Math.floor(getTopStudent(0).timeTaken / 60)}m</span>
                </motion.div>

                {/* 3rd Place */}
                <motion.div className="podium-item third" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="podium-avatar-wrapper">
                        <AvatarDisplay avatar={getTopStudent(2).avatar} size={64} />
                        <div className="rank-badge bronze">3</div>
                    </div>
                    <span className={`podium-name ${getTopStudent(2).isCurrentUser ? 'current-user-highlight' : ''}`}>{getTopStudent(2).name}</span>
                    <span className="podium-score">{getTopStudent(2).score} XP</span>
                    <span className="podium-time">{Math.floor(getTopStudent(2).timeTaken / 60)}m</span>
                </motion.div>
            </div>

            {/* List 4-End */}
            <div className="leaderboard-list">
                <div className="list-header-row">
                    <span className="w-rank">#</span>
                    <span className="w-user">Student</span>
                    <span className="w-score">Score</span>
                    <span className="w-time">Time</span>
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
                            <Timer size={14} className="text-gray-400 mr-1" />
                            <span>{Math.floor(student.timeTaken / 60)}m</span>
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
