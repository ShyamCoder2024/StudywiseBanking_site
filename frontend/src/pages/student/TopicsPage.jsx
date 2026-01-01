import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import api from '../../services/api';
import './ContentPages.css';

export function TopicsPage() {
    const { subjectId } = useParams();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
    }, [subjectId]);

    const fetchTopics = async () => {
        try {
            const response = await api.get(`/student/subjects/${subjectId}/topics`);
            if (response.data.success) {
                setSubject(response.data.data.subject);
                setTopics(response.data.data.topics);
            }
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            // Mock data
            setSubject({ name: 'Quantitative Aptitude' });
            setTopics([
                { _id: '1', name: 'Number Series', description: 'Find the pattern in sequences', quizCount: 5 },
                { _id: '2', name: 'Simplification', description: 'BODMAS and calculations', quizCount: 4 },
                { _id: '3', name: 'Percentage', description: 'Percentage calculations and applications', quizCount: 6 },
                { _id: '4', name: 'Profit & Loss', description: 'Business mathematics', quizCount: 4 },
                { _id: '5', name: 'Time & Work', description: 'Work efficiency problems', quizCount: 3 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <Loader />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <Link to="/subjects" className="back-nav">
                    ← Back to Subjects
                </Link>

                <div className="page-header">
                    <h1 className="text-page-title">{subject?.name || 'Topics'}</h1>
                    <p className="text-secondary">Select a topic to view available quizzes</p>
                </div>

                <div className="content-grid">
                    {topics.map((topic) => (
                        <Link to={`/topics/${topic._id}/quizzes`} key={topic._id}>
                            <Card className="content-card">
                                <div className="content-info">
                                    <h3 className="text-card-title">{topic.name}</h3>
                                    <p className="text-meta">{topic.description}</p>
                                </div>
                                <div className="content-meta">
                                    <span className="badge badge-primary">{topic.quizCount} Quizzes</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {topics.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <h3 className="text-section-title">No Topics Yet</h3>
                        <p className="text-secondary">Topics will be added soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopicsPage;
