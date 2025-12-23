import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Search, Mail, Phone, Calendar, Award, BookOpen, Clock, X, User, Eye, CreditCard, Tag, Plus, Check } from 'lucide-react';

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
    const [availableCourses, setAvailableCourses] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [savingEnrollment, setSavingEnrollment] = useState(false);
    // Batch selection modal state
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');

    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            setAvailableCourses(res.data.data || []);
        } catch {
            setAvailableCourses([
                { id: 'banking-complete-2024', name: 'Complete Banking Course 2024', batches: ['Batch A', 'Batch B', 'Batch C'] },
                { id: 'sbi-po-2024', name: 'SBI PO 2024', batches: ['January Batch', 'March Batch'] },
                { id: 'ibps-clerk-2024', name: 'IBPS Clerk 2024', batches: ['Main Batch'] },
                { id: 'rbi-grade-b', name: 'RBI Grade B', batches: ['Phase 1', 'Phase 2'] }
            ]);
        }
    };

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
        setNewTag('');
        try {
            const res = await api.get(`/admin/students/${student._id}/attempts`);
            setStudentAttempts(res.data.data || []);
        } catch {
            setStudentAttempts([]);
        }
    };

    const togglePaidStatus = async () => {
        if (!selectedStudent) return;

        // If student is currently paid, just mark as unpaid
        if (selectedStudent.enrollment?.isPaid) {
            setSavingEnrollment(true);
            try {
                await api.put(`/admin/students/${selectedStudent._id}/enrollment`, { isPaid: false });
                setSelectedStudent(prev => ({
                    ...prev,
                    enrollment: { ...prev.enrollment, isPaid: false }
                }));
                setStudents(prev => prev.map(s =>
                    s._id === selectedStudent._id
                        ? { ...s, enrollment: { ...s.enrollment, isPaid: false } }
                        : s
                ));
            } catch (err) {
                alert('Failed to update payment status');
            } finally {
                setSavingEnrollment(false);
            }
        } else {
            // If marking as paid, show batch selection modal
            setSelectedCourseId('');
            setSelectedBatch('');
            setShowBatchModal(true);
        }
    };

    // Confirm enrollment with selected batch
    const confirmEnrollmentWithBatch = async () => {
        if (!selectedStudent) return;
        if (!selectedCourseId || !selectedBatch) {
            alert('Please select both a course and a batch');
            return;
        }

        const course = availableCourses.find(c => c.id === selectedCourseId || c._id === selectedCourseId);
        if (!course) {
            alert('Selected course not found');
            return;
        }

        setSavingEnrollment(true);
        try {
            await api.put(`/admin/students/${selectedStudent._id}/enrollment`, {
                isPaid: true,
                courseId: course.id || course._id,
                courseName: course.name,
                batch: selectedBatch
            });

            const newCourse = {
                courseId: course.id || course._id,
                courseName: course.name,
                batch: selectedBatch,
                enrolledAt: new Date()
            };

            setSelectedStudent(prev => ({
                ...prev,
                enrollment: {
                    ...prev.enrollment,
                    isPaid: true,
                    courses: [...(prev.enrollment?.courses || []), newCourse]
                }
            }));

            setStudents(prev => prev.map(s =>
                s._id === selectedStudent._id
                    ? { ...s, enrollment: { ...s.enrollment, isPaid: true } }
                    : s
            ));

            setShowBatchModal(false);
        } catch (err) {
            alert('Failed to enroll student');
        } finally {
            setSavingEnrollment(false);
        }
    };

    const addTag = async () => {
        if (!selectedStudent || !newTag.trim()) return;
        setSavingEnrollment(true);
        try {
            await api.post(`/admin/students/${selectedStudent._id}/tags`, { tag: newTag.trim() });

            const updatedTags = [...(selectedStudent.enrollment?.tags || []), newTag.trim()];
            setSelectedStudent(prev => ({
                ...prev,
                enrollment: { ...prev.enrollment, tags: updatedTags }
            }));
            setNewTag('');
        } catch (err) {
            alert('Failed to add tag');
        } finally {
            setSavingEnrollment(false);
        }
    };

    const removeTag = async (tag) => {
        if (!selectedStudent) return;
        setSavingEnrollment(true);
        try {
            await api.delete(`/admin/students/${selectedStudent._id}/tags/${encodeURIComponent(tag)}`);

            const updatedTags = (selectedStudent.enrollment?.tags || []).filter(t => t !== tag);
            setSelectedStudent(prev => ({
                ...prev,
                enrollment: { ...prev.enrollment, tags: updatedTags }
            }));
        } catch (err) {
            alert('Failed to remove tag');
        } finally {
            setSavingEnrollment(false);
        }
    };

    const enrollInCourse = async (courseId, courseName, batch) => {
        if (!selectedStudent) return;
        setSavingEnrollment(true);
        try {
            await api.put(`/admin/students/${selectedStudent._id}/enrollment`, {
                courseId,
                courseName,
                batch,
                isPaid: true
            });

            const newCourse = { courseId, courseName, batch, enrolledAt: new Date() };
            setSelectedStudent(prev => ({
                ...prev,
                enrollment: {
                    ...prev.enrollment,
                    isPaid: true,
                    courses: [...(prev.enrollment?.courses || []), newCourse]
                }
            }));
        } catch (err) {
            alert('Failed to enroll in course');
        } finally {
            setSavingEnrollment(false);
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

                            {/* Enrollment Management Section */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: BRAND.radius, padding: '20px', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '11px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={14} />
                                    Enrollment Management
                                </h4>

                                {/* Paid Status Toggle */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '16px',
                                    backgroundColor: selectedStudent.enrollment?.isPaid ? BRAND.successLight : BRAND.warningLight,
                                    borderRadius: '10px',
                                    marginBottom: '12px',
                                    border: `1px solid ${selectedStudent.enrollment?.isPaid ? BRAND.success : BRAND.warning}30`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: BRAND.text, fontSize: '14px' }}>Payment Status</div>
                                        <div style={{ fontSize: '12px', color: BRAND.textSecondary, marginTop: '2px' }}>
                                            {selectedStudent.enrollment?.isPaid ? 'Premium Member' : 'Free User'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={togglePaidStatus}
                                        disabled={savingEnrollment}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: selectedStudent.enrollment?.isPaid ? BRAND.warning : BRAND.success,
                                            color: '#fff',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            opacity: savingEnrollment ? 0.6 : 1
                                        }}
                                    >
                                        {selectedStudent.enrollment?.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                                    </button>
                                </div>

                                {/* Tags Section */}
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <Tag size={14} color={BRAND.primary} />
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: BRAND.text }}>Student Tags</span>
                                    </div>

                                    {/* Existing Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                        {(selectedStudent.enrollment?.tags || []).map((tag, i) => (
                                            <span key={i} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                backgroundColor: BRAND.primaryLight,
                                                color: BRAND.primary,
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: BRAND.primary,
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        {(selectedStudent.enrollment?.tags || []).length === 0 && (
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted }}>No tags added</span>
                                        )}
                                    </div>

                                    {/* Add Tag Input */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag..."
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: `1px solid ${BRAND.border}`,
                                                fontSize: '13px',
                                                outline: 'none'
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                        />
                                        <button
                                            onClick={addTag}
                                            disabled={!newTag.trim() || savingEnrollment}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: BRAND.primary,
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                opacity: !newTag.trim() ? 0.5 : 1
                                            }}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>

                                {/* Enrolled Courses */}
                                {selectedStudent.enrollment?.isPaid && (
                                    <div style={{ marginTop: '16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: BRAND.text, marginBottom: '8px', display: 'block' }}>
                                            Enrolled Courses
                                        </span>
                                        {(selectedStudent.enrollment?.courses || []).length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {selectedStudent.enrollment.courses.map((course, i) => (
                                                    <div key={i} style={{
                                                        padding: '12px',
                                                        backgroundColor: BRAND.card,
                                                        borderRadius: '8px',
                                                        border: `1px solid ${BRAND.success}40`,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text }}>{course.courseName}</div>
                                                            <div style={{ fontSize: '11px', color: BRAND.textMuted }}>{course.batch}</div>
                                                        </div>
                                                        <Check size={16} color={BRAND.success} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '12px', color: BRAND.textMuted, margin: '8px 0' }}>No courses enrolled</p>
                                        )}
                                    </div>
                                )}
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

            {/* Batch Selection Modal */}
            {showBatchModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        boxSizing: 'border-box'
                    }}
                    onClick={() => setShowBatchModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: BRAND.card,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '440px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            animation: 'modalFadeIn 0.2s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            backgroundColor: BRAND.success,
                            padding: '24px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '6px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    color: '#fff',
                                    display: 'flex'
                                }}
                            >
                                <X size={16} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CreditCard size={24} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                                        Enroll Student
                                    </h3>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                                        Select course and batch for {selectedStudent?.firstName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Course Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: BRAND.textSecondary,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Select Course *
                                </label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => {
                                        setSelectedCourseId(e.target.value);
                                        setSelectedBatch(''); // Reset batch when course changes
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '10px',
                                        border: `2px solid ${selectedCourseId ? BRAND.success : BRAND.border}`,
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: BRAND.card,
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    <option value="">-- Choose a course --</option>
                                    {availableCourses.map(course => (
                                        <option key={course.id || course._id} value={course.id || course._id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Batch Selection */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: BRAND.textSecondary,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Select Batch *
                                </label>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    disabled={!selectedCourseId}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '10px',
                                        border: `2px solid ${selectedBatch ? BRAND.success : BRAND.border}`,
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: !selectedCourseId ? BRAND.bg : BRAND.card,
                                        cursor: selectedCourseId ? 'pointer' : 'not-allowed',
                                        outline: 'none',
                                        opacity: selectedCourseId ? 1 : 0.6,
                                        transition: 'border-color 0.2s'
                                    }}
                                >
                                    <option value="">
                                        {selectedCourseId ? '-- Choose a batch --' : '-- Select course first --'}
                                    </option>
                                    {selectedCourseId &&
                                        (availableCourses.find(c => (c.id || c._id) === selectedCourseId)?.batches || []).map(batch => (
                                            <option key={batch} value={batch}>{batch}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* Summary */}
                            {selectedCourseId && selectedBatch && (
                                <div style={{
                                    backgroundColor: BRAND.successLight,
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    border: `1px solid ${BRAND.success}30`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Check size={16} color={BRAND.success} />
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: BRAND.success }}>Ready to Enroll</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: BRAND.text, margin: 0 }}>
                                        <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> will be enrolled in{' '}
                                        <strong>{availableCourses.find(c => (c.id || c._id) === selectedCourseId)?.name}</strong> ({selectedBatch})
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '16px 24px',
                            borderTop: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg,
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => setShowBatchModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: `1px solid ${BRAND.border}`,
                                    backgroundColor: BRAND.card,
                                    color: BRAND.textSecondary,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEnrollmentWithBatch}
                                disabled={!selectedCourseId || !selectedBatch || savingEnrollment}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: (!selectedCourseId || !selectedBatch) ? BRAND.border : BRAND.success,
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: (!selectedCourseId || !selectedBatch) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: savingEnrollment ? 0.6 : 1
                                }}
                            >
                                {savingEnrollment ? 'Enrolling...' : (
                                    <>
                                        <Check size={16} />
                                        Confirm Enrollment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default StudentMonitoring;
