import { useState, useEffect } from 'react';
import { Plus, MoreVertical, CheckCircle2, Clock, FileText, Users, BookOpen, ListTodo, TrendingUp, ExternalLink, Eye, Settings, Calendar, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Loader } from '../../components/ui/Loader';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryHover: '#7A66A8',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    successLight: '#E6F5F7',
    warning: '#ED6771',
    warningLight: '#FCE6E8',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB',
    shadowCard: '0 4px 12px rgba(0, 0, 0, 0.04)',
    shadowHover: '0 6px 16px rgba(0, 0, 0, 0.08)',
    radius: '12px'
};

export function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeQuizzes: 0,
        pendingTasks: 0,
        avgPerformance: 0
    });
    const [quizzes, setQuizzes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Exam Card Settings
    const [examSettings, setExamSettings] = useState({
        title: 'Upcoming Exam',
        examName: 'IBPS PO 2024',
        date: 'March 2024',
        examDateTime: '', // ISO datetime string for countdown
        description: 'Prepare for the upcoming IBPS PO examination',
        targetAudience: 'all'
    });
    const [showExamModal, setShowExamModal] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [studentsRes, quizzesRes, tasksRes] = await Promise.all([
                    api.get('/admin/students').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/quizzes').catch(() => ({ data: { data: [] } })),
                    api.get('/admin/global-tasks').catch(() => ({ data: { data: [] } }))
                ]);

                const students = studentsRes.data?.data || [];
                const fetchedQuizzes = quizzesRes.data?.data || [];
                const fetchedTasks = tasksRes.data?.data || [];

                setStats({
                    totalStudents: students.length,
                    activeQuizzes: fetchedQuizzes.length,
                    pendingTasks: fetchedTasks.filter(t => t.status !== 'completed').length,
                    avgPerformance: Math.round(students.reduce((acc, s) => acc + (s.avgScore || 0), 0) / (students.length || 1))
                });

                // Get top 5 most recent quizzes
                const sortedQuizzes = fetchedQuizzes
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setQuizzes(sortedQuizzes);
                setTasks(fetchedTasks.filter(t => t.status !== 'completed').slice(0, 5));

                // Fetch exam settings
                try {
                    const settingsRes = await api.get('/admin/settings/upcoming_exam');
                    if (settingsRes.data?.data) {
                        setExamSettings(settingsRes.data.data);
                    }
                } catch {
                    // Use defaults
                }
            } catch (err) {
                console.error("Dashboard Fetch Error", err);
                setError("Unable to load data. Please check if the server is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const saveExamSettings = async () => {
        setSavingSettings(true);
        try {
            await api.put('/admin/settings/upcoming_exam', { value: examSettings });
            setShowExamModal(false);
            alert('Exam card settings saved successfully!');
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <Loader />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        padding: '16px',
                        backgroundColor: BRAND.warningLight,
                        border: `1px solid ${BRAND.warning}`,
                        borderRadius: BRAND.radius,
                        color: '#b91c1c',
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Header Card */}
                <div style={{
                    backgroundColor: BRAND.card,
                    padding: '24px',
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Dashboard Overview</h1>
                        <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>Manage your education platform efficiently.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/quizzes')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: BRAND.primary,
                            color: '#ffffff',
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryHover}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND.primary}
                    >
                        <Plus size={18} />
                        <span>Create Quiz</span>
                    </button>
                </div>

                {/* Clickable Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <ClickableStatCard
                        label="Total Students"
                        value={stats.totalStudents}
                        trend="+12%"
                        icon={<Users size={22} color={BRAND.success} />}
                        bgColor={BRAND.successLight}
                        onClick={() => navigate('/admin/students')}
                    />
                    <ClickableStatCard
                        label="Active Quizzes"
                        value={stats.activeQuizzes}
                        trend="+2 this week"
                        icon={<BookOpen size={22} color={BRAND.primary} />}
                        bgColor={BRAND.primaryLight}
                        onClick={() => navigate('/admin/quizzes')}
                    />
                    <ClickableStatCard
                        label="Pending Tasks"
                        value={stats.pendingTasks}
                        trend={stats.pendingTasks > 0 ? "Action needed" : "All done!"}
                        icon={<ListTodo size={22} color={stats.pendingTasks > 0 ? BRAND.warning : BRAND.success} />}
                        bgColor={stats.pendingTasks > 0 ? BRAND.warningLight : BRAND.successLight}
                        warning={stats.pendingTasks > 0}
                        onClick={() => navigate('/admin/tasks')}
                    />
                    <ClickableStatCard
                        label="Avg Performance"
                        value={`${stats.avgPerformance}%`}
                        trend="+4.3%"
                        icon={<TrendingUp size={22} color={BRAND.primary} />}
                        bgColor={BRAND.primaryLight}
                        onClick={() => navigate('/admin/students')}
                    />
                </div>

                {/* Exam Card Settings - Quick Edit */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: BRAND.primaryLight }}>
                                <Calendar size={20} color={BRAND.primary} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Upcoming Exam Card</h3>
                                <p style={{ fontSize: '12px', color: BRAND.textMuted, margin: '2px 0 0' }}>Edit what students see on their dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowExamModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: `1px solid ${BRAND.primary}`,
                                backgroundColor: 'transparent',
                                color: BRAND.primary,
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Settings size={16} />
                            Edit Settings
                        </button>
                    </div>

                    {/* Preview */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: BRAND.bg,
                        borderRadius: '10px',
                        border: `1px solid ${BRAND.border}`
                    }}>
                        <div style={{ fontSize: '11px', color: BRAND.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Preview</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: BRAND.text }}>{examSettings.examName || 'Exam Name'}</div>
                        <div style={{ fontSize: '13px', color: BRAND.primary, fontWeight: '500', marginTop: '4px' }}>{examSettings.date || 'Date'}</div>
                        <div style={{ fontSize: '13px', color: BRAND.textSecondary, marginTop: '6px' }}>{examSettings.description || 'Description'}</div>
                        <div style={{ marginTop: '8px' }}>
                            <span style={{
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: examSettings.targetAudience === 'paid' ? BRAND.successLight :
                                    examSettings.targetAudience === 'unpaid' ? BRAND.warningLight : BRAND.primaryLight,
                                color: examSettings.targetAudience === 'paid' ? BRAND.success :
                                    examSettings.targetAudience === 'unpaid' ? BRAND.warning : BRAND.primary,
                                fontWeight: '600'
                            }}>
                                {examSettings.targetAudience === 'paid' ? 'Paid Only' :
                                    examSettings.targetAudience === 'unpaid' ? 'Unpaid Only' : 'All Users'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Exam Settings Modal */}
                {showExamModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '16px'
                    }} onClick={() => setShowExamModal(false)}>
                        <div style={{
                            backgroundColor: BRAND.card,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '480px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: BRAND.text }}>Edit Upcoming Exam Card</h3>
                                <button onClick={() => setShowExamModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BRAND.textMuted }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Exam Name</label>
                                    <input
                                        type="text"
                                        value={examSettings.examName}
                                        onChange={e => setExamSettings({ ...examSettings, examName: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, fontSize: '14px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Date Label</label>
                                    <input
                                        type="text"
                                        value={examSettings.date}
                                        onChange={e => setExamSettings({ ...examSettings, date: e.target.value })}
                                        placeholder="e.g., AUG TO DEC"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, fontSize: '14px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>
                                        Exam Date & Time (for Countdown)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={examSettings.examDateTime || ''}
                                        onChange={e => setExamSettings({ ...examSettings, examDateTime: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, fontSize: '14px' }}
                                    />
                                    <p style={{ fontSize: '11px', color: BRAND.textMuted, marginTop: '6px' }}>
                                        This will show a live countdown on the student dashboard
                                    </p>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Description</label>
                                    <textarea
                                        value={examSettings.description}
                                        onChange={e => setExamSettings({ ...examSettings, description: e.target.value })}
                                        rows={3}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, fontSize: '14px', resize: 'vertical' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Show To</label>
                                    <select
                                        value={examSettings.targetAudience}
                                        onChange={e => setExamSettings({ ...examSettings, targetAudience: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, fontSize: '14px' }}
                                    >
                                        <option value="all">All Users</option>
                                        <option value="paid">Paid Users Only</option>
                                        <option value="unpaid">Unpaid Users Only</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowExamModal(false)}
                                    style={{ padding: '12px 20px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveExamSettings}
                                    disabled={savingSettings}
                                    style={{
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: BRAND.primary,
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: savingSettings ? 0.6 : 1
                                    }}
                                >
                                    <Save size={16} />
                                    {savingSettings ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Quizzes Card - Top 5 Only */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    overflow: 'hidden'
                }}>
                    <div
                        onClick={() => navigate('/admin/quizzes')}
                        style={{
                            padding: '20px',
                            borderBottom: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryLight}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND.bg}
                    >
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: BRAND.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} color={BRAND.primary} /> Recent Quizzes
                            <span style={{ fontSize: '12px', color: BRAND.textMuted, fontWeight: '400' }}>(Top 5)</span>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: BRAND.primary, fontSize: '14px', fontWeight: '500' }}>
                            View All <ExternalLink size={14} />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '14px', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: BRAND.bg, color: BRAND.textSecondary, fontWeight: '500' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px' }}>Title</th>
                                    <th style={{ padding: '12px 20px' }}>Topic</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Difficulty</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzes.length > 0 ? quizzes.map((quiz) => (
                                    <tr
                                        key={quiz._id}
                                        style={{ borderBottom: `1px solid ${BRAND.border}`, cursor: 'pointer', transition: 'background-color 0.15s' }}
                                        onClick={() => navigate(`/admin/quizzes`)}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryLight}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 20px', fontWeight: '500', color: BRAND.text }}>{quiz.title || 'Untitled'}</td>
                                        <td style={{ padding: '14px 20px', color: BRAND.textSecondary }}>{typeof quiz.topic === 'object' ? (quiz.topic?.name || 'N/A') : (quiz.topic || quiz.subjectName || 'N/A')}</td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: quiz.difficulty === 'Easy' ? BRAND.successLight : quiz.difficulty === 'Medium' ? '#FEF9C3' : BRAND.warningLight,
                                                color: quiz.difficulty === 'Easy' ? '#0d6652' : quiz.difficulty === 'Medium' ? '#854d0e' : '#991b1b'
                                            }}>
                                                {quiz.difficulty || 'Medium'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: BRAND.successLight,
                                                color: '#059669'
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: BRAND.success }}></span>
                                                Active
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate('/admin/quizzes'); }}
                                                style={{ padding: '6px 12px', color: BRAND.primary, background: BRAND.primaryLight, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: BRAND.textMuted }}>
                                            <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                                            <p style={{ margin: 0 }}>No quizzes yet. Click <strong>"Create Quiz"</strong> to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Center Card */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    overflow: 'hidden'
                }}>
                    <div
                        onClick={() => navigate('/admin/tasks')}
                        style={{
                            padding: '20px',
                            borderBottom: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryLight}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = BRAND.bg}
                    >
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: BRAND.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} color={BRAND.primary} /> Action Center
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate('/admin/tasks'); }}
                            style={{
                                padding: '8px 16px',
                                color: BRAND.card,
                                background: BRAND.primary,
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Plus size={16} /> Add Task
                        </button>
                    </div>
                    <div style={{ padding: '16px' }}>
                        {tasks.length > 0 ? tasks.map(task => (
                            <div
                                key={task._id}
                                onClick={() => navigate('/admin/tasks')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '14px',
                                    borderRadius: '10px',
                                    border: `1px solid ${BRAND.border}`,
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: BRAND.card
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = BRAND.primaryLight; e.currentTarget.style.borderColor = BRAND.primary; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = BRAND.card; e.currentTarget.style.borderColor = BRAND.border; }}
                            >
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    marginTop: 2,
                                    borderRadius: 6,
                                    border: `2px solid ${BRAND.border}`,
                                    backgroundColor: 'transparent',
                                    flexShrink: 0
                                }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: BRAND.text, margin: 0 }}>{task.content}</p>
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: BRAND.primary, marginTop: '6px', display: 'inline-block', backgroundColor: BRAND.primaryLight, padding: '2px 8px', borderRadius: '4px' }}>{task.tag || 'Task'}</span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: BRAND.textMuted }}>
                                <CheckCircle2 size={32} color={BRAND.success} style={{ margin: '0 auto 8px' }} />
                                <p style={{ margin: 0, fontWeight: '500' }}>All tasks completed! 🎉</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Clickable Stat Card Component
function ClickableStatCard({ label, value, trend, icon, bgColor, warning, onClick }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: BRAND.card,
                padding: '20px',
                borderRadius: BRAND.radius,
                border: `1px solid ${isHovered ? BRAND.primary : BRAND.border}`,
                boxShadow: isHovered ? BRAND.shadowHover : BRAND.shadowCard,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: bgColor }}>
                    {icon}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '700', color: BRAND.text, margin: 0 }}>{value}</h2>
                <span style={{ fontSize: '12px', fontWeight: '600', color: warning ? BRAND.warning : BRAND.success }}>
                    {trend}
                </span>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: BRAND.primary, fontSize: '12px', fontWeight: '500', opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.2s' }}>
                <span>View details</span>
                <ExternalLink size={12} />
            </div>
        </div>
    );
}

export default AdminDashboard;
