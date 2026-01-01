import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ArrowLeft, Trash2, ListTodo, Plus, Send, X } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryHover: '#7A66A8',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB',
    shadowCard: '0 4px 12px rgba(0, 0, 0, 0.04)',
    radius: '12px'
};

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

export function AllTasksPage() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ content: '', tag: 'General' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, subjectsRes] = await Promise.all([
                api.get('/admin/global-tasks'),
                api.get('/admin/subjects')
            ]);
            setTasks(tasksRes.data.data || []);
            const subjectList = subjectsRes.data.data || [];
            setSubjects(['General', ...subjectList.map(s => s.name)]);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.content.trim()) return;
        setSaving(true);
        try {
            const res = await api.post('/admin/global-tasks', newTask);
            if (res.data.success) {
                setTasks([res.data.data, ...tasks]);
                setNewTask({ content: '', tag: 'General' });
                setShowAddTask(false);
            }
        } catch (error) {
            console.error("Failed to add task", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/admin/global-tasks/${taskId}`);
            setTasks(tasks.filter(t => t._id !== taskId));
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate('/admin/tasks')}
                            style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}
                        >
                            <ArrowLeft size={20} color={BRAND.text} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>All To-Do Tasks</h1>
                            <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>{tasks.length} total tasks assigned to students</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddTask(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 20px', borderRadius: '10px', border: 'none',
                            backgroundColor: BRAND.primary, color: '#fff',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        <Plus size={18} /> Add New Task
                    </button>
                </div>

                {/* Add Task Form */}
                {showAddTask && (
                    <div style={{ padding: '20px', backgroundColor: BRAND.card, borderRadius: BRAND.radius, border: `1px solid ${BRAND.border}` }}>
                        <input
                            type="text"
                            placeholder="What should students do?"
                            value={newTask.content}
                            onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                border: `2px solid ${BRAND.primary}`,
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                marginBottom: '12px',
                                color: BRAND.text,
                                backgroundColor: BRAND.card
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {subjects.map(tag => {
                                const tagColor = getTagColor(tag);
                                return (
                                    <button key={tag} onClick={() => setNewTask({ ...newTask, tag })}
                                        style={{ padding: '8px 14px', borderRadius: '20px', border: newTask.tag === tag ? `2px solid ${BRAND.primary}` : `1px solid ${BRAND.border}`, backgroundColor: newTask.tag === tag ? tagColor.bg : BRAND.card, color: newTask.tag === tag ? tagColor.color : BRAND.textSecondary, fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setShowAddTask(false); setNewTask({ content: '', tag: 'General' }); }}
                                style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                            <button onClick={handleAddTask} disabled={saving || !newTask.content.trim()}
                                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: newTask.content.trim() ? BRAND.primary : BRAND.border, color: '#fff', cursor: newTask.content.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
                                <Send size={16} /> {saving ? 'Adding...' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                )}

                {/* All Tasks List */}
                <div style={{ backgroundColor: BRAND.card, borderRadius: BRAND.radius, border: `1px solid ${BRAND.border}`, boxShadow: BRAND.shadowCard }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <Loader />
                        </div>
                    ) : tasks.length > 0 ? (
                        <div style={{ padding: '16px' }}>
                            {tasks.map((task) => {
                                const tagColor = getTagColor(task.tag);
                                return (
                                    <div key={task._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', marginBottom: '10px',
                                        backgroundColor: BRAND.bg, borderRadius: '10px', border: `1px solid ${BRAND.border}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: BRAND.primary }}></div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: '15px', color: BRAND.text, fontWeight: '500' }}>{task.content}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: tagColor.bg, color: tagColor.color }}>{task.tag}</span>
                                                    <span style={{ fontSize: '12px', color: BRAND.textMuted }}>{formatDate(task.createdAt)}</span>
                                                    <span style={{ fontSize: '12px', color: BRAND.success }}>{task.completedBy?.length || 0} students completed</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task._id)}
                                            style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: BRAND.textMuted }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '60px', textAlign: 'center', color: BRAND.textMuted }}>
                            <ListTodo size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '16px' }}>No tasks yet</p>
                            <p style={{ margin: '4px 0 0', fontSize: '14px' }}>Click "Add New Task" to create one</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AllTasksPage;
