import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Lock, BookOpen, Clock, CheckCircle, X, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import './CourseDetailPage.css';

export function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/student/video-courses/${courseId}`);
            setCourse(res.data.data);
        } catch (err) {
            console.error('Failed to fetch course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLectureClick = (lecture) => {
        if (lecture.isLocked) {
            setShowEnrollModal(true);
        } else if (lecture.youtubeLink) {
            window.open(lecture.youtubeLink, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="course-detail-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-page">
                <div className="error-container">
                    <h2>Course not found</h2>
                    <Link to="/courses" className="back-link">← Back to Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            {/* Header */}
            <motion.div
                className="course-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button className="back-btn" onClick={() => navigate('/courses')}>
                    <ArrowLeft size={18} />
                    <span>Back to Courses</span>
                </button>
            </motion.div>

            {/* Course Thumbnail - Properly contained */}
            <motion.div
                className="course-banner"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="banner-image" />
                ) : (
                    <div className="banner-placeholder">
                        <BookOpen size={48} />
                    </div>
                )}
            </motion.div>

            {/* Course Info - Below thumbnail, not overlayed */}
            <motion.div
                className="course-info-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <span className="course-badge">{course.subject}</span>
                <h1 className="course-title">{course.title}</h1>
                <p className="course-meta">{course.batchName} • {course.lectureCount} Lectures</p>
                {course.description && (
                    <p className="course-description">{course.description}</p>
                )}
                {!course.isPaid && (
                    <div className="enrollment-badge">
                        <Lock size={14} />
                        <span>Enroll to unlock all lectures</span>
                    </div>
                )}
            </motion.div>

            {/* Lectures List - Compact */}
            <motion.div
                className="lectures-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="section-title">
                    <BookOpen size={18} />
                    Course Lectures
                </h2>

                <div className="lectures-list">
                    {course.lectures && course.lectures.length > 0 ? (
                        course.lectures.map((lecture, index) => (
                            <motion.div
                                key={lecture._id}
                                className={`lecture-item ${lecture.isLocked ? 'locked' : 'unlocked'}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.03 }}
                                onClick={() => handleLectureClick(lecture)}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="lecture-number">
                                    {lecture.isLocked ? (
                                        <Lock size={14} />
                                    ) : (
                                        <span>{String(lecture.lectureNumber).padStart(2, '0')}</span>
                                    )}
                                </div>
                                <div className="lecture-info">
                                    <h3 className="lecture-title">{lecture.title}</h3>
                                    {lecture.duration && (
                                        <span className="lecture-duration">
                                            <Clock size={10} />
                                            {lecture.duration}
                                        </span>
                                    )}
                                </div>
                                <div className="lecture-action">
                                    {lecture.isLocked ? (
                                        <div className="locked-icon">
                                            <Lock size={14} />
                                        </div>
                                    ) : (
                                        <div className="play-icon">
                                            <ExternalLink size={14} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-lectures">
                            <BookOpen size={40} />
                            <p>No lectures available yet</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Enrollment Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEnrollModal(false)}
                    >
                        <motion.div
                            className="enroll-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="close-btn" onClick={() => setShowEnrollModal(false)}>
                                <X size={18} />
                            </button>

                            <div className="modal-icon">
                                <Lock size={32} />
                            </div>

                            <h2>Enroll to Access</h2>
                            <p>This lecture is part of a premium course. Enroll now to unlock all video lectures.</p>

                            <div className="modal-features">
                                <div className="feature">
                                    <CheckCircle size={16} />
                                    <span>Access all {course.lectureCount} lectures</span>
                                </div>
                                <div className="feature">
                                    <CheckCircle size={16} />
                                    <span>Private YouTube videos</span>
                                </div>
                                <div className="feature">
                                    <CheckCircle size={16} />
                                    <span>Lifetime access</span>
                                </div>
                            </div>

                            <button className="enroll-btn" onClick={() => navigate('/about')}>
                                Contact to Enroll
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CourseDetailPage;
