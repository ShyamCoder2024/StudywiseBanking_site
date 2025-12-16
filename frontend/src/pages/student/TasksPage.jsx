import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import api from '../../services/api';

export default function TasksPage() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // Try global-tasks first, fallback to tasks
            const res = await api.get('/student/global-tasks');
            setTasks(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (task) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setTasks(updatedTasks);

        try {
            await api.patch(`/student/global-tasks/${task._id}/toggle`);
        } catch (error) {
            // Revert on failure
            console.error('Failed to update task', error);
            fetchTasks();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="page-container"
            style={{ padding: '20px', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}
        >
            {/* Header */}
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} style={{ color: 'var(--color-text)' }} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-text)' }}>My Tasks</h1>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                        {loading ? 'Loading...' : `${tasks.filter(t => !t.isCompleted).length} remaining`}
                    </p>
                </div>
            </div>

            {/* Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnimatePresence mode="popLayout">
                    {tasks.length === 0 && !loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '40px' }}>
                            <p>No tasks assigned yet.</p>
                        </div>
                    ) : (
                        tasks.map(task => {
                            const isDone = task.isCompleted;
                            return (
                                <motion.div
                                    key={task._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{
                                        background: 'var(--color-card)',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        boxShadow: 'var(--shadow-card)',
                                        cursor: 'pointer',
                                        borderLeft: isDone ? '4px solid #10b981' : '4px solid #4f46e5',
                                        border: '1px solid var(--color-border)',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => toggleTask(task)}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div style={{
                                        color: isDone ? '#10b981' : 'var(--color-text-muted)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1.05rem',
                                            fontWeight: '500',
                                            color: isDone ? 'var(--color-text-muted)' : 'var(--color-text)',
                                            textDecoration: isDone ? 'line-through' : 'none',
                                            transition: 'all 0.2s'
                                        }}>
                                            {task.content}
                                        </p>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                                            {task.tag && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: '#a78bfa',
                                                    background: 'rgba(139, 92, 246, 0.15)',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {task.tag}
                                                </span>
                                            )}
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={12} /> Assigned by Admin
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
