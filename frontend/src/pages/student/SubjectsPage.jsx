import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import './ContentPages.css';

export function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects');
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            // Mock data for demo
            setSubjects([
                { _id: '1', name: 'Quantitative Aptitude', description: 'Numbers, Algebra, Geometry and more', topicCount: 15, icon: '🔢' },
                { _id: '2', name: 'Reasoning Ability', description: 'Logical and Analytical Reasoning', topicCount: 12, icon: '🧠' },
                { _id: '3', name: 'English Language', description: 'Grammar, Vocabulary, Comprehension', topicCount: 10, icon: '📚' },
                { _id: '4', name: 'General Awareness', description: 'Current Affairs, Banking, Economy', topicCount: 8, icon: '🌍' },
                { _id: '5', name: 'Computer Knowledge', description: 'Basic Computer Concepts', topicCount: 6, icon: '💻' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="text-page-title">Subjects</h1>
                    <p className="text-secondary">Select a subject to explore topics and quizzes</p>
                </div>

                <div className="content-grid">
                    {subjects.map((subject) => (
                        <Link to={`/subjects/${subject._id}/topics`} key={subject._id}>
                            <Card className="content-card">
                                <div className="content-icon">{subject.icon || '📖'}</div>
                                <div className="content-info">
                                    <h3 className="text-card-title">{subject.name}</h3>
                                    <p className="text-meta">{subject.description}</p>
                                </div>
                                <div className="content-meta">
                                    <span className="badge badge-primary">{subject.topicCount} Topics</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SubjectsPage;
