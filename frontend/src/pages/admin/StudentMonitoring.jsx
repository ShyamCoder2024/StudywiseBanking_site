import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Search, Mail, Phone, Calendar, Award, BookOpen, Clock, X, User, Eye } from 'lucide-react';

// DRD Brand Colors - Exact from index.css
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

export function StudentMonitoring() {
    const { user } = useAuth();
    const navigate = useNavigate();
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
            setStudents([]);
        } finally { setLoading(false); }
    };

    const viewStudentDetails = async (student) => {
        setSelectedStudent(student);
        try {
            const res = await api.get(`/admin/students/${student._id}/attempts`);
            setStudentAttempts(res.data.data || []);
        } catch {
            setStudentAttempts([]);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
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
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Student Monitoring</h1>
                        <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>View and manage all registered students.</p>
                    </div>
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: BRAND.textMuted }} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                borderRadius: '10px',
                                border: `1px solid ${BRAND.border}`,
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                fontFamily: 'Inter, system-ui, sans-serif'
                            }}
                        />
                    </div>
                </div>

                {/* Students Table */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                            <div style={{ width: 40, height: 40, border: `4px solid ${BRAND.border}`, borderTopColor: BRAND.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: BRAND.bg, borderBottom: `1px solid ${BRAND.border}` }}>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance</th>
                                        <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '600', color: BRAND.textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student, index) => (
                                        <tr key={student._id} style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: '50%',
                                                        backgroundColor: BRAND.primaryLight,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: BRAND.primary,
                                                        fontWeight: '700',
                                                        fontSize: '16px'
                                                    }}>
                                                        {student.firstName?.[0]}{student.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: BRAND.text }}>{student.firstName} {student.lastName}</div>
                                                        <div style={{ fontSize: '12px', color: BRAND.textMuted }}>Rank #{student.rank || index + 1}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ color: BRAND.text, fontSize: '13px' }}>{student.email}</div>
                                                <div style={{ color: BRAND.textMuted, fontSize: '12px' }}>{student.mobile || 'No phone'}</div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        backgroundColor: (student.avgScore || 0) >= 70 ? BRAND.successLight : (student.avgScore || 0) >= 50 ? '#FEF9C3' : BRAND.warningLight,
                                                        color: (student.avgScore || 0) >= 70 ? '#0d6652' : (student.avgScore || 0) >= 50 ? '#854d0e' : '#991b1b'
                                                    }}>
                                                        {student.avgScore || 0}%
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: BRAND.textMuted }}>{student.totalAttempts || 0} tests</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => viewStudentDetails(student)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '10px 18px',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        backgroundColor: BRAND.primary,
                                                        color: '#ffffff',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 8px rgba(138, 117, 186, 0.3)'
                                                    }}
                                                >
                                                    <Eye size={16} /> View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '60px 20px', textAlign: 'center', color: BRAND.textMuted }}>
                                                <User size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                                                <p style={{ margin: 0, fontWeight: '500' }}>No students found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Student Detail Modal - Fixed Position Centered */}
            {selectedStudent && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(6px)',
                        boxSizing: 'border-box'
                    }}
                    onClick={() => setSelectedStudent(null)}
                >
                    <div
                        className="admin-modal"
                        style={{
                            backgroundColor: BRAND.card,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '520px',
                            maxHeight: '90vh',
                            margin: 'auto',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            animation: 'modalFadeIn 0.2s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <style>{`
                            @keyframes modalFadeIn {
                                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                                to { opacity: 1; transform: scale(1) translateY(0); }
                            }
                        `}</style>
                        {/* Modal Header - DRD Primary Color */}
                        <div style={{
                            backgroundColor: BRAND.primary,
                            padding: '28px 24px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={18} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: '3px solid rgba(255,255,255,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: '700',
                                    fontSize: '22px'
                                }}>
                                    {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: 0 }}>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: '#fff',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            Rank #{selectedStudent.rank || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                            {/* Performance Stats - Top */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: BRAND.radius, padding: '20px', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0' }}>Performance Stats</h4>
                                <div className="admin-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: BRAND.primary }}>{selectedStudent.avgScore || 0}%</div>
                                        <div style={{ fontSize: '11px', color: BRAND.textMuted, textTransform: 'uppercase', marginTop: '4px' }}>Avg Score</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: BRAND.success }}>{selectedStudent.totalAttempts || 0}</div>
                                        <div style={{ fontSize: '11px', color: BRAND.textMuted, textTransform: 'uppercase', marginTop: '4px' }}>Quizzes Taken</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>#{selectedStudent.rank || 'N/A'}</div>
                                        <div style={{ fontSize: '11px', color: BRAND.textMuted, textTransform: 'uppercase', marginTop: '4px' }}>Rank</div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information - All Registration Fields */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: BRAND.radius, padding: '20px', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0' }}>Personal Information</h4>

                                {/* Preparing For - Highlighted */}
                                <div style={{
                                    backgroundColor: BRAND.primaryLight,
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '16px',
                                    border: `1px solid ${BRAND.primary}30`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '13px', color: BRAND.primary, fontWeight: '600' }}>Preparing For</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: BRAND.primary, textTransform: 'capitalize' }}>
                                        {selectedStudent.status === 'preparing_fulltime' ? 'Full-time Preparation' :
                                            selectedStudent.status === 'working_professional' ? 'Working Professional' :
                                                selectedStudent.status === 'student' ? 'Student' :
                                                    selectedStudent.status?.replace(/_/g, ' ') || 'Banking Exams'}
                                    </span>
                                </div>

                                {/* Info Grid - All Fields */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Row 1: Gender & Age */}
                                    <div className="admin-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Gender</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text, textTransform: 'capitalize' }}>{selectedStudent.gender || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Age</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.age || 'N/A'} years</span>
                                        </div>
                                    </div>

                                    {/* Row 2: Email */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                        <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Email</span>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.email}</span>
                                    </div>

                                    {/* Row 3: Mobile */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                        <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Mobile</span>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.mobile || 'Not provided'}</span>
                                    </div>

                                    {/* Row 4: Joined & Account Status */}
                                    <div className="admin-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Joined On</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{formatDate(selectedStudent.createdAt || selectedStudent.joinDate)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: BRAND.card, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>Account</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.success }}>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Quiz Attempts */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Clock size={16} color={BRAND.primary} />
                                    <h4 style={{ fontSize: '11px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Recent Quiz Attempts</h4>
                                </div>

                                <div style={{ backgroundColor: BRAND.bg, borderRadius: BRAND.radius, overflow: 'hidden' }}>
                                    {studentAttempts.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {studentAttempts.slice(0, 5).map((attempt, index) => (
                                                <div key={attempt._id || index} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '14px 16px',
                                                    borderBottom: index < Math.min(studentAttempts.length, 5) - 1 ? `1px solid ${BRAND.border}` : 'none'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: BRAND.text, fontSize: '14px' }}>{attempt.quizTitle}</div>
                                                        <div style={{ fontSize: '12px', color: BRAND.textMuted }}>{formatDate(attempt.date)}</div>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        backgroundColor: (attempt.score || 0) >= 70 ? BRAND.successLight : BRAND.warningLight,
                                                        color: (attempt.score || 0) >= 70 ? '#0d6652' : '#991b1b'
                                                    }}>
                                                        {attempt.score}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '32px', textAlign: 'center', color: BRAND.textMuted }}>
                                            <BookOpen size={28} style={{ margin: '0 auto 8px', opacity: 0.4, color: BRAND.primary }} />
                                            <p style={{ margin: 0, fontSize: '13px' }}>No quiz attempts yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Only Close Button */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: BRAND.primary,
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(138, 117, 186, 0.3)'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default StudentMonitoring;
