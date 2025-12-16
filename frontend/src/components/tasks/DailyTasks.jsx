import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import './DailyTasks.css';

// Mock daily tasks from admin
const MOCK_DAILY_TASKS = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    tasks: [
        { id: 1, title: 'Complete 20 Quantitative Aptitude questions', category: 'Quant', points: 20, completed: false },
        { id: 2, title: 'Watch Banking Awareness video (RBI Functions)', category: 'Banking', points: 15, completed: true },
        { id: 3, title: 'Practice 10 Syllogism problems', category: 'Reasoning', points: 15, completed: false },
        { id: 4, title: 'Read 2 Reading Comprehension passages', category: 'English', points: 10, completed: true },
        { id: 5, title: 'Take a 30-question mock test', category: 'Mock Test', points: 30, completed: false },
        { id: 6, title: 'Review yesterday\'s mistakes', category: 'Revision', points: 10, completed: false },
    ],
    bonusTasks: [
        { id: 7, title: 'Complete current affairs quiz', category: 'GK', points: 15, completed: false },
        { id: 8, title: 'Help a fellow student with doubts', category: 'Community', points: 10, completed: false },
    ]
};

const categoryColors = {
    'Quant': '#8A75BA',
    'Banking': '#6EBCC3',
    'Reasoning': '#FF9F43',
    'English': '#4CAF50',
    'Mock Test': '#ED6771',
    'Revision': '#9C27B0',
    'GK': '#2196F3',
    'Community': '#FF6B6B',
};

export function DailyTasks() {
    const [tasks, setTasks] = useState(MOCK_DAILY_TASKS.tasks);
    const [bonusTasks, setBonusTasks] = useState(MOCK_DAILY_TASKS.bonusTasks);

    const toggleTask = (taskId, isBonus = false) => {
        if (isBonus) {
            setBonusTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            ));
        } else {
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
            ));
        }
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completedPoints = [...tasks, ...bonusTasks].filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
    const totalPoints = [...tasks, ...bonusTasks].reduce((sum, t) => sum + t.points, 0);
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="daily-tasks">
            {/* Header */}
            <div className="tasks-header">
                <div>
                    <h2>📋 Today's Tasks</h2>
                    <p className="tasks-date">{MOCK_DAILY_TASKS.date}</p>
                </div>
                <div className="tasks-summary">
                    <div className="summary-stat">
                        <span className="summary-value">{completedTasks}/{totalTasks}</span>
                        <span className="summary-label">Tasks Done</span>
                    </div>
                    <div className="summary-stat points">
                        <span className="summary-value">{completedPoints}</span>
                        <span className="summary-label">Points Earned</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="progress-card">
                <div className="progress-header">
                    <span>Daily Progress</span>
                    <span className="progress-percent">{progressPercent}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                    >
                        {progressPercent >= 100 && <span className="complete-badge">🎉 Complete!</span>}
                    </div>
                </div>
                <div className="progress-message">
                    {progressPercent < 50 && "Keep going! You can do it! 💪"}
                    {progressPercent >= 50 && progressPercent < 100 && "Great progress! Almost there! 🔥"}
                    {progressPercent >= 100 && "Amazing! All tasks completed! 🏆"}
                </div>
            </Card>

            {/* Main Tasks */}
            <Card className="tasks-list-card">
                <h3>📌 Required Tasks</h3>
                <div className="tasks-list">
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                            style={{ '--delay': `${index * 0.05}s` }}
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className="task-checkbox">
                                {task.completed ? '✓' : ''}
                            </div>
                            <div className="task-content">
                                <span className="task-title">{task.title}</span>
                                <div className="task-meta">
                                    <span
                                        className="task-category"
                                        style={{ '--cat-color': categoryColors[task.category] }}
                                    >
                                        {task.category}
                                    </span>
                                    <span className="task-points">+{task.points} pts</span>
                                </div>
                            </div>
                            <div className="task-status">
                                {task.completed ? '✅' : '⭕'}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Bonus Tasks */}
            <Card className="tasks-list-card bonus">
                <h3>⭐ Bonus Tasks</h3>
                <p className="bonus-note">Complete these for extra points!</p>
                <div className="tasks-list">
                    {bonusTasks.map((task, index) => (
                        <div
                            key={task.id}
                            className={`task-item bonus ${task.completed ? 'completed' : ''}`}
                            style={{ '--delay': `${index * 0.05}s` }}
                            onClick={() => toggleTask(task.id, true)}
                        >
                            <div className="task-checkbox">
                                {task.completed ? '✓' : ''}
                            </div>
                            <div className="task-content">
                                <span className="task-title">{task.title}</span>
                                <div className="task-meta">
                                    <span
                                        className="task-category"
                                        style={{ '--cat-color': categoryColors[task.category] }}
                                    >
                                        {task.category}
                                    </span>
                                    <span className="task-points bonus">+{task.points} bonus pts</span>
                                </div>
                            </div>
                            <div className="task-status">
                                {task.completed ? '✅' : '⭕'}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Today's Comparison */}
            <Card className="comparison-card">
                <h3>📊 Today's Standing</h3>
                <div className="comparison-stats">
                    <div className="comp-stat">
                        <span className="comp-value">#42</span>
                        <span className="comp-label">Your Rank Today</span>
                    </div>
                    <div className="comp-stat">
                        <span className="comp-value">78%</span>
                        <span className="comp-label">Avg. Completion</span>
                    </div>
                    <div className="comp-stat">
                        <span className="comp-value">156</span>
                        <span className="comp-label">Students Active</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default DailyTasks;
