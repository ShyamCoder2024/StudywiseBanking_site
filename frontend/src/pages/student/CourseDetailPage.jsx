import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, BookOpen, Clock, CheckCircle, X, Play, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import './CourseDetailPage.css';

// Skeleton components for instant loading feedback
const DetailSkeleton = () => (
    <div className="cdp">
        <div className="cdp-header">
            <button className="cdp-back" disabled>
                <ArrowLeft size={16} />
                <span>Back</span>
            </button>
        </div>
        <div className="cdp-grid">
            <div className="cdp-left">
                <div className="cdp-thumb skeleton-shine" style={{ aspectRatio: '16/9' }} />
                <div className="cdp-info">
                    <div className="skeleton-line skeleton-short skeleton-shine" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
                    <div className="skeleton-line skeleton-full skeleton-shine" style={{ height: '28px', marginTop: '12px' }} />
                    <div className="skeleton-line skeleton-medium skeleton-shine" style={{ height: '16px', marginTop: '8px' }} />
                </div>
            </div>
            <div className="cdp-right">
                <div className="cdp-lectures-card">
                    <div className="cdp-lectures-header">
                        <BookOpen size={16} />
                        <span>Lectures</span>
                    </div>
                    <div className="cdp-lectures-list">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="cdp-lec" style={{ opacity: 0.5 }}>
                                <div className="cdp-lec-num skeleton-shine" />
                                <div className="cdp-lec-content">
                                    <div className="skeleton-line skeleton-full skeleton-shine" style={{ height: '14px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

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

    // OPTIMIZED: Show skeleton instead of animated spinner
    if (loading) {
        return <DetailSkeleton />;
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Thumbnail */}
                    <div className="cdp-thumb">
                        {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} loading="eager" />
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
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                >
                    <div className="cdp-lectures-card">
                        <div className="cdp-lectures-header">
                            <BookOpen size={16} />
                            <span>Lectures</span>
                            <span className="cdp-count">({course.lectureCount})</span>
                        </div>

                        {/* OPTIMIZED: No animation delays on lecture items */}
                        <div className="cdp-lectures-list">
                            {course.lectures?.map((lec) => (
                                <div
                                    key={lec._id}
                                    className={`cdp-lec ${lec.isLocked ? 'locked' : ''}`}
                                    onClick={() => handleLectureClick(lec)}
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
                                    <div className="cdp-lec-icon">
                                        {lec.isLocked ? <Lock size={12} /> : <Play size={12} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Enroll Modal - OPTIMIZED: Faster animations */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div
                        className="cdp-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setShowEnrollModal(false)}
                    >
                        <motion.div
                            className="cdp-modal"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
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
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
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

