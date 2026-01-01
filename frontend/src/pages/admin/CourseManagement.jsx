import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Eye, EyeOff, Video, BookOpen, X, Save, ChevronDown, ChevronUp, Link as LinkIcon, Clock, Upload, Image, DollarSign, ArrowUpDown, Tag } from 'lucide-react';
import api from '../../services/api';
import { Loader } from '../../components/ui/Loader';

// DRD Brand Colors
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

// Common Input Styles - Cross-browser text visibility fix
const INPUT_STYLES = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${BRAND.border}`,
    fontSize: '14px',
    color: '#131313',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
};

export function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showLectureModal, setShowLectureModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingLecture, setEditingLecture] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [saving, setSaving] = useState(false);

    const [courseForm, setCourseForm] = useState({
        title: '',
        thumbnail: '',
        subject: '',
        batchName: '',
        description: '',
        pricing: {
            originalPrice: 0,
            currentPrice: 0,
            showPriceDrop: false,
            priceDropLabel: '🔥 Price Drop'
        },
        status: 'ongoing',
        displayOrder: 0
    });

    const [lectureForm, setLectureForm] = useState({
        lectureNumber: 1,
        title: '',
        youtubeLink: '',
        duration: ''
    });

    useEffect(() => { fetchCourses(); }, []);

    const fileInputRef = useRef(null);

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses from /admin/manage-courses...');
            const res = await api.get('/admin/manage-courses');
            console.log('Courses response:', res.data);
            setCourses(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error.response?.data || error.message);
            setCourses([]);
        }
        finally { setLoading(false); }
    };

    // Handle image file upload - convert to Base64
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setCourseForm({ ...courseForm, thumbnail: reader.result });
        };
        reader.readAsDataURL(file);
    };

    // Course CRUD
    const openCourseModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setCourseForm({
                title: course.title,
                thumbnail: course.thumbnail || '',
                subject: course.subject,
                batchName: course.batchName,
                description: course.description || '',
                pricing: course.pricing || {
                    originalPrice: 0,
                    currentPrice: 0,
                    showPriceDrop: false,
                    priceDropLabel: '🔥 Price Drop'
                },
                status: course.status || 'ongoing',
                displayOrder: course.displayOrder || 0
            });
        } else {
            setEditingCourse(null);
            setCourseForm({
                title: '',
                thumbnail: '',
                subject: '',
                batchName: '',
                description: '',
                pricing: {
                    originalPrice: 0,
                    currentPrice: 0,
                    showPriceDrop: false,
                    priceDropLabel: '🔥 Price Drop'
                },
                status: 'ongoing',
                displayOrder: 0
            });
        }
        setShowCourseModal(true);
    };

    const saveCourse = async () => {
        if (!courseForm.title.trim() || !courseForm.subject.trim() || !courseForm.batchName.trim()) {
            alert('Please fill in title, subject, and batch name');
            return;
        }
        setSaving(true);
        try {
            if (editingCourse) {
                await api.put(`/admin/manage-courses/${editingCourse._id}`, courseForm);
            } else {
                await api.post('/admin/manage-courses', courseForm);
            }
            fetchCourses();
            setShowCourseModal(false);
        } catch (err) {
            console.error('Save course error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save course';
            alert(`Error: ${errorMsg}`);
        } finally { setSaving(false); }
    };

    const deleteCourse = async (id) => {
        if (!confirm('Delete this course and all its lectures?')) return;
        try {
            await api.delete(`/admin/manage-courses/${id}`);
            fetchCourses();
        } catch { alert('Failed to delete'); }
    };

    const togglePublish = async (course) => {
        try {
            await api.put(`/admin/manage-courses/${course._id}/publish`);
            fetchCourses();
        } catch { alert('Failed to update'); }
    };

    // Lecture CRUD
    const openLectureModal = (course, lecture = null) => {
        setSelectedCourse(course);
        if (lecture) {
            setEditingLecture(lecture);
            setLectureForm({
                lectureNumber: lecture.lectureNumber,
                title: lecture.title,
                youtubeLink: lecture.youtubeLink,
                duration: lecture.duration || ''
            });
        } else {
            setEditingLecture(null);
            const nextNum = (course.lectures?.length || 0) + 1;
            setLectureForm({ lectureNumber: nextNum, title: '', youtubeLink: '', duration: '' });
        }
        setShowLectureModal(true);
    };

    const saveLecture = async () => {
        if (!lectureForm.title.trim() || !lectureForm.youtubeLink.trim()) {
            alert('Please fill in lecture title and YouTube link');
            return;
        }
        setSaving(true);
        try {
            if (editingLecture) {
                await api.put(`/admin/manage-courses/${selectedCourse._id}/lectures/${editingLecture._id}`, lectureForm);
            } else {
                await api.post(`/admin/manage-courses/${selectedCourse._id}/lectures`, lectureForm);
            }
            fetchCourses();
            setShowLectureModal(false);
        } catch (err) {
            alert('Failed to save lecture');
        } finally { setSaving(false); }
    };

    const deleteLecture = async (courseId, lectureId) => {
        if (!confirm('Delete this lecture?')) return;
        try {
            await api.delete(`/admin/manage-courses/${courseId}/lectures/${lectureId}`);
            fetchCourses();
        } catch { alert('Failed to delete'); }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <Loader />
                </div>
            </AdminLayout>
        );
    }

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
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: BRAND.text, margin: 0 }}>Course Management</h1>
                        <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '4px' }}>Create and manage video courses with private YouTube lectures</p>
                    </div>
                    <button
                        onClick={() => openCourseModal()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: BRAND.primary, color: '#fff',
                            padding: '12px 20px', borderRadius: '10px', border: 'none',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                        }}
                    >
                        <Plus size={18} /> Add Course
                    </button>
                </div>

                {/* Course List */}
                {courses.length === 0 ? (
                    <div style={{
                        backgroundColor: BRAND.card,
                        padding: '60px',
                        borderRadius: BRAND.radius,
                        textAlign: 'center',
                        border: `1px solid ${BRAND.border}`
                    }}>
                        <Video size={48} color={BRAND.textMuted} style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: BRAND.text, margin: '0 0 8px' }}>No courses yet</h3>
                        <p style={{ color: BRAND.textMuted, margin: 0 }}>Click "Add Course" to create your first course</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {courses.map(course => (
                            <div key={course._id} style={{
                                backgroundColor: BRAND.card,
                                borderRadius: BRAND.radius,
                                border: `1px solid ${BRAND.border}`,
                                boxShadow: BRAND.shadowCard,
                                overflow: 'hidden'
                            }}>
                                {/* Course Header */}
                                <div style={{ display: 'flex', gap: '16px', padding: '20px', alignItems: 'flex-start' }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: '140px', height: '80px', borderRadius: '8px',
                                        backgroundColor: BRAND.bg, flexShrink: 0, overflow: 'hidden'
                                    }}>
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Video size={32} color={BRAND.textMuted} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: BRAND.text, margin: 0 }}>{course.title}</h3>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                                                backgroundColor: course.isPublished ? BRAND.successLight : BRAND.warningLight,
                                                color: course.isPublished ? '#0d6652' : '#991b1b'
                                            }}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: BRAND.textSecondary, margin: '4px 0' }}>
                                            {course.subject} • {course.batchName}
                                        </p>
                                        <p style={{ fontSize: '12px', color: BRAND.textMuted, margin: 0 }}>
                                            {course.lectures?.length || 0} lectures
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button onClick={() => togglePublish(course)} title={course.isPublished ? 'Unpublish' : 'Publish'}
                                            style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}>
                                            {course.isPublished ? <EyeOff size={16} color={BRAND.warning} /> : <Eye size={16} color={BRAND.success} />}
                                        </button>
                                        <button onClick={() => openCourseModal(course)} title="Edit"
                                            style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}>
                                            <Edit2 size={16} color={BRAND.primary} />
                                        </button>
                                        <button onClick={() => deleteCourse(course._id)} title="Delete"
                                            style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}>
                                            <Trash2 size={16} color={BRAND.warning} />
                                        </button>
                                        <button onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                                            style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${BRAND.primary}`, backgroundColor: BRAND.primaryLight, cursor: 'pointer' }}>
                                            {expandedCourse === course._id ? <ChevronUp size={16} color={BRAND.primary} /> : <ChevronDown size={16} color={BRAND.primary} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Lectures Panel (Expandable) */}
                                {expandedCourse === course._id && (
                                    <div style={{ borderTop: `1px solid ${BRAND.border}`, padding: '16px 20px', backgroundColor: BRAND.bg }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, margin: 0 }}>
                                                <BookOpen size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                Lectures ({course.lectures?.length || 0})
                                            </h4>
                                            <button onClick={() => openLectureModal(course)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: BRAND.primary, color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                                <Plus size={14} /> Add Lecture
                                            </button>
                                        </div>

                                        {course.lectures?.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {course.lectures.map((lecture, idx) => (
                                                    <div key={lecture._id} style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px', backgroundColor: BRAND.card, borderRadius: '8px',
                                                        border: `1px solid ${BRAND.border}`
                                                    }}>
                                                        <span style={{
                                                            width: '32px', height: '32px', borderRadius: '8px',
                                                            backgroundColor: BRAND.primaryLight, color: BRAND.primary,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '13px', fontWeight: '700'
                                                        }}>
                                                            {lecture.lectureNumber}
                                                        </span>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: '14px', fontWeight: '500', color: BRAND.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {lecture.title}
                                                            </p>
                                                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                                                {lecture.duration && (
                                                                    <span style={{ fontSize: '11px', color: BRAND.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Clock size={10} /> {lecture.duration}
                                                                    </span>
                                                                )}
                                                                <span style={{ fontSize: '11px', color: BRAND.primary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <LinkIcon size={10} /> YouTube Link
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => openLectureModal(course, lecture)}
                                                            style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}>
                                                            <Edit2 size={14} color={BRAND.textSecondary} />
                                                        </button>
                                                        <button onClick={() => deleteLecture(course._id, lecture._id)}
                                                            style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, cursor: 'pointer' }}>
                                                            <Trash2 size={14} color={BRAND.warning} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ textAlign: 'center', color: BRAND.textMuted, fontSize: '13px', padding: '20px 0' }}>
                                                No lectures added yet. Click "Add Lecture" to get started.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Course Modal */}
                {showCourseModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', overflowY: 'auto' }} onClick={() => setShowCourseModal(false)}>
                        <div style={{
                            backgroundColor: BRAND.card,
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                            margin: 'auto'
                        }} onClick={e => e.stopPropagation()}>
                            {/* Fixed Header */}
                            <div style={{ padding: '20px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: BRAND.text }}>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                                <button onClick={() => setShowCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={BRAND.textMuted} /></button>
                            </div>
                            {/* Scrollable Body */}
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '8px', display: 'block' }}>Course Thumbnail</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    {courseForm.thumbnail ? (
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '140px', border: `2px solid ${BRAND.primary}` }}>
                                                <img src={courseForm.thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <Upload size={14} /> Change Image
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCourseForm({ ...courseForm, thumbnail: '' })}
                                                    style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${BRAND.warning}`, backgroundColor: BRAND.warningLight, color: BRAND.warning, fontSize: '13px', cursor: 'pointer' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                border: `2px dashed ${BRAND.border}`,
                                                borderRadius: '12px',
                                                padding: '32px 20px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: BRAND.bg,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = BRAND.primary; e.currentTarget.style.backgroundColor = BRAND.primaryLight; }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.backgroundColor = BRAND.bg; }}
                                        >
                                            <Image size={40} color={BRAND.textMuted} style={{ marginBottom: '12px' }} />
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: BRAND.text }}>Click to upload thumbnail</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: BRAND.textMuted }}>PNG, JPG up to 2MB</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Course Title *</label>
                                    <input type="text" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g., Complete Banking Course 2025" style={{ ...INPUT_STYLES }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Subject *</label>
                                        <input type="text" value={courseForm.subject} onChange={e => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="e.g., Quantitative Aptitude" style={{ ...INPUT_STYLES }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Batch Name *</label>
                                        <input type="text" value={courseForm.batchName} onChange={e => setCourseForm({ ...courseForm, batchName: e.target.value })} placeholder="e.g., January 2025 Batch" style={{ ...INPUT_STYLES }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Description</label>
                                    <textarea
                                        value={courseForm.description}
                                        onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                                        rows={8}
                                        placeholder={`Add a detailed description of this course...\n\n• Point 1: What students will learn\n• Point 2: Topics covered\n• Point 3: Prerequisites\n• Point 4: Course benefits`}
                                        style={{
                                            ...INPUT_STYLES,
                                            resize: 'vertical',
                                            minHeight: '150px',
                                            lineHeight: '1.6',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                    />
                                    <p style={{ fontSize: '11px', color: BRAND.textMuted, marginTop: '4px' }}>
                                        Tip: Use bullet points (•) or dashes (-) for formatted lists
                                    </p>
                                </div>

                                {/* Pricing Section */}
                                <div style={{ padding: '16px', backgroundColor: BRAND.bg, borderRadius: '10px', border: `1px solid ${BRAND.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <DollarSign size={16} color={BRAND.primary} />
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>Pricing</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '500', color: BRAND.textSecondary, marginBottom: '4px', display: 'block' }}>Original Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={courseForm.pricing?.originalPrice || 0}
                                                onChange={e => setCourseForm({
                                                    ...courseForm,
                                                    pricing: { ...courseForm.pricing, originalPrice: parseInt(e.target.value) || 0 }
                                                })}
                                                placeholder="e.g., 4999"
                                                style={{ ...INPUT_STYLES, padding: '10px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '500', color: BRAND.textSecondary, marginBottom: '4px', display: 'block' }}>Current Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={courseForm.pricing?.currentPrice || 0}
                                                onChange={e => setCourseForm({
                                                    ...courseForm,
                                                    pricing: { ...courseForm.pricing, currentPrice: parseInt(e.target.value) || 0 }
                                                })}
                                                placeholder="e.g., 2999"
                                                style={{ ...INPUT_STYLES, padding: '10px' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={courseForm.pricing?.showPriceDrop || false}
                                                onChange={e => setCourseForm({
                                                    ...courseForm,
                                                    pricing: { ...courseForm.pricing, showPriceDrop: e.target.checked }
                                                })}
                                                style={{ width: '16px', height: '16px', accentColor: BRAND.primary }}
                                            />
                                            <span style={{ fontSize: '13px', color: BRAND.text }}>Show Price Drop Badge</span>
                                        </label>
                                    </div>
                                    {courseForm.pricing?.showPriceDrop && (
                                        <div style={{ marginTop: '12px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '500', color: BRAND.textSecondary, marginBottom: '4px', display: 'block' }}>Price Drop Label</label>
                                            <input
                                                type="text"
                                                value={courseForm.pricing?.priceDropLabel || '🔥 Price Drop'}
                                                onChange={e => setCourseForm({
                                                    ...courseForm,
                                                    pricing: { ...courseForm.pricing, priceDropLabel: e.target.value }
                                                })}
                                                placeholder="e.g., 🔥 Price Drop"
                                                style={{ ...INPUT_STYLES, padding: '10px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Status & Order Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>
                                            <Tag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                            Course Status
                                        </label>
                                        <select
                                            value={courseForm.status || 'ongoing'}
                                            onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}
                                            style={{ ...INPUT_STYLES, cursor: 'pointer' }}
                                        >
                                            <option value="ongoing">🔴 Ongoing</option>
                                            <option value="complete">✓ Complete</option>
                                            <option value="upcoming">🔜 Upcoming</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>
                                            <ArrowUpDown size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={courseForm.displayOrder || 0}
                                            onChange={e => setCourseForm({ ...courseForm, displayOrder: parseInt(e.target.value) || 0 })}
                                            placeholder="0 = top"
                                            style={{ ...INPUT_STYLES }}
                                        />
                                        <p style={{ fontSize: '11px', color: BRAND.textMuted, margin: '4px 0 0' }}>Lower = Higher priority</p>
                                    </div>
                                </div>
                            </div>
                            {/* Fixed Footer */}
                            <div style={{ padding: '20px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', gap: '12px', justifyContent: 'flex-end', flexShrink: 0 }}>
                                <button onClick={() => setShowCourseModal(false)} style={{ padding: '12px 20px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveCourse} disabled={saving} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: BRAND.primary, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save Course'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lecture Modal */}
                {showLectureModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }} onClick={() => setShowLectureModal(false)}>
                        <div style={{ backgroundColor: BRAND.card, borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: BRAND.text }}>{editingLecture ? 'Edit Lecture' : 'Add Lecture'}</h3>
                                <button onClick={() => setShowLectureModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color={BRAND.textMuted} /></button>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Lecture #</label>
                                        <input type="number" min="1" value={lectureForm.lectureNumber} onChange={e => setLectureForm({ ...lectureForm, lectureNumber: parseInt(e.target.value) || 1 })} style={{ ...INPUT_STYLES }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Duration (optional)</label>
                                        <input type="text" value={lectureForm.duration} onChange={e => setLectureForm({ ...lectureForm, duration: e.target.value })} placeholder="e.g., 45 mins" style={{ ...INPUT_STYLES }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>Lecture Title *</label>
                                    <input type="text" value={lectureForm.title} onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })} placeholder="e.g., Introduction to Number Series" style={{ ...INPUT_STYLES }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: BRAND.text, marginBottom: '6px', display: 'block' }}>YouTube Link *</label>
                                    <input type="text" value={lectureForm.youtubeLink} onChange={e => setLectureForm({ ...lectureForm, youtubeLink: e.target.value })} placeholder="https://youtube.com/..." style={{ ...INPUT_STYLES }} />
                                    <p style={{ fontSize: '11px', color: BRAND.textMuted, marginTop: '4px' }}>Paste the private YouTube video URL</p>
                                </div>
                            </div>
                            <div style={{ padding: '20px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowLectureModal(false)} style={{ padding: '12px 20px', borderRadius: '8px', border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.card, color: BRAND.text, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveLecture} disabled={saving} style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', backgroundColor: BRAND.primary, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={16} /> {saving ? 'Saving...' : 'Save Lecture'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default CourseManagement;
