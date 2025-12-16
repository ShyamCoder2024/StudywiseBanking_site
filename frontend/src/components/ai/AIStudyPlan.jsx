import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import './AIStudyPlan.css';

// Mock personalized study plan for frontend demo
const MOCK_STUDY_PLAN = {
    targetExam: 'IBPS PO 2024',
    daysRemaining: 45,
    weeklyHours: 35,
    dailySchedule: [
        {
            day: 'Monday', subjects: [
                { name: 'Quantitative Aptitude', hours: 3, topics: ['Number Series', 'Simplification'] },
                { name: 'Reasoning', hours: 2, topics: ['Syllogism', 'Coding-Decoding'] },
            ]
        },
        {
            day: 'Tuesday', subjects: [
                { name: 'English Language', hours: 2.5, topics: ['Reading Comprehension', 'Grammar'] },
                { name: 'Banking Awareness', hours: 2, topics: ['RBI Policies', 'Banking Terms'] },
            ]
        },
        {
            day: 'Wednesday', subjects: [
                { name: 'Quantitative Aptitude', hours: 3, topics: ['Data Interpretation', 'Percentage'] },
                { name: 'Computer Awareness', hours: 1.5, topics: ['MS Office', 'Networking'] },
            ]
        },
        {
            day: 'Thursday', subjects: [
                { name: 'Reasoning', hours: 3, topics: ['Puzzles', 'Seating Arrangement'] },
                { name: 'General Awareness', hours: 1.5, topics: ['Current Affairs'] },
            ]
        },
        {
            day: 'Friday', subjects: [
                { name: 'Mock Test', hours: 3, topics: ['Full Length Practice'] },
                { name: 'Error Analysis', hours: 2, topics: ['Review Mistakes'] },
            ]
        },
        {
            day: 'Saturday', subjects: [
                { name: 'Weak Areas Focus', hours: 4, topics: ['Based on AI Analysis'] },
            ]
        },
        {
            day: 'Sunday', subjects: [
                { name: 'Revision', hours: 3, topics: ['Weekly Topics Revision'] },
            ]
        },
    ],
    milestones: [
        { week: 1, goal: 'Complete Number Series & Syllogism basics', status: 'completed' },
        { week: 2, goal: 'Finish Data Interpretation foundations', status: 'completed' },
        { week: 3, goal: 'Master Reading Comprehension strategies', status: 'in-progress' },
        { week: 4, goal: 'Complete Banking Awareness syllabus', status: 'upcoming' },
        { week: 5, goal: 'Full-length mock tests (Min 3)', status: 'upcoming' },
        { week: 6, goal: 'Final revision and exam prep', status: 'upcoming' },
    ],
    topperComparison: {
        yourScore: 72,
        topperScore: 92,
        gap: 20,
        keyDifferences: [
            { area: 'Quantitative Speed', you: 45, topper: 85 },
            { area: 'Accuracy Rate', you: 78, topper: 94 },
            { area: 'Time Management', you: 65, topper: 90 },
            { area: 'Mock Test Practice', you: 12, topper: 35 },
        ]
    }
};

const dayColors = {
    'Monday': '#8A75BA',
    'Tuesday': '#6EBCC3',
    'Wednesday': '#ED6771',
    'Thursday': '#FFC107',
    'Friday': '#4CAF50',
    'Saturday': '#FF9800',
    'Sunday': '#9C27B0',
};

export function AIStudyPlan() {
    const [plan] = useState(MOCK_STUDY_PLAN);
    const [activeTab, setActiveTab] = useState('schedule');

    const getMilestoneIcon = (status) => {
        if (status === 'completed') return '✅';
        if (status === 'in-progress') return '🔄';
        return '📅';
    };

    return (
        <div className="study-plan">
            {/* Header */}
            <div className="plan-header">
                <div className="plan-info">
                    <h2>📚 Your AI Study Plan</h2>
                    <p>Personalized for {plan.targetExam}</p>
                </div>
                <div className="plan-stats">
                    <div className="plan-stat">
                        <span className="stat-value">{plan.daysRemaining}</span>
                        <span className="stat-label">Days Left</span>
                    </div>
                    <div className="plan-stat">
                        <span className="stat-value">{plan.weeklyHours}h</span>
                        <span className="stat-label">Weekly</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="plan-tabs">
                <button
                    className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    📅 Weekly Schedule
                </button>
                <button
                    className={`tab ${activeTab === 'milestones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('milestones')}
                >
                    🎯 Milestones
                </button>
                <button
                    className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
                    onClick={() => setActiveTab('compare')}
                >
                    📊 vs Toppers
                </button>
            </div>

            {/* Weekly Schedule */}
            {activeTab === 'schedule' && (
                <div className="schedule-grid">
                    {plan.dailySchedule.map((day, i) => (
                        <Card key={i} className="day-card" style={{ '--day-color': dayColors[day.day] }}>
                            <div className="day-header">
                                <h4>{day.day}</h4>
                                <span className="total-hours">
                                    {day.subjects.reduce((sum, s) => sum + s.hours, 0)}h
                                </span>
                            </div>
                            <div className="day-subjects">
                                {day.subjects.map((subject, j) => (
                                    <div key={j} className="subject-block">
                                        <div className="subject-name">{subject.name}</div>
                                        <div className="subject-time">{subject.hours}h</div>
                                        <div className="subject-topics">
                                            {subject.topics.join(' • ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Milestones */}
            {activeTab === 'milestones' && (
                <Card className="milestones-card">
                    <div className="milestones-timeline">
                        {plan.milestones.map((milestone, i) => (
                            <div key={i} className={`milestone ${milestone.status}`}>
                                <div className="milestone-marker">
                                    <span className="milestone-icon">{getMilestoneIcon(milestone.status)}</span>
                                    <span className="milestone-week">Week {milestone.week}</span>
                                </div>
                                <div className="milestone-content">
                                    <p>{milestone.goal}</p>
                                    <span className={`status-badge ${milestone.status}`}>
                                        {milestone.status.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Topper Comparison */}
            {activeTab === 'compare' && (
                <div className="topper-comparison">
                    <Card className="comparison-header-card">
                        <div className="comparison-scores">
                            <div className="score-box you">
                                <span className="label">Your Score</span>
                                <span className="score">{plan.topperComparison.yourScore}%</span>
                            </div>
                            <div className="gap-indicator">
                                <span className="gap-label">Gap to Bridge</span>
                                <span className="gap-value">{plan.topperComparison.gap} points</span>
                            </div>
                            <div className="score-box topper">
                                <span className="label">Top 1% Score</span>
                                <span className="score">{plan.topperComparison.topperScore}%</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="differences-card">
                        <h4>Key Areas to Improve</h4>
                        <div className="differences-list">
                            {plan.topperComparison.keyDifferences.map((diff, i) => (
                                <div key={i} className="diff-item">
                                    <span className="diff-area">{diff.area}</span>
                                    <div className="diff-bars">
                                        <div className="bar-container">
                                            <div
                                                className="bar you"
                                                style={{ width: `${diff.you}%` }}
                                            >
                                                <span>{diff.you}</span>
                                            </div>
                                        </div>
                                        <div className="bar-container">
                                            <div
                                                className="bar topper"
                                                style={{ width: `${diff.topper}%` }}
                                            >
                                                <span>{diff.topper}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="legend">
                            <span className="legend-item you">You</span>
                            <span className="legend-item topper">Top 1%</span>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default AIStudyPlan;
