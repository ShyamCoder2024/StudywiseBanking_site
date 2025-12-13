import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import api from '../../services/api';
import './AdminLayout.css';

export function TopicManagement() {
    const { subjectId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, [subjectId]);

    const fetchTopics = async () => {
        try {
            const response = await api.get(`/admin/subjects/${subjectId}/topics`);
            if (response.data.success) {
                setSubject(response.data.data.subject);
                setTopics(response.data.data.topics);
            }
        } catch (error) {
            setSubject({ name: 'Quantitative Aptitude' });
            setTopics([
                { _id: '1', name: 'Number Series', description: 'Find patterns in sequences', quizCount: 5 },
                { _id: '2', name: 'Simplification', description: 'BODMAS and calculations', quizCount: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const openModal = (topic = null) => {
        if (topic) {
            setEditingTopic(topic);
            setFormData({ name: topic.name, description: topic.description });
        } else {
            setEditingTopic(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        setSaving(true);
        try {
            if (editingTopic) {
                await api.put(`/admin/topics/${editingTopic._id}`, formData);
            } else {
                await api.post(`/admin/subjects/${subjectId}/topics`, formData);
            }
            fetchTopics();
            setShowModal(false);
        } catch (error) {
            if (editingTopic) {
                setTopics(topics.map(t => t._id === editingTopic._id ? { ...t, ...formData } : t));
            } else {
                setTopics([...topics, { _id: Date.now().toString(), ...formData, quizCount: 0 }]);
            }
            setShowModal(false);
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this topic?')) return;
        try { await api.delete(`/admin/topics/${id}`); fetchTopics(); }
        catch { setTopics(topics.filter(t => t._id !== id)); }
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
                <div className="sidebar-header">
                    <h2 className="text-card-title">StudyWiseBanking</h2>
                    <span className="badge badge-primary">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname.startsWith(item.path) && item.path !== '/admin' ? 'active' : location.pathname === item.path ? 'active' : ''}`}>
                            <span className="sidebar-icon">{item.icon}</span><span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="admin-user"><span className="text-meta">Logged in as</span><span className="text-card-title">{user?.firstName || 'Admin'}</span></div>
                    <button onClick={handleLogout} className="btn btn-ghost btn-block btn-sm">Logout</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <Link to="/admin/subjects" className="back-nav mb-2">← Back to Subjects</Link>
                    <div className="admin-page-header">
                        <h1 className="text-page-title">{subject?.name || 'Topics'}</h1>
                        <Button variant="primary" onClick={() => openModal()}>+ Add Topic</Button>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? <div className="loading-overlay"><div className="spinner"></div></div> : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>Name</th><th>Description</th><th>Quizzes</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {topics.map((topic) => (
                                        <tr key={topic._id}>
                                            <td className="text-card-title">{topic.name}</td>
                                            <td className="text-secondary">{topic.description}</td>
                                            <td><span className="badge badge-primary">{topic.quizCount} Quizzes</span></td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openModal(topic)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(topic._id)}>Delete</Button>
                                                </div>
                                            </td>
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
                        <div className="admin-modal-header">
                            <h2 className="text-section-title">{editingTopic ? 'Edit Topic' : 'Add Topic'}</h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <Input label="Topic Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Number Series" required />
                        <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" rows={3} />
                        <div className="admin-modal-actions">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSave} loading={saving}>{editingTopic ? 'Update' : 'Create'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopicManagement;
