import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ArrowLeft, AlertTriangle, Users, Mail, Calendar, Search } from 'lucide-react';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    warning: '#ED6771',
    warningLight: '#FCE6E8',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB',
    shadowCard: '0 4px 12px rgba(0, 0, 0, 0.04)',
    radius: '12px'
};

export function AllInactiveStudentsPage() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = students.filter(s =>
                `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchTerm, students]);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/students');
            const allStudents = res.data.data || [];
            // Filter students with 0 attempts
            const inactive = allStudents.filter(s => (s.totalAttempts || 0) === 0);
            setStudents(inactive);
            setFilteredStudents(inactive);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate('/admin/tasks')}
                            style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}
                        >
                            <ArrowLeft size={20} color={BRAND.text} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Students Not Attempted Tests</h1>
                            <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>{students.length} students with 0 quiz attempts</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', minWidth: '280px' }}>
                        <Search size={18} color={BRAND.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 44px',
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
                </div>

                {/* Students List */}
                <div style={{ backgroundColor: BRAND.card, borderRadius: BRAND.radius, border: `1px solid ${BRAND.border}`, boxShadow: BRAND.shadowCard }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <div style={{ width: 32, height: 32, border: `3px solid ${BRAND.border}`, borderTopColor: BRAND.warning, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : filteredStudents.length > 0 ? (
                        <div style={{ padding: '16px' }}>
                            {filteredStudents.map((student) => (
                                <div key={student._id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 20px', marginBottom: '10px',
                                    backgroundColor: BRAND.bg, borderRadius: '12px', border: `1px solid ${BRAND.border}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: 50, height: 50, borderRadius: '50%',
                                            backgroundColor: BRAND.warningLight,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: BRAND.warning, fontWeight: '700', fontSize: '16px'
                                        }}>
                                            {student.firstName?.[0]}{student.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: BRAND.text }}>
                                                {student.firstName} {student.lastName}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: BRAND.textSecondary }}>
                                                    <Mail size={14} /> {student.email}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: BRAND.textMuted }}>
                                                    <Calendar size={14} /> Joined {formatDate(student.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            backgroundColor: BRAND.warningLight,
                                            color: BRAND.warning
                                        }}>
                                            {student.totalAttempts || 0} tests taken
                                        </span>
                                        {student.mobile && (
                                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: BRAND.textMuted }}>
                                                📱 {student.mobile}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '60px', textAlign: 'center', color: BRAND.textMuted }}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: '16px', color: BRAND.success }} />
                            <p style={{ margin: 0, fontWeight: '500', fontSize: '16px', color: BRAND.success }}>
                                {searchTerm ? 'No matching students found' : 'All students have attempted tests!'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
                                {searchTerm ? 'Try a different search term' : 'Great job! Everyone is active.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AllInactiveStudentsPage;
