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
    const [selectedCourseIds, setSelectedCourseIds] = useState([]); // NEW: Multi-course selection
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedBatches, setSelectedBatches] = useState([]); // NEW: Multi-batch selection
    // Course duration state
    const [courseDuration, setCourseDuration] = useState('');
    const [durationType, setDurationType] = useState('months'); // 'days' or 'months'


    useEffect(() => {
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/admin/courses');
            const courses = res.data.data || [];

            // Map courses to ensure they have batches array
            const coursesWithBatches = courses.map(course => ({
                ...course,
                batches: course.batches && course.batches.length > 0
                    ? course.batches
                    : ['Main Batch'] // Default batch if none specified
            }));

            setAvailableCourses(coursesWithBatches);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            // Show empty instead of dummy data - admin needs to add real courses
            setAvailableCourses([]);
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
            setCourseDuration('');
            setDurationType('months');
            setShowBatchModal(true);
        }
    };

    // Toggle course selection for multi-select
    const toggleCourseSelection = (courseId) => {
        setSelectedCourseIds(prev => {
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            } else {
                return [...prev, courseId];
            }
        });
    };

    // Toggle batch selection for multi-select
    const toggleBatchSelection = (batchName) => {
        setSelectedBatches(prev => {
            if (prev.includes(batchName)) {
                return prev.filter(b => b !== batchName);
            } else {
                return [...prev, batchName];
            }
        });
    };

    // Confirm enrollment with selected batch and duration (Multi-course & Multi-batch support)
    const confirmEnrollmentWithBatch = async () => {
        if (!selectedStudent) return;

        // Support both single and multi-course selection
        const coursesToEnroll = selectedCourseIds.length > 0 ? selectedCourseIds : (selectedCourseId ? [selectedCourseId] : []);
        // Support both single and multi-batch selection
        const batchesToEnroll = selectedBatches.length > 0 ? selectedBatches : (selectedBatch ? [selectedBatch] : []);

        if (coursesToEnroll.length === 0) {
            alert('Please select at least one course');
            return;
        }
        if (batchesToEnroll.length === 0) {
            alert('Please select at least one batch');
            return;
        }
        if (!courseDuration || parseInt(courseDuration) <= 0) {
            alert('Please enter a valid course duration');
            return;
        }

        // Calculate expiry date
        const enrollmentDate = new Date();
        const expiryDate = new Date(enrollmentDate);

        if (durationType === 'months') {
            expiryDate.setMonth(expiryDate.getMonth() + parseInt(courseDuration));
        } else {
            expiryDate.setDate(expiryDate.getDate() + parseInt(courseDuration));
        }

        setSavingEnrollment(true);
        try {
            // NEW: Use single API call with courseIds and batches arrays
            const response = await api.put(`/admin/students/${selectedStudent._id}/enrollment`, {
                isPaid: true,
                courseIds: coursesToEnroll,  // Array of course IDs
                batches: batchesToEnroll,    // Array of batch names
                batch: batchesToEnroll.join(', '), // Fallback for backward compatibility
                duration: parseInt(courseDuration),
                durationType: durationType,
                expiryDate: expiryDate.toISOString()
            });

            // Get enrolled courses info from selected courses
            const enrolledCourses = coursesToEnroll.map(courseId => {
                const course = availableCourses.find(c => c.id === courseId || c._id === courseId);
                return {
                    courseId: course?.id || course?._id || courseId,
                    courseName: course?.name || 'Course',
                    batch: batchesToEnroll.join(', '),
                    batches: batchesToEnroll,
                    enrolledAt: new Date(),
                    duration: parseInt(courseDuration),
                    durationType: durationType,
                    expiryDate: expiryDate.toISOString()
                };
            });

            setSelectedStudent(prev => ({
                ...prev,
                enrollment: {
                    ...prev.enrollment,
                    isPaid: true,
                    courses: response.data.data?.enrollment?.courses || enrolledCourses
                }
            }));

            setStudents(prev => prev.map(s =>
                s._id === selectedStudent._id
                    ? { ...s, enrollment: { ...s.enrollment, isPaid: true } }
                    : s
            ));

            setShowBatchModal(false);
            setCourseDuration('');
            setDurationType('months');
            setSelectedCourseIds([]); // Clear multi-select courses
            setSelectedBatches([]); // Clear multi-select batches
            setSelectedBatch(''); // Clear single batch
            alert(`✅ Successfully enrolled in ${coursesToEnroll.length} course(s) with ${batchesToEnroll.length} batch(es)!`);
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
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ fontWeight: '600', color: BRAND.text }}>{student.firstName} {student.lastName}</div>
                                                            {/* PAID/UNPAID BADGE */}
                                                            {student.enrollment?.isPaid ? (
                                                                <span style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    backgroundColor: '#D1FAE5',
                                                                    color: '#065F46',
                                                                    border: '1px solid #6EE7B7',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    💰 PAID
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    padding: '2px 8px',
                                                                    borderRadius: '6px',
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    backgroundColor: '#FEE2E2',
                                                                    color: '#991B1B',
                                                                    border: '1px solid #FCA5A5',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    🔒 UNPAID
                                                                </span>
                                                            )}
                                                        </div>
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
                            padding: '12px 14px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    padding: '5px',
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: '700',
                                    fontSize: '16px'
                                }}>
                                    {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: '600'
                                        }}>
                                            Rank #{selectedStudent.rank || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>

                            {/* Performance Stats - Top */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: '6px', padding: '6px 8px', marginBottom: '5px' }}>
                                <h4 style={{ fontSize: '10px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Performance Stats</h4>
                                <div className="admin-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                    <div style={{ textAlign: 'center', padding: '5px 3px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: BRAND.primary }}>{selectedStudent.avgScore || 0}%</div>
                                        <div style={{ fontSize: '9px', color: BRAND.textMuted, textTransform: 'uppercase' }}>Avg Score</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '5px 3px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: BRAND.success }}>{selectedStudent.totalAttempts || 0}</div>
                                        <div style={{ fontSize: '9px', color: BRAND.textMuted, textTransform: 'uppercase' }}>Quizzes</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '5px 3px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>#{selectedStudent.rank || 'N/A'}</div>
                                        <div style={{ fontSize: '9px', color: BRAND.textMuted, textTransform: 'uppercase' }}>Rank</div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: '6px', padding: '6px 8px', marginBottom: '5px' }}>
                                <h4 style={{ fontSize: '10px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' }}>Personal Information</h4>

                                {/* Preparing For */}
                                <div style={{
                                    backgroundColor: BRAND.primaryLight,
                                    borderRadius: '4px',
                                    padding: '3px 6px',
                                    marginBottom: '2px',
                                    border: `1px solid ${BRAND.primary}30`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '10px', color: BRAND.primary, fontWeight: '600' }}>Preparing For</span>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: BRAND.primary }}>
                                        {selectedStudent.status === 'preparing_fulltime' ? 'Full-Time' :
                                            selectedStudent.status === 'working_professional' ? 'Working Professional' :
                                                selectedStudent.status === 'student' ? 'Student' :
                                                    selectedStudent.status?.replace(/_/g, ' ') || 'Banking'}
                                    </span>
                                </div>

                                {/* Info Grid */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    {/* Row 1: Gender & Age */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                            <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Gender</span>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text, textTransform: 'capitalize' }}>{selectedStudent.gender || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                            <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Age</span>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.age || 'N/A'} yrs</span>
                                        </div>
                                    </div>

                                    {/* Row 2: Email */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                        <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Email</span>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.email}</span>
                                    </div>

                                    {/* Row 3: Mobile */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                        <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Mobile</span>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text }}>{selectedStudent.mobile || 'N/A'}</span>
                                    </div>

                                    {/* Row 4: Joined & Account */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                            <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Joined</span>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text }}>{formatDate(selectedStudent.createdAt || selectedStudent.joinDate)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', backgroundColor: BRAND.card, borderRadius: '4px' }}>
                                            <span style={{ fontSize: '10px', color: BRAND.textMuted }}>Account</span>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: BRAND.success }}>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Management Section */}
                            <div style={{ backgroundColor: BRAND.bg, borderRadius: '6px', padding: '6px 8px', marginBottom: '5px' }}>
                                <h4 style={{ fontSize: '10px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CreditCard size={10} />
                                    Enrollment Management
                                </h4>

                                {/* Paid Status Toggle */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 6px',
                                    backgroundColor: selectedStudent.enrollment?.isPaid ? BRAND.successLight : BRAND.warningLight,
                                    borderRadius: '4px',
                                    marginBottom: '3px',
                                    border: `1px solid ${selectedStudent.enrollment?.isPaid ? BRAND.success : BRAND.warning}30`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: BRAND.text, fontSize: '11px' }}>Payment Status</div>
                                        <div style={{ fontSize: '9px', color: BRAND.textSecondary }}>
                                            {selectedStudent.enrollment?.isPaid ? 'Premium Member' : 'Free User'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={togglePaidStatus}
                                        disabled={savingEnrollment}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            border: 'none',
                                            backgroundColor: selectedStudent.enrollment?.isPaid ? BRAND.warning : BRAND.success,
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            opacity: savingEnrollment ? 0.6 : 1
                                        }}
                                    >
                                        {selectedStudent.enrollment?.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                                    </button>
                                </div>

                                {/* Tags Section */}
                                <div style={{ marginTop: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                        <Tag size={10} color={BRAND.primary} />
                                        <span style={{ fontSize: '9px', fontWeight: '600', color: BRAND.text }}>Student Tags</span>
                                    </div>

                                    {/* Existing Tags */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '4px' }}>
                                        {(selectedStudent.enrollment?.tags || []).map((tag, i) => (
                                            <span key={i} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '2px',
                                                padding: '2px 6px',
                                                backgroundColor: BRAND.primaryLight,
                                                color: BRAND.primary,
                                                borderRadius: '8px',
                                                fontSize: '9px',
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
                                                        padding: '0',
                                                        display: 'flex'
                                                    }}
                                                >
                                                    <X size={8} />
                                                </button>
                                            </span>
                                        ))}
                                        {(selectedStudent.enrollment?.tags || []).length === 0 && (
                                            <span style={{ fontSize: '9px', color: BRAND.textMuted }}>No tags added</span>
                                        )}
                                    </div>

                                    {/* Add Tag Input */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add tag..."
                                            style={{
                                                flex: 1,
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: `1px solid ${BRAND.border}`,
                                                fontSize: '10px',
                                                outline: 'none',
                                                color: BRAND.text,
                                                backgroundColor: BRAND.card
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                        />
                                        <button
                                            onClick={addTag}
                                            disabled={!newTag.trim() || savingEnrollment}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: BRAND.primary,
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '2px',
                                                fontSize: '10px',
                                                opacity: !newTag.trim() ? 0.5 : 1
                                            }}
                                        >
                                            <Plus size={10} /> Add
                                        </button>
                                    </div>
                                </div>

                                {/* Enrolled Courses */}
                                {selectedStudent.enrollment?.isPaid && (
                                    <div style={{ marginTop: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '600', color: BRAND.text, marginBottom: '4px', display: 'block' }}>
                                            Enrolled Courses
                                        </span>
                                        {(selectedStudent.enrollment?.courses || []).length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {selectedStudent.enrollment.courses.map((course, i) => (
                                                    <div key={i} style={{
                                                        padding: '6px 8px',
                                                        backgroundColor: BRAND.card,
                                                        borderRadius: '4px',
                                                        border: `1px solid ${BRAND.success}40`,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div>
                                                            <div style={{ fontSize: '11px', fontWeight: '600', color: BRAND.text }}>{course.courseName}</div>
                                                            <div style={{ fontSize: '9px', color: BRAND.textMuted }}>{course.batch}</div>
                                                            {course.expiryDate && (
                                                                <div style={{
                                                                    fontSize: '9px',
                                                                    color: new Date(course.expiryDate) < new Date() ? BRAND.warning : BRAND.success,
                                                                    fontWeight: '600',
                                                                    marginTop: '2px'
                                                                }}>
                                                                    {new Date(course.expiryDate) < new Date() ?
                                                                        `❌ Expired ${new Date(course.expiryDate).toLocaleDateString('en-IN')}` :
                                                                        `✅ Valid ${new Date(course.expiryDate).toLocaleDateString('en-IN')}`}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Check size={12} color={BRAND.success} />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '10px', color: BRAND.textMuted, margin: '4px 0' }}>No courses enrolled</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Recent Quiz Attempts */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                    <Clock size={10} color={BRAND.primary} />
                                    <h4 style={{ fontSize: '9px', fontWeight: '700', color: BRAND.primary, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Recent Quiz Attempts</h4>
                                </div>

                                <div style={{ backgroundColor: BRAND.bg, borderRadius: '6px', overflow: 'hidden' }}>
                                    {studentAttempts.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {studentAttempts.slice(0, 3).map((attempt, index) => (
                                                <div key={attempt._id || index} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '4px 6px',
                                                    borderBottom: index < Math.min(studentAttempts.length, 3) - 1 ? `1px solid ${BRAND.border}` : 'none'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: BRAND.text, fontSize: '10px' }}>{attempt.quizTitle}</div>
                                                        <div style={{ fontSize: '9px', color: BRAND.textMuted }}>{formatDate(attempt.date)}</div>
                                                    </div>
                                                    <span style={{
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
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
                                        <div style={{ padding: '8px', textAlign: 'center', color: BRAND.textMuted }}>
                                            <BookOpen size={16} style={{ margin: '0 auto 2px', opacity: 0.4, color: BRAND.primary }} />
                                            <p style={{ margin: 0, fontSize: '10px' }}>No quiz attempts yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Only Close Button */}
                        <div style={{
                            padding: '8px 16px',
                            borderTop: `1px solid ${BRAND.border}`,
                            backgroundColor: BRAND.bg,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                style={{
                                    padding: '8px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: BRAND.primary,
                                    color: '#ffffff',
                                    fontSize: '12px',
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
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                            animation: 'modalFadeIn 0.2s ease-out',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            backgroundColor: BRAND.success,
                            padding: '24px',
                            position: 'relative',
                            flexShrink: 0
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
                        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
                            {/* Multi-Course Selection with Checkboxes */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: BRAND.textSecondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Select Course(s) *
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCourseIds(availableCourses.map(c => c._id || c.id))}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: BRAND.primary,
                                                background: 'transparent',
                                                border: `1px solid ${BRAND.primary}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCourseIds([])}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: BRAND.textMuted,
                                                background: 'transparent',
                                                border: `1px solid ${BRAND.border}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    padding: '6px',
                                    backgroundColor: BRAND.bg,
                                    borderRadius: '8px',
                                    border: `1px solid ${selectedCourseIds.length > 0 ? BRAND.success : BRAND.border}`
                                }}>
                                    {availableCourses.length === 0 ? (
                                        <p style={{ fontSize: '12px', color: BRAND.textMuted, padding: '10px', textAlign: 'center' }}>
                                            No courses available. Please add courses first.
                                        </p>
                                    ) : (
                                        <>
                                            {/* All Courses Option - Only for non-enrolled courses */}
                                            {(() => {
                                                const nonEnrolledCourses = availableCourses.filter(course => {
                                                    const courseId = course._id || course.id;
                                                    return !selectedStudent?.enrollment?.courses?.some(c => c.courseId === courseId);
                                                });
                                                const allSelected = nonEnrolledCourses.length > 0 &&
                                                    nonEnrolledCourses.every(c => selectedCourseIds.includes(c._id || c.id));

                                                return nonEnrolledCourses.length > 0 ? (
                                                    <label
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '8px 10px',
                                                            backgroundColor: allSelected ? BRAND.primaryLight : BRAND.card,
                                                            borderRadius: '6px',
                                                            border: `1px solid ${allSelected ? BRAND.primary : BRAND.border}`,
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            marginBottom: '4px'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={() => {
                                                                if (allSelected) {
                                                                    setSelectedCourseIds([]);
                                                                } else {
                                                                    setSelectedCourseIds(nonEnrolledCourses.map(c => c._id || c.id));
                                                                }
                                                            }}
                                                            style={{ width: '14px', height: '14px', accentColor: BRAND.primary }}
                                                        />
                                                        <span style={{ fontSize: '11px', color: BRAND.primary }}>📚 Select All ({nonEnrolledCourses.length} available)</span>
                                                    </label>
                                                ) : null;
                                            })()}

                                            {/* Show ALL courses - enrolled ones are disabled */}
                                            {availableCourses.map(course => {
                                                const courseId = course._id || course.id;
                                                const isEnrolled = selectedStudent?.enrollment?.courses?.some(
                                                    c => c.courseId === courseId
                                                );
                                                const isSelected = selectedCourseIds.includes(courseId);

                                                return (
                                                    <label
                                                        key={courseId}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '8px 10px',
                                                            backgroundColor: isEnrolled ? '#f3f4f6' : (isSelected ? BRAND.successLight : BRAND.card),
                                                            borderRadius: '6px',
                                                            border: `1px solid ${isEnrolled ? '#d1d5db' : (isSelected ? BRAND.success : BRAND.border)}`,
                                                            cursor: isEnrolled ? 'not-allowed' : 'pointer',
                                                            transition: 'all 0.2s',
                                                            opacity: isEnrolled ? 0.7 : 1
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isEnrolled || isSelected}
                                                            disabled={isEnrolled}
                                                            onChange={() => !isEnrolled && toggleCourseSelection(courseId)}
                                                            style={{
                                                                width: '14px',
                                                                height: '14px',
                                                                cursor: isEnrolled ? 'not-allowed' : 'pointer',
                                                                accentColor: isEnrolled ? '#9ca3af' : BRAND.success
                                                            }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                color: isEnrolled ? '#9ca3af' : BRAND.text,
                                                                textDecoration: isEnrolled ? 'none' : 'none'
                                                            }}>
                                                                {course.name}
                                                            </div>
                                                            {isEnrolled && (
                                                                <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '500' }}>
                                                                    ✓ Already enrolled
                                                                </div>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>

                                {selectedCourseIds.length > 0 && (
                                    <p style={{
                                        fontSize: '11px',
                                        color: BRAND.success,
                                        marginTop: '6px',
                                        fontWeight: '600'
                                    }}>
                                        ✓ {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Batch Selection - Multi-select with Checkboxes */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: BRAND.textSecondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Select Batch(es) *
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allBatches = ['All Batches', ...Array.from(new Set(availableCourses.flatMap(c => c.batches || [c.batchName || 'Main Batch']))).filter(b => b)];
                                                setSelectedBatches(allBatches);
                                            }}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: BRAND.primary,
                                                background: 'transparent',
                                                border: `1px solid ${BRAND.primary}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedBatches([])}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: BRAND.textMuted,
                                                background: 'transparent',
                                                border: `1px solid ${BRAND.border}`,
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    padding: '6px',
                                    backgroundColor: BRAND.bg,
                                    borderRadius: '8px',
                                    border: `1px solid ${selectedBatches.length > 0 ? BRAND.success : BRAND.border}`
                                }}>
                                    {/* All Batches Option */}
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 10px',
                                            backgroundColor: selectedBatches.includes('All Batches') ? BRAND.primaryLight : BRAND.card,
                                            borderRadius: '6px',
                                            border: `1px solid ${selectedBatches.includes('All Batches') ? BRAND.primary : BRAND.border}`,
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedBatches.includes('All Batches')}
                                            onChange={() => toggleBatchSelection('All Batches')}
                                            style={{ width: '14px', height: '14px', accentColor: BRAND.primary }}
                                        />
                                        <span style={{ fontSize: '12px', color: BRAND.primary }}>📚 All Batches (Full Access)</span>
                                    </label>

                                    {/* Individual Batches */}
                                    {Array.from(new Set(availableCourses.flatMap(c => c.batches || [c.batchName || 'Main Batch']))).filter(b => b).map(batch => (
                                        <label
                                            key={batch}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 10px',
                                                backgroundColor: selectedBatches.includes(batch) ? BRAND.successLight : BRAND.card,
                                                borderRadius: '6px',
                                                border: `1px solid ${selectedBatches.includes(batch) ? BRAND.success : BRAND.border}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedBatches.includes(batch)}
                                                onChange={() => toggleBatchSelection(batch)}
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    cursor: 'pointer',
                                                    accentColor: BRAND.success
                                                }}
                                            />
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: BRAND.text }}>
                                                {batch}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {selectedBatches.length > 0 && (
                                    <p style={{
                                        fontSize: '11px',
                                        color: BRAND.success,
                                        marginTop: '6px',
                                        fontWeight: '600'
                                    }}>
                                        ✓ {selectedBatches.length} batch{selectedBatches.length !== 1 ? 'es' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Duration Selection */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: BRAND.textSecondary,
                                    marginBottom: '6px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Course Access Duration *
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="number"
                                        value={courseDuration}
                                        onChange={(e) => setCourseDuration(e.target.value)}
                                        placeholder="Enter duration"
                                        min="1"
                                        style={{
                                            flex: 1,
                                            padding: '14px 16px',
                                            borderRadius: '10px',
                                            border: `2px solid ${courseDuration ? BRAND.success : BRAND.border}`,
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: BRAND.text,
                                            backgroundColor: BRAND.card,
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                    <select
                                        value={durationType}
                                        onChange={(e) => setDurationType(e.target.value)}
                                        style={{
                                            width: '130px',
                                            padding: '14px 16px',
                                            borderRadius: '10px',
                                            border: `2px solid ${BRAND.border}`,
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: BRAND.text,
                                            backgroundColor: BRAND.card,
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="days">Days</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                                {courseDuration && (
                                    <p style={{
                                        fontSize: '12px',
                                        color: BRAND.success,
                                        marginTop: '8px',
                                        fontWeight: '500'
                                    }}>
                                        📅 Access will expire on {new Date(new Date().setMonth(
                                            durationType === 'months'
                                                ? new Date().getMonth() + parseInt(courseDuration || 0)
                                                : new Date().getMonth()
                                        ) + (durationType === 'days' ? parseInt(courseDuration || 0) * 24 * 60 * 60 * 1000 : 0)).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>

                            {/* Summary */}
                            {selectedCourseIds.length > 0 && selectedBatches.length > 0 && courseDuration && (
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
                                        <strong>{selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''}</strong> with{' '}
                                        <strong>{selectedBatches.length} batch{selectedBatches.length !== 1 ? 'es' : ''}</strong>
                                        <br />
                                        {selectedCourseIds.length <= 3 && (
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted, display: 'block', marginTop: '6px' }}>
                                                📚 {selectedCourseIds.map(id => availableCourses.find(c => (c._id || c.id) === id)?.name).join(', ')}
                                            </span>
                                        )}
                                        {selectedBatches.length <= 3 && (
                                            <span style={{ fontSize: '12px', color: BRAND.textMuted, display: 'block', marginTop: '4px' }}>
                                                🎯 {selectedBatches.join(', ')}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '12px', color: BRAND.success, fontWeight: '600', display: 'block', marginTop: '6px' }}>
                                            ⏱️ Access: {courseDuration} {durationType}
                                        </span>
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
                            justifyContent: 'flex-end',
                            flexShrink: 0
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
                                disabled={selectedCourseIds.length === 0 || selectedBatches.length === 0 || !courseDuration || savingEnrollment}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: (selectedCourseIds.length === 0 || selectedBatches.length === 0 || !courseDuration) ? BRAND.border : BRAND.success,
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: (selectedCourseIds.length === 0 || selectedBatches.length === 0 || !courseDuration) ? 'not-allowed' : 'pointer',
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
