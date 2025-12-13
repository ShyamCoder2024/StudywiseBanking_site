import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select, RadioGroup } from '../../components/ui/Input';
import api from '../../services/api';
import './AdminLayout.css';

export function QuestionManagement() {
    const { quizId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({ type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: '', topperAnswer: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchQuestions(); }, [quizId]);

    const fetchQuestions = async () => {
        try {
            const res = await api.get(`/admin/quizzes/${quizId}/questions`);
            setQuiz(res.data.data?.quiz);
            setQuestions(res.data.data?.questions || []);
        } catch {
            setQuiz({ title: 'Number Series Basics' });
            setQuestions([
                { _id: '1', type: 'mcq', text: 'What comes next: 2, 4, 8, 16, ?', options: ['24', '32', '30', '28'], correctAnswer: '32' },
                { _id: '2', type: 'descriptive', text: 'Explain the Fibonacci sequence pattern.', topperAnswer: 'The Fibonacci sequence...' },
            ]);
        } finally { setLoading(false); }
    };

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const openModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            setFormData({
                type: question.type,
                text: question.text,
                options: question.type === 'mcq' ? question.options : ['', '', '', ''],
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
        if (!formData.text.trim()) return;
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
            if (editingQuestion) await api.put(`/admin/questions/${editingQuestion._id}`, payload);
            else await api.post(`/admin/quizzes/${quizId}/questions`, payload);
            fetchQuestions();
            setShowModal(false);
        } catch {
            if (editingQuestion) setQuestions(questions.map(q => q._id === editingQuestion._id ? { ...q, ...payload } : q));
            else setQuestions([...questions, { _id: Date.now().toString(), ...payload }]);
            setShowModal(false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this question?')) return;
        try { await api.delete(`/admin/questions/${id}`); fetchQuestions(); }
        catch { setQuestions(questions.filter(q => q._id !== id)); }
    };

    const navItems = [{ path: '/admin', label: 'Dashboard', icon: '📊' }, { path: '/admin/subjects', label: 'Subjects', icon: '📚' }, { path: '/admin/quizzes', label: 'Quizzes', icon: '📝' }, { path: '/admin/students', label: 'Students', icon: '👥' }];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header"><h2 className="text-card-title">StudyWiseBanking</h2><span className="badge badge-primary">Admin</span></div>
                <nav className="sidebar-nav">{navItems.map((item) => (<Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname.startsWith(item.path) && item.path !== '/admin' ? 'active' : location.pathname === item.path ? 'active' : ''}`}><span className="sidebar-icon">{item.icon}</span><span>{item.label}</span></Link>))}</nav>
                <div className="sidebar-footer"><div className="admin-user"><span className="text-meta">Logged in as</span><span className="text-card-title">{user?.firstName || 'Admin'}</span></div><button onClick={handleLogout} className="btn btn-ghost btn-block btn-sm">Logout</button></div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <Link to="/admin/quizzes" className="back-nav mb-2">← Back to Quizzes</Link>
                    <div className="admin-page-header"><h1 className="text-page-title">{quiz?.title || 'Questions'}</h1><Button variant="primary" onClick={() => openModal()}>+ Add Question</Button></div>
                </header>
                <div className="admin-content">
                    {loading ? <div className="loading-overlay"><div className="spinner"></div></div> : (
                        <div className="questions-list">
                            {questions.map((q, idx) => (
                                <Card key={q._id} className="question-item">
                                    <div className="question-header">
                                        <span className="question-number">Q{idx + 1}</span>
                                        <span className={`badge badge-${q.type === 'mcq' ? 'primary' : 'success'}`}>{q.type.toUpperCase()}</span>
                                        <div className="question-actions"><Button variant="ghost" size="sm" onClick={() => openModal(q)}>Edit</Button><Button variant="ghost" size="sm" onClick={() => handleDelete(q._id)}>Delete</Button></div>
                                    </div>
                                    <p className="question-text">{q.text}</p>
                                    {q.type === 'mcq' && (
                                        <div className="question-options">
                                            {q.options?.map((opt, i) => (<div key={i} className={`option-item ${opt === q.correctAnswer ? 'correct' : ''}`}>{String.fromCharCode(65 + i)}. {opt}</div>))}
                                        </div>
                                    )}
                                    {q.type === 'descriptive' && q.topperAnswer && (<div className="topper-answer"><strong>Topper Answer:</strong> {q.topperAnswer.substring(0, 100)}...</div>)}
                                </Card>
                            ))}
                            {questions.length === 0 && <Card className="empty-state"><p>No questions yet. Add your first question.</p></Card>}
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="admin-modal-header"><h2 className="text-section-title">{editingQuestion ? 'Edit Question' : 'Add Question'}</h2><button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <RadioGroup label="Question Type" name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={[{ value: 'mcq', label: 'Multiple Choice' }, { value: 'descriptive', label: 'Descriptive' }]} />
                        <Textarea label="Question Text" name="text" value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} placeholder="Enter the question" rows={3} required />
                        {formData.type === 'mcq' && (
                            <>
                                {formData.options.map((opt, i) => (<Input key={i} label={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => { const newOpts = [...formData.options]; newOpts[i] = e.target.value; setFormData({ ...formData, options: newOpts }); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} />))}
                                <Select label="Correct Answer" name="correctAnswer" value={formData.correctAnswer} onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })} options={formData.options.filter(o => o.trim()).map(o => ({ value: o, label: o }))} placeholder="Select correct answer" />
                            </>
                        )}
                        {formData.type === 'descriptive' && (<Textarea label="Topper/Ideal Answer" name="topperAnswer" value={formData.topperAnswer} onChange={(e) => setFormData({ ...formData, topperAnswer: e.target.value })} placeholder="Enter the ideal answer for AI comparison" rows={5} />)}
                        <div className="admin-modal-actions"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={saving}>{editingQuestion ? 'Update' : 'Add'}</Button></div>
                    </div>
                </div>
            )}

            <style>{`
        .questions-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .question-item { padding: var(--space-3); }
        .question-header { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
        .question-number { font-weight: var(--font-weight-bold); color: var(--color-primary); }
        .question-actions { margin-left: auto; display: flex; gap: var(--space-1); }
        .question-text { margin-bottom: var(--space-2); line-height: var(--line-height-relaxed); }
        .question-options { display: flex; flex-direction: column; gap: 4px; }
        .option-item { padding: 8px 12px; background: var(--color-bg); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
        .option-item.correct { background: var(--color-success-light); border: 1px solid var(--color-success); }
        .topper-answer { padding: var(--space-2); background: var(--color-primary-light); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
        .ml-1 { margin-left: 4px; }
      `}</style>
        </div>
    );
}

export default QuestionManagement;
