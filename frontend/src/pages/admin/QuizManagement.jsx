import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import api from '../../services/api';
import './AdminLayout.css';

export function QuizManagement() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [quizzes, setQuizzes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [formData, setFormData] = useState({ title: '', subjectId: '', topicId: '', duration: 15, difficulty: 'Medium', isMockTest: false });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [quizRes, subjectRes] = await Promise.all([api.get('/admin/quizzes'), api.get('/admin/subjects')]);
            setQuizzes(quizRes.data.data || []);
            setSubjects(subjectRes.data.data || []);
        } catch {
            setQuizzes([
                { _id: '1', title: 'Number Series Basics', subjectName: 'Quantitative', topicName: 'Number Series', duration: 15, difficulty: 'Easy', questionCount: 10 },
                { _id: '2', title: 'Banking Awareness Mock', subjectName: 'General Awareness', topicName: 'Banking', duration: 30, difficulty: 'Medium', questionCount: 25, isMockTest: true },
            ]);
            setSubjects([{ _id: '1', name: 'Quantitative Aptitude' }, { _id: '2', name: 'General Awareness' }]);
        } finally { setLoading(false); }
    };

    const fetchTopics = async (subjectId) => {
        if (!subjectId) { setTopics([]); return; }
        try {
            const res = await api.get(`/admin/subjects/${subjectId}/topics`);
            setTopics(res.data.data?.topics || []);
        } catch { setTopics([{ _id: '1', name: 'Number Series' }, { _id: '2', name: 'Percentage' }]); }
    };

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const openModal = (quiz = null) => {
        if (quiz) {
            setEditingQuiz(quiz);
            setFormData({ title: quiz.title, subjectId: quiz.subjectId || '', topicId: quiz.topicId || '', duration: quiz.duration, difficulty: quiz.difficulty, isMockTest: quiz.isMockTest || false });
        } else {
            setEditingQuiz(null);
            setFormData({ title: '', subjectId: '', topicId: '', duration: 15, difficulty: 'Medium', isMockTest: false });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return;
        setSaving(true);
        try {
            if (editingQuiz) await api.put(`/admin/quizzes/${editingQuiz._id}`, formData);
            else await api.post('/admin/quizzes', formData);
            fetchData();
            setShowModal(false);
        } catch {
            if (editingQuiz) setQuizzes(quizzes.map(q => q._id === editingQuiz._id ? { ...q, ...formData } : q));
            else setQuizzes([...quizzes, { _id: Date.now().toString(), ...formData, questionCount: 0 }]);
            setShowModal(false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this quiz?')) return;
        try { await api.delete(`/admin/quizzes/${id}`); fetchData(); }
        catch { setQuizzes(quizzes.filter(q => q._id !== id)); }
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/subjects', label: 'Subjects', icon: '📚' },
        { path: '/admin/quizzes', label: 'Quizzes', icon: '📝' },
        { path: '/admin/students', label: 'Students', icon: '👥' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header"><h2 className="text-card-title">StudyWiseBanking</h2><span className="badge badge-primary">Admin</span></div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (<Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}><span className="sidebar-icon">{item.icon}</span><span>{item.label}</span></Link>))}
                </nav>
                <div className="sidebar-footer"><div className="admin-user"><span className="text-meta">Logged in as</span><span className="text-card-title">{user?.firstName || 'Admin'}</span></div><button onClick={handleLogout} className="btn btn-ghost btn-block btn-sm">Logout</button></div>
            </aside>

            <main className="admin-main">
                <header className="admin-header"><div className="admin-page-header"><h1 className="text-page-title">Quiz Management</h1><Button variant="primary" onClick={() => openModal()}>+ Create Quiz</Button></div></header>
                <div className="admin-content">
                    {loading ? <div className="loading-overlay"><div className="spinner"></div></div> : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>Title</th><th>Subject</th><th>Topic</th><th>Duration</th><th>Difficulty</th><th>Questions</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {quizzes.map((quiz) => (
                                        <tr key={quiz._id}>
                                            <td className="text-card-title">{quiz.title}{quiz.isMockTest && <span className="badge badge-warning ml-1">Mock</span>}</td>
                                            <td>{quiz.subjectName}</td>
                                            <td>{quiz.topicName}</td>
                                            <td>{quiz.duration} min</td>
                                            <td><span className={`badge badge-${quiz.difficulty === 'Easy' ? 'success' : quiz.difficulty === 'Medium' ? 'primary' : 'warning'}`}>{quiz.difficulty}</span></td>
                                            <td><Link to={`/admin/quizzes/${quiz._id}/questions`}><span className="badge badge-primary">{quiz.questionCount} Questions</span></Link></td>
                                            <td><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openModal(quiz)}>Edit</Button><Button variant="ghost" size="sm" onClick={() => handleDelete(quiz._id)}>Delete</Button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header"><h2 className="text-section-title">{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h2><button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <Input label="Quiz Title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Number Series Basics" required />
                        <Select label="Subject" name="subjectId" value={formData.subjectId} onChange={(e) => { setFormData({ ...formData, subjectId: e.target.value, topicId: '' }); fetchTopics(e.target.value); }} options={subjects.map(s => ({ value: s._id, label: s.name }))} />
                        <Select label="Topic" name="topicId" value={formData.topicId} onChange={(e) => setFormData({ ...formData, topicId: e.target.value })} options={topics.map(t => ({ value: t._id, label: t.name }))} />
                        <div className="flex gap-2">
                            <Input label="Duration (mins)" type="number" name="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} min="5" max="180" />
                            <Select label="Difficulty" name="difficulty" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} options={[{ value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }]} />
                        </div>
                        <label className="form-radio mt-2"><input type="checkbox" checked={formData.isMockTest} onChange={(e) => setFormData({ ...formData, isMockTest: e.target.checked })} /><span>Mark as Mock Test</span></label>
                        <div className="admin-modal-actions"><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} loading={saving}>{editingQuiz ? 'Update' : 'Create'}</Button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizManagement;
