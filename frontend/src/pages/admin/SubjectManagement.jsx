import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import api from '../../services/api';
import './AdminLayout.css';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

export function SubjectManagement() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '📖' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/admin/subjects');
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            // Mock data
            setSubjects([
                { _id: '1', name: 'Quantitative Aptitude', description: 'Numbers, Algebra, Geometry', icon: '🔢', topicCount: 15 },
                { _id: '2', name: 'Reasoning Ability', description: 'Logical and Analytical Reasoning', icon: '🧠', topicCount: 12 },
                { _id: '3', name: 'English Language', description: 'Grammar, Vocabulary', icon: '📚', topicCount: 10 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (subject = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({ name: subject.name, description: subject.description, icon: subject.icon });
        } else {
            setEditingSubject(null);
            setFormData({ name: '', description: '', icon: '📖' });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;

        setSaving(true);
        try {
            if (editingSubject) {
                await api.put(`/admin/subjects/${editingSubject._id}`, formData);
            } else {
                await api.post('/admin/subjects', formData);
            }
            fetchSubjects();
            setShowModal(false);
        } catch (error) {
            console.error('Save failed:', error);
            if (editingSubject) {
                setSubjects(subjects.map(s => s._id === editingSubject._id ? { ...s, ...formData } : s));
            } else {
                setSubjects([...subjects, { _id: Date.now().toString(), ...formData, topicCount: 0 }]);
            }
            setShowModal(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            await api.delete(`/admin/subjects/${id}`);
            fetchSubjects();
        } catch (error) {
            setSubjects(subjects.filter(s => s._id !== id));
        }
    };

    return (
        <AdminLayout>
            <header className="admin-header">
                <div className="admin-page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-page-title">Subject Management</h1>
                    <Button variant="primary" onClick={() => openModal()}>
                        + Add Subject
                    </Button>
                </div>
            </header>

            <div className="admin-content">
                {loading ? (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Topics</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject._id}>
                                        <td>{subject.icon}</td>
                                        <td className="text-card-title">{subject.name}</td>
                                        <td className="text-secondary">{subject.description}</td>
                                        <td>
                                            <Link to={`/admin/subjects/${subject._id}/topics`}>
                                                <span className="badge badge-primary">{subject.topicCount} Topics</span>
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openModal(subject)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(subject._id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2 className="text-section-title">
                                {editingSubject ? 'Edit Subject' : 'Add Subject'}
                            </h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <Input
                            label="Subject Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Quantitative Aptitude"
                            required
                        />

                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the subject"
                            rows={3}
                        />

                        <Input
                            label="Icon (Emoji)"
                            name="icon"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="📖"
                        />

                        <div className="admin-modal-actions">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave} loading={saving}>
                                {editingSubject ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default SubjectManagement;
