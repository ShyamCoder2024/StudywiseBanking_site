import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, BookOpen, Clock, CheckCircle, X, Play, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import './CourseDetailPage.css';

export function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => { fetchCourse(); }, [courseId]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/student/video-courses/${courseId}`);
            setCourse(res.data.data);
        } catch (err) {
            console.error('Failed to fetch course:', err);
        } finally { setLoading(false); }
    };

    const handleLectureClick = (lecture) => {
        if (lecture.isLocked) setShowEnrollModal(true);
        else if (lecture.youtubeLink) window.open(lecture.youtubeLink, '_blank');
    };

    if (loading) {
        return (
            <div className="cdp">
                <div className="cdp-loader">
                    <motion.div
                        className="cdp-spin"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="cdp">
                <div className="cdp-loader">
                    <p>Course not found</p>
                    <Link to="/courses" className="cdp-link">← Back to Courses</Link>
                </div>
            </div>
        );
    }

    const descLimit = 120;
    const hasLongDesc = course.description && course.description.length > descLimit;
    const displayDesc = expanded ? course.description : (course.description?.substring(0, descLimit) || '');

    return (
        <div className="cdp">
            {/* Back Button */}
            <motion.div
                className="cdp-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <button className="cdp-back" onClick={() => navigate('/courses')}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </motion.div>

            {/* Two Column Layout */}
            <div className="cdp-grid">
                {/* LEFT: Thumbnail + Description */}
                <motion.div
                    className="cdp-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* Thumbnail */}
                    <div className="cdp-thumb">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} />
                        ) : (
                            <div className="cdp-thumb-empty"><BookOpen size={40} /></div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="cdp-info">
                        <span className="cdp-badge">{course.subject}</span>
                        <h1>{course.title}</h1>
                        <p className="cdp-meta">{course.batchName} • {course.lectureCount} Lectures</p>

                        {/* Description with YouTube-style "more" */}
                        {course.description && (
                            <div className="cdp-desc">
                                <p>
                                    {displayDesc}
                                    {hasLongDesc && !expanded && (
                                        <button className="cdp-more" onClick={() => setExpanded(true)}>
                                            ...more
                                        </button>
                                    )}
                                </p>
                                {hasLongDesc && expanded && (
                                    <button className="cdp-less" onClick={() => setExpanded(false)}>
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Enroll Button - Show only if NOT enrolled in THIS specific course */}
                        {!course.isEnrolled && (
                            <motion.button
                                className="cdp-enroll"
                                onClick={() => setShowEnrollModal(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Lock size={14} />
                                Enroll to Unlock All Lectures
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* RIGHT: Lectures */}
                <motion.div
                    className="cdp-right"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="cdp-lectures-card">
                        <div className="cdp-lectures-header">
                            <BookOpen size={16} />
                            <span>Lectures</span>
                            <span className="cdp-count">({course.lectureCount})</span>
                        </div>

                        <div className="cdp-lectures-list">
                            {course.lectures?.map((lec, i) => (
                                <motion.div
                                    key={lec._id}
                                    className={`cdp-lec ${lec.isLocked ? 'locked' : ''}`}
                                    onClick={() => handleLectureClick(lec)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    whileHover={{ backgroundColor: 'var(--color-bg)' }}
                                >
                                    <div className="cdp-lec-num">
                                        {lec.isLocked ? <Lock size={12} /> : String(lec.lectureNumber).padStart(2, '0')}
                                    </div>
                                    <div className="cdp-lec-content">
                                        <span className="cdp-lec-title">{lec.title}</span>
                                        {lec.duration && (
                                            <span className="cdp-lec-dur"><Clock size={10} /> {lec.duration}</span>
                                        )}
                                    </div>
                                    <motion.div
                                        className="cdp-lec-icon"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {lec.isLocked ? <Lock size={12} /> : <Play size={12} />}
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Enroll Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div
                        className="cdp-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEnrollModal(false)}
                    >
                        <motion.div
                            className="cdp-modal"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="cdp-modal-close" onClick={() => setShowEnrollModal(false)}>
                                <X size={16} />
                            </button>
                            <div className="cdp-modal-icon"><Lock size={28} /></div>
                            <h3>Enroll to Access</h3>
                            <p>Unlock all {course.lectureCount} video lectures with lifetime access.</p>
                            <div className="cdp-modal-features">
                                <div><CheckCircle size={14} /> Full course access</div>
                                <div><CheckCircle size={14} /> Private YouTube videos</div>
                                <div><CheckCircle size={14} /> Lifetime access</div>
                            </div>
                            <motion.button
                                className="cdp-modal-btn"
                                onClick={() => {
                                    const message = encodeURIComponent(`Hi! I'm interested in enrolling in the course: ${course.title}. Please provide details about enrollment.`);
                                    const whatsappUrl = `https://wa.me/919518329260?text=${message}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                📱 Contact on WhatsApp to Enroll
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CourseDetailPage;
