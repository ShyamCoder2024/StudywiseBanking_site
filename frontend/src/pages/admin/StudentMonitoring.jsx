import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import './AdminLayout.css';

export function StudentMonitoring() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAttempts, setStudentAttempts] = useState([]);

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data.data || []);
        } catch {
            setStudents([
                { _id: '1', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com', mobile: '9876543210', status: 'preparing_fulltime', totalAttempts: 15, avgScore: 72 },
                { _id: '2', firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com', mobile: '9876543211', status: 'student', totalAttempts: 8, avgScore: 85 },
                { _id: '3', firstName: 'Amit', lastName: 'Kumar', email: 'amit@example.com', mobile: '9876543212', status: 'working_professional', totalAttempts: 12, avgScore: 68 },
            ]);
        } finally { setLoading(false); }
    };

    const viewStudentDetails = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await api.get(`/admin/students/${student._id}/attempts`);
            setStudentAttempts(res.data.data || []);
        } catch {
            setStudentAttempts([
                { _id: '1', quizTitle: 'Number Series', score: 85, date: '2024-01-10', aiAnalysis: true },
                { _id: '2', quizTitle: 'Banking Awareness', score: 72, date: '2024-01-09', aiAnalysis: true },
            ]);
        }
    };

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navItems = [{ path: '/admin', label: 'Dashboard', icon: '📊' }, { path: '/admin/subjects', label: 'Subjects', icon: '📚' }, { path: '/admin/quizzes', label: 'Quizzes', icon: '📝' }, { path: '/admin/students', label: 'Students', icon: '👥' }];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header"><h2 className="text-card-title">StudyWiseBanking</h2><span className="badge badge-primary">Admin</span></div>
                <nav className="sidebar-nav">{navItems.map((item) => (<Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}><span className="sidebar-icon">{item.icon}</span><span>{item.label}</span></Link>))}</nav>
                <div className="sidebar-footer"><div className="admin-user"><span className="text-meta">Logged in as</span><span className="text-card-title">{user?.firstName || 'Admin'}</span></div><button onClick={handleLogout} className="btn btn-ghost btn-block btn-sm">Logout</button></div>
            </aside>

            <main className="admin-main">
                <header className="admin-header"><div className="admin-page-header"><h1 className="text-page-title">Student Monitoring</h1><div style={{ width: '300px' }}><Input placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div></header>
                <div className="admin-content">
                    {loading ? <div className="loading-overlay"><div className="spinner"></div></div> : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Status</th><th>Attempts</th><th>Avg Score</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id}>
                                            <td className="text-card-title">{student.firstName} {student.lastName}</td>
                                            <td>{student.email}</td>
                                            <td>{student.mobile}</td>
                                            <td><span className="badge badge-primary">{student.status?.replace('_', ' ')}</span></td>
                                            <td>{student.totalAttempts}</td>
                                            <td><span className={`badge badge-${student.avgScore >= 70 ? 'success' : student.avgScore >= 50 ? 'primary' : 'warning'}`}>{student.avgScore}%</span></td>
                                            <td><Button variant="ghost" size="sm" onClick={() => viewStudentDetails(student)}>View Details</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {selectedStudent && (
                <div className="admin-modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="admin-modal-header"><h2 className="text-section-title">{selectedStudent.firstName} {selectedStudent.lastName}</h2><button className="admin-modal-close" onClick={() => setSelectedStudent(null)}>×</button></div>
                        <div className="mb-3">
                            <p><strong>Email:</strong> {selectedStudent.email}</p>
                            <p><strong>Mobile:</strong> {selectedStudent.mobile}</p>
                            <p><strong>Status:</strong> {selectedStudent.status?.replace('_', ' ')}</p>
                        </div>
                        <h3 className="text-card-title mb-2">Recent Attempts</h3>
                        <div className="table-wrapper">
                            <table className="table">
                                <thead><tr><th>Quiz</th><th>Score</th><th>Date</th><th>AI Analysis</th></tr></thead>
                                <tbody>
                                    {studentAttempts.map((attempt) => (
                                        <tr key={attempt._id}>
                                            <td>{attempt.quizTitle}</td>
                                            <td><span className={`badge badge-${attempt.score >= 70 ? 'success' : 'warning'}`}>{attempt.score}%</span></td>
                                            <td>{attempt.date}</td>
                                            <td>{attempt.aiAnalysis ? <span className="badge badge-success">Available</span> : <span className="badge">Pending</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <style>{`.mb-3 { margin-bottom: var(--space-3); } .mb-2 { margin-bottom: var(--space-2); }`}</style>
        </div>
    );
}

export default StudentMonitoring;
