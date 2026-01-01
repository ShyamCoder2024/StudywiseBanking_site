import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, X, Clock, BarChart3, Edit2, Trash2, FileText, Check } from 'lucide-react';
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

export function QuizManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subjectId: '',
        topicId: '',
        duration: 15,
        difficulty: 'Medium',
        isMockTest: false,
        timePerQuestion: 60,
        isBigQuiz: false,
        targetAudience: 'all'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [quizRes, subjectRes] = await Promise.all([api.get('/admin/quizzes'), api.get('/admin/subjects')]);
            setQuizzes(quizRes.data.data || []);
            setSubjects(subjectRes.data.data || []);
        } catch {
            setQuizzes([]);
            setSubjects([]);
        } finally { setLoading(false); }
    };

    const fetchTopics = async (subjectId) => {
        if (!subjectId) { setTopics([]); return; }
        try {
            const res = await api.get(`/admin/subjects/${subjectId}/topics`);
            setTopics(res.data.data?.topics || []);
        } catch { setTopics([]); }
    };

    const openModal = (quiz = null) => {
        if (quiz) {
            setEditingQuiz(quiz);
            setFormData({
                title: quiz.title,
                subjectId: quiz.subjectId || '',
                topicId: quiz.topicId || '',
                duration: quiz.duration,
                difficulty: quiz.difficulty,
                isMockTest: quiz.isMockTest || false,
                timePerQuestion: quiz.timePerQuestion || 60,
                isBigQuiz: quiz.isBigQuiz || false,
                targetAudience: quiz.targetAudience || 'all'
            });
            if (quiz.subjectId) fetchTopics(quiz.subjectId);
        } else {
            setEditingQuiz(null);
            setFormData({
                title: '', subjectId: '', topicId: '', duration: 15,
                difficulty: 'Medium', isMockTest: false, timePerQuestion: 60, isBigQuiz: false,
                targetAudience: 'all'
            });
            setTopics([]);
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Please enter a quiz title');
            return;
        }
        setSaving(true);
        const payload = { ...formData };
        if (payload.isBigQuiz) payload.topicId = null;

        try {
            if (editingQuiz) {
                await api.put(`/admin/quizzes/${editingQuiz._id}`, payload);
                alert('✅ Quiz updated successfully!');
            } else {
                await api.post('/admin/quizzes', payload);
                alert('✅ Quiz created successfully! Now add questions to it.');
            }
            fetchData();
            setShowModal(false);
        } catch (error) {
            console.error('Save error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to save quiz';
            alert(`❌ Error: ${message}\n\nPlease try again. If the issue persists, refresh the page.`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/quizzes/${id}`);
            alert('✅ Quiz deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to delete quiz';
            alert(`❌ Error: ${message}\n\nPlease try again.`);
        }
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
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Quiz Management</h1>
                        <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>Create, edit, and manage all assessments.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: BRAND.primary,
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(138, 117, 186, 0.3)'
                        }}
                    >
                        <Plus size={18} />
                        Create Quiz
                    </button>
                </div>

                {/* Quizzes Table */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <Loader />
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: BRAND.bg, borderBottom: `1px solid ${BRAND.border}` }}>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quiz Details</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject / Topic</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settings</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.map((quiz) => (
                                        <tr key={quiz._id} style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ fontWeight: '600', color: BRAND.text, marginBottom: '4px' }}>{quiz.title}</div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {quiz.isMockTest && (
                                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', backgroundColor: '#FEF3C7', color: '#92400E', textTransform: 'uppercase' }}>Mock Test</span>
                                                    )}
                                                    {quiz.isBigQuiz && (
                                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', backgroundColor: BRAND.primaryLight, color: BRAND.primary, textTransform: 'uppercase' }}>Big Quiz</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ color: BRAND.text, fontWeight: '500' }}>{quiz.subjectName || 'No Subject'}</div>
                                                <div style={{ color: BRAND.textMuted, fontSize: '13px' }}>{quiz.isBigQuiz ? 'All Topics' : (quiz.topicName || 'No Topic')}</div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: BRAND.textSecondary }}>
                                                            <Clock size={14} />
                                                            <span>{quiz.duration}m</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: BRAND.textMuted }}>{quiz.timePerQuestion || 60}s/Q</div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        backgroundColor: quiz.difficulty === 'Easy' ? BRAND.successLight : quiz.difficulty === 'Medium' ? '#FEF9C3' : BRAND.warningLight,
                                                        color: quiz.difficulty === 'Easy' ? '#0d6652' : quiz.difficulty === 'Medium' ? '#854d0e' : '#991b1b'
                                                    }}>
                                                        {quiz.difficulty}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                                                    <Link to={`/admin/quizzes/${quiz._id}/questions`} style={{ textDecoration: 'none' }}>
                                                        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                                                            <FileText size={14} />
                                                            Questions ({quiz.questionCount || 0})
                                                        </button>
                                                    </Link>
                                                    <Link to={`/admin/quizzes/${quiz._id}/stats`} style={{ textDecoration: 'none' }}>
                                                        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: BRAND.successLight, color: BRAND.success, fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                                                            <BarChart3 size={14} />
                                                            Analytics
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => openModal(quiz)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: BRAND.primaryLight, color: BRAND.primary, fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(quiz._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: BRAND.warningLight, color: BRAND.warning, fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {quizzes.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '60px 20px', textAlign: 'center', color: BRAND.textMuted }}>
                                                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                                                <p style={{ margin: 0, fontWeight: '500' }}>No quizzes yet</p>
                                                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Click "Create Quiz" to get started</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: BRAND.card,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '560px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: BRAND.text, margin: 0 }}>
                                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: BRAND.textMuted }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Quiz Title */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>
                                    Quiz Title <span style={{ color: BRAND.warning }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Number Series Basics"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: `1px solid ${BRAND.border}`,
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: BRAND.text,
                                        backgroundColor: BRAND.card
                                    }}
                                />
                            </div>

                            {/* Subject & Topic Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: formData.isBigQuiz ? '1fr' : '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>Subject</label>
                                    <select
                                        value={formData.subjectId}
                                        onChange={(e) => { setFormData({ ...formData, subjectId: e.target.value, topicId: '' }); fetchTopics(e.target.value); }}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, fontSize: '14px', outline: 'none', backgroundColor: BRAND.card, boxSizing: 'border-box', color: BRAND.text }}
                                    >
                                        <option value="">Select Subject...</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                {!formData.isBigQuiz && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>Topic</label>
                                        <select
                                            value={formData.topicId}
                                            onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                            disabled={!formData.subjectId}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, fontSize: '14px', outline: 'none', backgroundColor: formData.subjectId ? BRAND.card : BRAND.bg, boxSizing: 'border-box', opacity: formData.subjectId ? 1 : 0.6, color: BRAND.text }}
                                        >
                                            <option value="">Select Topic...</option>
                                            {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Duration, Time/Q, Difficulty Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 15 })}
                                        min="5"
                                        max="180"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: BRAND.text, backgroundColor: BRAND.card }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>Time/Question (sec)</label>
                                    <input
                                        type="number"
                                        value={formData.timePerQuestion}
                                        onChange={(e) => setFormData({ ...formData, timePerQuestion: parseInt(e.target.value) || 60 })}
                                        min="10"
                                        max="300"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: BRAND.text, backgroundColor: BRAND.card }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px' }}>Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, fontSize: '14px', outline: 'none', backgroundColor: BRAND.card, boxSizing: 'border-box', color: BRAND.text }}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '10px',
                                        border: `1px solid ${formData.isMockTest ? BRAND.primary : BRAND.border}`,
                                        backgroundColor: formData.isMockTest ? BRAND.primaryLight : BRAND.card,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: 22, height: 22, borderRadius: 6,
                                        border: `2px solid ${formData.isMockTest ? BRAND.primary : BRAND.border}`,
                                        backgroundColor: formData.isMockTest ? BRAND.primary : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {formData.isMockTest && <Check size={14} color="#fff" />}
                                    </div>
                                    <input type="checkbox" checked={formData.isMockTest} onChange={(e) => setFormData({ ...formData, isMockTest: e.target.checked })} style={{ display: 'none' }} />
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: BRAND.text }}>Mark as Mock Test</span>
                                </label>

                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '10px',
                                        border: `1px solid ${formData.isBigQuiz ? BRAND.primary : BRAND.border}`,
                                        backgroundColor: formData.isBigQuiz ? BRAND.primaryLight : BRAND.card,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: 22, height: 22, borderRadius: 6, marginTop: 2,
                                        border: `2px solid ${formData.isBigQuiz ? BRAND.primary : BRAND.border}`,
                                        backgroundColor: formData.isBigQuiz ? BRAND.primary : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        {formData.isBigQuiz && <Check size={14} color="#fff" />}
                                    </div>
                                    <input type="checkbox" checked={formData.isBigQuiz} onChange={(e) => setFormData({ ...formData, isBigQuiz: e.target.checked, topicId: '' })} style={{ display: 'none' }} />
                                    <div>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: BRAND.text, display: 'block' }}>Create Big Quiz</span>
                                        <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Include questions from ALL topics in this subject</span>
                                    </div>
                                </label>
                            </div>

                            {/* Target Audience Selection */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px', display: 'block' }}>
                                    Target Audience
                                </label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { value: 'all', label: 'All Users', color: BRAND.primary },
                                        { value: 'paid', label: 'Paid Only', color: BRAND.success },
                                        { value: 'unpaid', label: 'Unpaid Only', color: BRAND.warning }
                                    ].map(option => (
                                        <label
                                            key={option.value}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                border: `2px solid ${formData.targetAudience === option.value ? option.color : BRAND.border}`,
                                                backgroundColor: formData.targetAudience === option.value ? `${option.color}15` : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="targetAudience"
                                                value={option.value}
                                                checked={formData.targetAudience === option.value}
                                                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                                style={{ accentColor: option.color }}
                                            />
                                            <span style={{ fontSize: '13px', fontWeight: '500', color: formData.targetAudience === option.value ? option.color : BRAND.text }}>
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p style={{ fontSize: '11px', color: BRAND.textMuted, marginTop: '6px' }}>
                                    {formData.targetAudience === 'paid' ? 'Only premium members can access this quiz' :
                                        formData.targetAudience === 'unpaid' ? 'Only free users can access this quiz' :
                                            'All registered users can access this quiz'}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            padding: '20px 24px',
                            borderTop: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg
                        }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: '12px 24px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !formData.title.trim()}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: saving || !formData.title.trim() ? BRAND.textMuted : BRAND.primary,
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: saving || !formData.title.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {saving ? 'Saving...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default QuizManagement;
