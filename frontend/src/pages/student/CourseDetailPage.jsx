import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, BookOpen, Clock, CheckCircle, X, Play } from 'lucide-react';
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
            <div className="cdp">
                <div className="cdp-loading">
                    <div className="cdp-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="cdp">
                <div className="cdp-loading">
                    <p>Course not found</p>
                    <Link to="/courses">← Back</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cdp">
            {/* Back Button */}
            <div className="cdp-nav">
                <button onClick={() => navigate('/courses')}>
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            {/* Course Card */}
            <div className="cdp-card">
                {/* Thumbnail */}
                {course.thumbnail && (
                    <div className="cdp-thumb">
                        <img src={course.thumbnail} alt={course.title} />
                    </div>
                )}

                {/* Info */}
                <div className="cdp-info">
                    <span className="cdp-badge">{course.subject}</span>
                    <h1>{course.title}</h1>
                    <p className="cdp-meta">{course.batchName} • {course.lectureCount} Lectures</p>

                    {course.description && (
                        <p className="cdp-desc">
                            {course.description.length > 150
                                ? course.description.substring(0, 150) + '...'
                                : course.description}
                        </p>
                    )}

                    {!course.isPaid && (
                        <button className="cdp-enroll" onClick={() => setShowEnrollModal(true)}>
                            <Lock size={14} /> Enroll to Unlock
                        </button>
                    )}
                </div>
            </div>

            {/* Lectures */}
            <div className="cdp-lectures">
                <h2><BookOpen size={16} /> Lectures ({course.lectureCount})</h2>

                <div className="cdp-list">
                    {course.lectures?.map((lec, i) => (
                        <div
                            key={lec._id}
                            className={`cdp-lec ${lec.isLocked ? 'locked' : ''}`}
                            onClick={() => handleLectureClick(lec)}
                        >
                            <div className="cdp-lec-num">
                                {lec.isLocked ? <Lock size={12} /> : String(lec.lectureNumber).padStart(2, '0')}
                            </div>
                            <div className="cdp-lec-info">
                                <span>{lec.title}</span>
                                {lec.duration && <small><Clock size={10} /> {lec.duration}</small>}
                            </div>
                            <div className="cdp-lec-icon">
                                {lec.isLocked ? <Lock size={12} /> : <Play size={12} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div className="cdp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEnrollModal(false)}>
                        <motion.div className="cdp-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <button className="cdp-close" onClick={() => setShowEnrollModal(false)}><X size={16} /></button>
                            <Lock size={28} />
                            <h3>Enroll to Access</h3>
                            <p>Contact the tutor to unlock all {course.lectureCount} lectures.</p>
                            <button className="cdp-modal-btn" onClick={() => navigate('/about')}>Contact Tutor</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CourseDetailPage;
