import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, CheckCircle, Trash2, ListTodo, AlertTriangle, X, Send, ChevronRight, ExternalLink } from 'lucide-react';

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

// Common Input Styles - Cross-browser text visibility fix
const INPUT_STYLES = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: `2px solid ${BRAND.primary}`,
    fontSize: '14px',
    color: '#131313',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
};

// Tag Colors based on subject
const getTagColor = (tag) => {
    const colors = {
        'General': { bg: '#E5E7EB', color: '#374151' },
        'Quantitative Aptitude': { bg: '#FEF3C7', color: '#92400E' },
        'Reasoning Ability': { bg: '#DBEAFE', color: '#1E40AF' },
        'English Language': { bg: '#FCE7F3', color: '#9D174D' },
        'General Awareness': { bg: '#D1FAE5', color: '#065F46' },
        'Default': { bg: BRAND.primaryLight, color: BRAND.primary }
    };
    return colors[tag] || colors.Default;
};

export function TaskManagementPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [globalTasks, setGlobalTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [inactiveStudents, setInactiveStudents] = useState([]);
    const [allInactiveStudents, setAllInactiveStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ content: '', tag: 'General' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [tasksRes, studentsRes, subjectsRes] = await Promise.all([
                api.get('/admin/global-tasks'),
                api.get('/admin/students'),
                api.get('/admin/subjects')
            ]);

            console.log('Tasks Response:', tasksRes.data);
            console.log('Students Response:', studentsRes.data);
            console.log('Subjects Response:', subjectsRes.data);

            const taskList = tasksRes.data.data || [];
            setAllTasks(taskList);
            setGlobalTasks(taskList.slice(0, 10)); // Show only top 10

            // Get real subjects from database
            const subjectList = subjectsRes.data.data || [];
            setSubjects(['General', ...subjectList.map(s => s.name)]);

            // Filter students with 0 attempts (have not taken any test)
            const allStudents = studentsRes.data.data || [];
            console.log('All Students:', allStudents.length);
            console.log('Sample Student:', allStudents[0]);

            const inactive = allStudents.filter(s => (s.totalAttempts || 0) === 0);
            console.log('Inactive Students (0 attempts):', inactive.length);

            setAllInactiveStudents(inactive);
            setInactiveStudents(inactive.slice(0, 10)); // Show only top 10
        } catch (error) {
            console.error("Failed to fetch data:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to load data';
            setError(errorMessage);
            alert(`❌ Error loading data: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.content.trim()) {
            setError('Please enter task content');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await api.post('/admin/global-tasks', {
                content: newTask.content.trim(),
                tag: newTask.tag
            });

            if (res.data.success) {
                const newTaskList = [res.data.data, ...allTasks];
                setAllTasks(newTaskList);
                setGlobalTasks(newTaskList.slice(0, 10));
                setNewTask({ content: '', tag: 'General' });
                setShowAddTask(false);
            } else {
                setError('Failed to add task');
            }
        } catch (error) {
            console.error("Failed to add task", error);
            setError(error.response?.data?.message || 'Failed to add task. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Delete this task for all users?')) return;
        try {
            await api.delete(`/admin/global-tasks/${taskId}`);
            const newTaskList = allTasks.filter(t => t._id !== taskId);
            setAllTasks(newTaskList);
            setGlobalTasks(newTaskList.slice(0, 10));
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Header */}
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
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Task Management</h1>
                        <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>Create to-do lists for students & track inactive users.</p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: BRAND.warningLight,
                        border: `1px solid ${BRAND.warning}`,
                        borderRadius: '10px',
                        color: '#b91c1c',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Two Column Layout - Responsive */}
                <div className="admin-grid-2" style={{ gap: '24px' }}>

                    {/* Section 1: Global To-Do List */}
                    <div style={{
                        backgroundColor: BRAND.card,
                        borderRadius: BRAND.radius,
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: BRAND.shadowCard,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Section Header - CLICKABLE */}
                        <div
                            onClick={() => navigate('/admin/tasks/all')}
                            style={{
                                padding: '20px',
                                borderBottom: `1px solid ${BRAND.border}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: BRAND.primaryLight,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ListTodo size={20} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: BRAND.text, margin: 0 }}>To-Do List for All Users</h2>
                                    <p style={{ fontSize: '12px', color: BRAND.textSecondary, margin: 0 }}>
                                        Showing {globalTasks.length} of {allTasks.length} tasks • Click to view all
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAddTask(true); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '10px 16px', borderRadius: '10px', border: 'none',
                                        backgroundColor: BRAND.primary, color: '#fff',
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(138, 117, 186, 0.3)'
                                    }}
                                >
                                    <Plus size={16} /> Add Task
                                </button>
                                <ChevronRight size={20} color={BRAND.primary} />
                            </div>
                        </div>

                        {/* Add Task Form (Inline) */}
                        {showAddTask && (
                            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BRAND.border}`, backgroundColor: BRAND.bg }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="What should students do today?"
                                        value={newTask.content}
                                        onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                        style={{ ...INPUT_STYLES }}
                                        autoFocus
                                    />
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <p style={{ fontSize: '12px', color: BRAND.textSecondary, margin: '0 0 8px 0' }}>Select Subject Tag:</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {subjects.map(tag => {
                                            const tagColor = getTagColor(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => setNewTask({ ...newTask, tag })}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: '20px',
                                                        border: newTask.tag === tag ? `2px solid ${BRAND.primary}` : `1px solid ${BRAND.border}`,
                                                        backgroundColor: newTask.tag === tag ? tagColor.bg : BRAND.card,
                                                        color: newTask.tag === tag ? tagColor.color : BRAND.textSecondary,
                                                        fontSize: '13px',
                                                        fontWeight: newTask.tag === tag ? '600' : '500',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => { setShowAddTask(false); setNewTask({ content: '', tag: 'General' }); setError(''); }}
                                        style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddTask}
                                        disabled={saving || !newTask.content.trim()}
                                        style={{
                                            padding: '10px 24px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            backgroundColor: newTask.content.trim() ? BRAND.primary : BRAND.border,
                                            color: '#fff',
                                            cursor: newTask.content.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Send size={16} /> {saving ? 'Adding...' : 'Add Task'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tasks List - Top 10 */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '360px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                                    <div style={{ width: 32, height: 32, border: `3px solid ${BRAND.border}`, borderTopColor: BRAND.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                </div>
                            ) : globalTasks.length > 0 ? (
                                <div style={{ padding: '12px' }}>
                                    {globalTasks.map((task) => {
                                        const tagColor = getTagColor(task.tag);
                                        return (
                                            <div key={task._id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '14px 16px', marginBottom: '8px',
                                                backgroundColor: BRAND.bg, borderRadius: '10px', border: `1px solid ${BRAND.border}`
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: BRAND.primary }}></div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontSize: '14px', color: BRAND.text, fontWeight: '500' }}>{task.content}</p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: tagColor.bg, color: tagColor.color }}>{task.tag}</span>
                                                            <span style={{ fontSize: '11px', color: BRAND.textMuted }}>{formatDate(task.createdAt)}</span>
                                                            <span style={{ fontSize: '11px', color: BRAND.success }}>{task.completedBy?.length || 0} completed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteTask(task._id)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: BRAND.textMuted }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* View All Link */}
                                    {allTasks.length > 10 && (
                                        <button
                                            onClick={() => navigate('/admin/tasks/all')}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                marginTop: '8px',
                                                borderRadius: '10px',
                                                border: `1px dashed ${BRAND.primary}`,
                                                backgroundColor: 'transparent',
                                                color: BRAND.primary,
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            View All {allTasks.length} Tasks <ExternalLink size={14} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: BRAND.textMuted }}>
                                    <ListTodo size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                    <p style={{ margin: 0, fontWeight: '500' }}>No tasks yet</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Click "Add Task" to create one</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Inactive Students */}
                    <div style={{
                        backgroundColor: BRAND.card,
                        borderRadius: BRAND.radius,
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: BRAND.shadowCard,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Section Header - CLICKABLE */}
                        <div
                            onClick={() => navigate('/admin/inactive-students')}
                            style={{
                                padding: '20px',
                                borderBottom: `1px solid ${BRAND.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                backgroundColor: BRAND.warningLight,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: BRAND.warning, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={20} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Students Not Attempted Tests</h2>
                                    <p style={{ fontSize: '12px', color: BRAND.textSecondary, margin: 0 }}>
                                        Showing {inactiveStudents.length} of {allInactiveStudents.length} students • Click to view all
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={20} color={BRAND.warning} />
                        </div>

                        {/* Students List - Top 10 */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                                    <div style={{ width: 32, height: 32, border: `3px solid ${BRAND.border}`, borderTopColor: BRAND.warning, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : inactiveStudents.length > 0 ? (
                                <div style={{ padding: '12px' }}>
                                    {inactiveStudents.map((student) => (
                                        <div key={student._id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '14px 16px', marginBottom: '8px',
                                            backgroundColor: BRAND.bg, borderRadius: '10px', border: `1px solid ${BRAND.border}`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '50%',
                                                    backgroundColor: BRAND.warningLight,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: BRAND.warning, fontWeight: '700', fontSize: '14px'
                                                }}>
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{student.firstName} {student.lastName}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: BRAND.textMuted }}>{student.email}</p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: BRAND.warningLight, color: BRAND.warning }}>
                                                    {student.totalAttempts || 0} tests
                                                </span>
                                                <p style={{ margin: '4px 0 0', fontSize: '11px', color: BRAND.textMuted }}>
                                                    Joined {formatDate(student.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* View All Link */}
                                    {allInactiveStudents.length > 10 && (
                                        <button
                                            onClick={() => navigate('/admin/inactive-students')}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                marginTop: '8px',
                                                borderRadius: '10px',
                                                border: `1px dashed ${BRAND.warning}`,
                                                backgroundColor: 'transparent',
                                                color: BRAND.warning,
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            View All {allInactiveStudents.length} Students <ExternalLink size={14} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: BRAND.textMuted }}>
                                    <CheckCircle size={40} style={{ opacity: 0.3, marginBottom: '12px', color: BRAND.success }} />
                                    <p style={{ margin: 0, fontWeight: '500', color: BRAND.success }}>All students are active!</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Everyone has attempted tests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default TaskManagementPage;
