import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, BookOpen, Clock, CheckCircle, X, Play, Users, Award } from 'lucide-react';
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
                    <p>Loading course...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="cdp">
                <div className="cdp-loading">
                    <h2>Course not found</h2>
                    <Link to="/courses" className="cdp-back-link">← Back to Courses</Link>
                </div>
            </div>
        );
    }

    // Truncate long description for display
    const shortDesc = course.description && course.description.length > 200
        ? course.description.substring(0, 200) + '...'
        : course.description;

    return (
        <div className="cdp">
            {/* Hero Section with Thumbnail */}
            <div className="cdp-hero">
                <div className="cdp-hero-bg">
                    {course.thumbnail && <img src={course.thumbnail} alt="" className="cdp-hero-bg-img" />}
                </div>
                <div className="cdp-hero-overlay"></div>

                <div className="cdp-hero-content">
                    <button className="cdp-back" onClick={() => navigate('/courses')}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <div className="cdp-hero-info">
                        <span className="cdp-badge">{course.subject}</span>
                        <h1 className="cdp-title">{course.title}</h1>
                        <div className="cdp-meta">
                            <span><BookOpen size={14} />{course.batchName}</span>
                            <span><Play size={14} />{course.lectureCount} Lectures</span>
                        </div>
                        {shortDesc && <p className="cdp-desc">{shortDesc}</p>}

                        {!course.isPaid && (
                            <button className="cdp-enroll-btn" onClick={() => setShowEnrollModal(true)}>
                                <Lock size={16} />
                                Enroll to Unlock All Lectures
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lectures Section */}
            <div className="cdp-lectures">
                <div className="cdp-lectures-header">
                    <h2><BookOpen size={18} /> Course Lectures</h2>
                    <span className="cdp-lecture-count">{course.lectureCount} Videos</span>
                </div>

                <div className="cdp-lectures-grid">
                    {course.lectures && course.lectures.length > 0 ? (
                        course.lectures.map((lecture, index) => (
                            <motion.div
                                key={lecture._id}
                                className={`cdp-lecture ${lecture.isLocked ? 'locked' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.03 * index }}
                                onClick={() => handleLectureClick(lecture)}
                            >
                                <div className="cdp-lecture-num">
                                    {lecture.isLocked ? <Lock size={14} /> : String(lecture.lectureNumber).padStart(2, '0')}
                                </div>
                                <div className="cdp-lecture-info">
                                    <h3>{lecture.title}</h3>
                                    {lecture.duration && <span><Clock size={10} /> {lecture.duration}</span>}
                                </div>
                                <div className="cdp-lecture-icon">
                                    {lecture.isLocked ? <Lock size={14} /> : <Play size={14} />}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="cdp-no-lectures">
                            <BookOpen size={32} />
                            <p>No lectures available yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enrollment Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div
                        className="cdp-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEnrollModal(false)}
                    >
                        <motion.div
                            className="cdp-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="cdp-modal-close" onClick={() => setShowEnrollModal(false)}>
                                <X size={18} />
                            </button>

                            <div className="cdp-modal-icon"><Lock size={32} /></div>
                            <h2>Enroll to Access</h2>
                            <p>Join this premium course to unlock all {course.lectureCount} video lectures.</p>

                            <div className="cdp-modal-features">
                                <div><CheckCircle size={14} /><span>All lectures unlocked</span></div>
                                <div><CheckCircle size={14} /><span>Private YouTube videos</span></div>
                                <div><CheckCircle size={14} /><span>Lifetime access</span></div>
                            </div>

                            <button className="cdp-modal-btn" onClick={() => navigate('/about')}>
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
