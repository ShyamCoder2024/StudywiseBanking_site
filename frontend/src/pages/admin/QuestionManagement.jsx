import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Check, Trash2, Edit2, Plus, ArrowLeft, Send, BarChart2, X, HelpCircle, FileText, CheckCircle } from 'lucide-react';

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

export function QuestionManagement() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        type: 'mcq',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        topperAnswer: ''
    });
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [quizId]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/quizzes/${quizId}/questions`);
            setQuiz(res.data.data?.quiz);
            setQuestions(res.data.data?.questions || []);
        } catch (error) {
            console.error('Failed to fetch questions', error);
            setQuiz({ title: 'Quiz', isPublished: false });
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            setFormData({
                type: question.type || 'mcq',
                text: question.text,
                options: question.type === 'mcq' && question.options ? question.options : ['', '', '', ''],
                correctAnswer: question.correctAnswer || '',
                topperAnswer: question.topperAnswer || '',
            });
        } else {
            setEditingQuestion(null);
            setFormData({ type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '', topperAnswer: '' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.text.trim()) {
            alert('Please enter a question');
            return;
        }

        if (formData.type === 'mcq') {
            const filledOptions = formData.options.filter(o => o.trim());
            if (filledOptions.length < 2) {
                alert('Please enter at least 2 options');
                return;
            }
            if (!formData.correctAnswer) {
                alert('Please select the correct answer');
                return;
            }
        }

        setSaving(true);
        const payload = { ...formData };

        if (formData.type === 'mcq') {
            payload.options = formData.options.filter(o => o.trim());
            delete payload.topperAnswer;
        } else {
            delete payload.options;
            delete payload.correctAnswer;
        }

        try {
            if (editingQuestion) {
                await api.put(`/admin/questions/${editingQuestion._id}`, payload);
            } else {
                await api.post(`/admin/quizzes/${quizId}/questions`, payload);
            }
            fetchQuestions();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save question', error);
            // Optimistic update for demo
            if (editingQuestion) {
                setQuestions(questions.map(q => q._id === editingQuestion._id ? { ...q, ...payload } : q));
            } else {
                setQuestions([...questions, { _id: Date.now().toString(), ...payload }]);
            }
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this question?')) return;
        try {
            await api.delete(`/admin/questions/${id}`);
            fetchQuestions();
        } catch {
            setQuestions(questions.filter(q => q._id !== id));
        }
    };

    const handlePublish = async () => {
        // Debug: Log current state
        console.log('=== PUBLISH BUTTON CLICKED ===');
        console.log('Quiz ID:', quizId);
        console.log('Questions count:', questions.length);
        console.log('Quiz state:', quiz);
        console.log('Token exists:', !!localStorage.getItem('token'));

        // Validation checks
        if (!quizId) {
            alert('❌ Error: No quiz ID found. Please refresh the page.');
            return;
        }

        if (questions.length === 0) {
            alert('❌ Please add at least one question before publishing.');
            return;
        }

        if (quiz?.isPublished) {
            alert('ℹ️ This quiz is already published!');
            return;
        }

        const confirmPublish = window.confirm(
            `Publish "${quiz?.title || 'this quiz'}"?\n\nThis will make the quiz LIVE for all students and send them notifications.`
        );

        if (!confirmPublish) {
            console.log('User cancelled publish');
            return;
        }

        setPublishing(true);
        console.log('Sending publish request to: /admin/quizzes/' + quizId + '/publish');

        try {
            const response = await api.post(`/admin/quizzes/${quizId}/publish`);

            console.log('=== PUBLISH SUCCESS ===');
            console.log('Response:', response);
            console.log('Response data:', response.data);

            if (response.data?.success) {
                // Update local state
                setQuiz(prev => ({ ...prev, isPublished: true }));

                alert(`✅ SUCCESS!\n\nQuiz "${quiz?.title || 'Quiz'}" is now LIVE!\n\nAll students have been notified and can now take this test.`);

                // Navigate back to quiz list
                setTimeout(() => navigate('/admin/quizzes'), 500);
            } else {
                // Server returned success: false
                console.error('Server returned failure:', response.data);
                alert(`❌ Server Error:\n\n${response.data?.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('=== PUBLISH FAILED ===');
            console.error('Error object:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);

            let errorMessage = 'Unknown error occurred';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            if (error.status === 401) {
                errorMessage = 'Authentication failed. Please log in again as admin.';
            } else if (error.status === 403) {
                errorMessage = 'Permission denied. Only admins can publish quizzes.';
            } else if (error.status === 404) {
                errorMessage = 'Quiz not found. It may have been deleted.';
            }

            alert(`❌ Failed to publish quiz:\n\n${errorMessage}\n\nCheck browser console for details.`);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Back Button */}
                <Link
                    to="/admin/quizzes"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: BRAND.textSecondary,
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '-8px'
                    }}
                >
                    <ArrowLeft size={18} />
                    Back to Quizzes
                </Link>

                {/* Header Card */}
                <div style={{
                    backgroundColor: BRAND.card,
                    padding: '24px',
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: BRAND.text, margin: 0 }}>
                        {quiz?.title || 'Manage Questions'}
                    </h1>
                    <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '8px' }}>
                        Add and edit questions for this quiz.
                    </p>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => navigate(`/admin/quizzes/${quizId}/stats`)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: `1px solid ${BRAND.border}`,
                                backgroundColor: BRAND.card,
                                color: BRAND.text,
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <BarChart2 size={18} />
                            Analytics
                        </button>

                        <button
                            onClick={() => openModal()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                border: `1px solid ${BRAND.border}`,
                                backgroundColor: BRAND.card,
                                color: BRAND.text,
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={18} />
                            Add Question
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                console.log('Publish button clicked!');
                                handlePublish();
                            }}
                            disabled={quiz?.isPublished || publishing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: quiz?.isPublished ? BRAND.success : BRAND.primary,
                                color: '#FFFFFF',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: quiz?.isPublished ? 'default' : 'pointer',
                                opacity: publishing ? 0.7 : 1,
                                boxShadow: quiz?.isPublished ? 'none' : '0 4px 12px rgba(138, 117, 186, 0.3)'
                            }}
                        >
                            {quiz?.isPublished ? (
                                <>
                                    <CheckCircle size={18} />
                                    Published
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {publishing ? 'Publishing...' : 'Save & Publish Quiz'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px'
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                border: `3px solid ${BRAND.border}`,
                                borderTopColor: BRAND.primary,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : questions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {questions.map((q, idx) => (
                                <div
                                    key={q._id}
                                    style={{
                                        backgroundColor: BRAND.card,
                                        borderRadius: BRAND.radius,
                                        border: `1px solid ${BRAND.border}`,
                                        boxShadow: BRAND.shadowCard,
                                        padding: '20px',
                                        transition: 'box-shadow 0.2s ease'
                                    }}
                                >
                                    {/* Question Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: BRAND.primaryLight,
                                                color: BRAND.primary,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '700',
                                                fontSize: '14px'
                                            }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                backgroundColor: q.type === 'mcq' ? '#DBEAFE' : '#D1FAE5',
                                                color: q.type === 'mcq' ? '#1E40AF' : '#065F46'
                                            }}>
                                                {q.type}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => openModal(q)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    color: BRAND.textMuted,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q._id)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: 'transparent',
                                                    color: BRAND.textMuted,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <p style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: BRAND.text,
                                        marginBottom: '16px',
                                        marginLeft: '48px',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.6'
                                    }}>
                                        {q.text}
                                    </p>

                                    {/* MCQ Options */}
                                    {q.type === 'mcq' && q.options && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '10px',
                                            marginLeft: '48px'
                                        }}
                                            className="admin-grid-2"
                                        >
                                            {q.options.map((opt, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px 14px',
                                                        borderRadius: '10px',
                                                        backgroundColor: opt === q.correctAnswer ? BRAND.successLight : BRAND.bg,
                                                        border: `1px solid ${opt === q.correctAnswer ? BRAND.success : 'transparent'}`
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '26px',
                                                        height: '26px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        backgroundColor: opt === q.correctAnswer ? BRAND.success : '#E5E7EB',
                                                        color: opt === q.correctAnswer ? '#FFFFFF' : BRAND.textSecondary
                                                    }}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <span style={{
                                                        flex: 1,
                                                        fontSize: '14px',
                                                        color: opt === q.correctAnswer ? '#065F46' : BRAND.textSecondary,
                                                        fontWeight: opt === q.correctAnswer ? '600' : '400'
                                                    }}>
                                                        {opt}
                                                    </span>
                                                    {opt === q.correctAnswer && (
                                                        <Check size={16} color={BRAND.success} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Descriptive Answer */}
                                    {q.type === 'descriptive' && (
                                        <div style={{
                                            marginLeft: '48px',
                                            padding: '14px',
                                            borderRadius: '10px',
                                            backgroundColor: BRAND.bg,
                                            border: `1px solid ${BRAND.border}`
                                        }}>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: BRAND.textSecondary,
                                                display: 'block',
                                                marginBottom: '6px'
                                            }}>
                                                Reference Answer:
                                            </span>
                                            <p style={{
                                                fontSize: '14px',
                                                color: BRAND.text,
                                                margin: 0
                                            }}>
                                                {q.topperAnswer || 'No reference answer provided.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div style={{
                            backgroundColor: BRAND.card,
                            borderRadius: BRAND.radius,
                            border: `2px dashed ${BRAND.border}`,
                            padding: '60px 40px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: BRAND.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: BRAND.textMuted
                            }}>
                                <Plus size={32} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: BRAND.text, margin: '0 0 8px' }}>
                                No Questions Added
                            </h3>
                            <p style={{ fontSize: '14px', color: BRAND.textSecondary, margin: '0 0 20px' }}>
                                Start by adding questions to this quiz.
                            </p>
                            <button
                                onClick={() => openModal()}
                                style={{
                                    padding: '14px 28px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: BRAND.primary,
                                    color: '#FFFFFF',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(138, 117, 186, 0.3)'
                                }}
                            >
                                Add First Question
                            </button>
                        </div>
                    )}
                </div>

                {/* ADD/EDIT MODAL */}
                {showModal && (
                    <div
                        onClick={() => setShowModal(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100,
                            padding: '20px'
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: BRAND.card,
                                borderRadius: '16px',
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: `1px solid ${BRAND.border}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: BRAND.primaryLight
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: BRAND.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {editingQuestion ? <Edit2 size={20} color="#fff" /> : <HelpCircle size={20} color="#fff" />}
                                    </div>
                                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: BRAND.text, margin: 0 }}>
                                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        color: BRAND.textSecondary
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                {/* Question Type */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: BRAND.text,
                                        marginBottom: '10px'
                                    }}>
                                        Question Type
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {['mcq', 'descriptive'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, type })}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 16px',
                                                    borderRadius: '10px',
                                                    border: formData.type === type ? `2px solid ${BRAND.primary}` : `1px solid ${BRAND.border}`,
                                                    backgroundColor: formData.type === type ? BRAND.primaryLight : BRAND.card,
                                                    color: formData.type === type ? BRAND.primary : BRAND.textSecondary,
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {type === 'mcq' ? <FileText size={16} /> : <Edit2 size={16} />}
                                                {type === 'mcq' ? 'Multiple Choice' : 'Descriptive'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Text */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: BRAND.text,
                                        marginBottom: '10px'
                                    }}>
                                        Question Text <span style={{ color: BRAND.warning }}>*</span>
                                    </label>
                                    <textarea
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        placeholder="Type your question here...&#10;&#10;Tip: Press Enter to add line breaks for better formatting"
                                        rows={6}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            borderRadius: '10px',
                                            border: `1px solid ${BRAND.border}`,
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            color: BRAND.text,
                                            backgroundColor: BRAND.card,
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: '1.6'
                                        }}
                                    />
                                </div>

                                {/* MCQ Options */}
                                {formData.type === 'mcq' && (
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: BRAND.bg,
                                        border: `1px solid ${BRAND.border}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <label style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: BRAND.text
                                            }}>
                                                Options (2-10 options)
                                            </label>
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>
                                                {formData.options.length} options
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: formData.options.length >= 5 ? '1fr' : '1fr 1fr',
                                            gap: '12px'
                                        }}>
                                            {formData.options.map((opt, i) => (
                                                <div key={i} style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <div style={{ flex: 1, position: 'relative' }}>
                                                        <span style={{
                                                            position: 'absolute',
                                                            left: '12px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: BRAND.textMuted
                                                        }}>
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...formData.options];
                                                                newOpts[i] = e.target.value;
                                                                setFormData({ ...formData, options: newOpts });
                                                            }}
                                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                            style={{
                                                                width: '100%',
                                                                padding: '12px 12px 12px 32px',
                                                                borderRadius: '8px',
                                                                border: `1px solid ${BRAND.border}`,
                                                                fontSize: '14px',
                                                                outline: 'none',
                                                                boxSizing: 'border-box',
                                                                backgroundColor: BRAND.card,
                                                                color: BRAND.text
                                                            }}
                                                        />
                                                    </div>
                                                    {formData.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOpts = formData.options.filter((_, idx) => idx !== i);
                                                                setFormData({ ...formData, options: newOpts });
                                                            }}
                                                            style={{
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                backgroundColor: BRAND.warningLight,
                                                                color: BRAND.warning,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Option Button */}
                                        {formData.options.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, options: [...formData.options, ''] });
                                                }}
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    border: `1px dashed ${BRAND.border}`,
                                                    backgroundColor: 'transparent',
                                                    color: BRAND.primary,
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <Plus size={16} />
                                                Add Option ({formData.options.length}/10)
                                            </button>
                                        )}

                                        {/* Correct Answer Selection */}
                                        <div style={{ marginTop: '16px' }}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: BRAND.text,
                                                marginBottom: '10px'
                                            }}>
                                                Correct Answer <span style={{ color: BRAND.warning }}>*</span>
                                            </label>
                                            <select
                                                value={formData.correctAnswer}
                                                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${BRAND.border}`,
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    backgroundColor: BRAND.card,
                                                    cursor: 'pointer',
                                                    color: BRAND.text
                                                }}
                                            >
                                                <option value="">Select the correct option</option>
                                                {formData.options.filter(o => o.trim()).map((opt, i) => (
                                                    <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Descriptive Answer */}
                                {formData.type === 'descriptive' && (
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: BRAND.text,
                                            marginBottom: '10px'
                                        }}>
                                            Ideal / Reference Answer
                                        </label>
                                        <textarea
                                            value={formData.topperAnswer}
                                            onChange={(e) => setFormData({ ...formData, topperAnswer: e.target.value })}
                                            placeholder="Enter the ideal answer for grading reference...&#10;&#10;You can use multiple lines for better formatting"
                                            rows={6}
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                borderRadius: '10px',
                                                border: `1px solid ${BRAND.border}`,
                                                fontSize: '14px',
                                                outline: 'none',
                                                resize: 'vertical',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                                color: BRAND.text,
                                                backgroundColor: BRAND.card,
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: '1.6'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: `1px solid ${BRAND.border}`,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                backgroundColor: BRAND.bg
                            }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '10px',
                                        border: `1px solid ${BRAND.border}`,
                                        backgroundColor: BRAND.card,
                                        color: BRAND.text,
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '12px 28px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: BRAND.primary,
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        opacity: saving ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Check size={16} />
                                    {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default QuestionManagement;
