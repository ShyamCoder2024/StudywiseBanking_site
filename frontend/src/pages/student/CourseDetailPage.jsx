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
    const [showFullDesc, setShowFullDesc] = useState(false);

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

    if (loading) return <div className="cdp"><div className="cdp-loader"><div className="cdp-spin"></div></div></div>;
    if (!course) return <div className="cdp"><div className="cdp-loader"><p>Course not found</p><Link to="/courses">← Back</Link></div></div>;

    const descLimit = 150;
    const hasLongDesc = course.description && course.description.length > descLimit;
    const displayDesc = showFullDesc ? course.description : (course.description?.substring(0, descLimit) || '');

    return (
        <div className="cdp">
            {/* Back Button - Floating */}
            <button className="cdp-back" onClick={() => navigate('/courses')}>
                <ArrowLeft size={16} /> Back
            </button>

            {/* THUMBNAIL - Full Width, No Padding */}
            <div className="cdp-thumbnail">
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} />
                ) : (
                    <div className="cdp-thumb-placeholder"><BookOpen size={48} /></div>
                )}
            </div>

            {/* TWO COLUMN LAYOUT */}
            <div className="cdp-content">
                {/* LEFT - Course Info & Description */}
                <div className="cdp-left">
                    <span className="cdp-badge">{course.subject}</span>
                    <h1>{course.title}</h1>
                    <p className="cdp-meta">{course.batchName} • {course.lectureCount} Lectures</p>

                    {course.description && (
                        <div className="cdp-desc">
                            <p>{displayDesc}{hasLongDesc && !showFullDesc && '...'}</p>
                            {hasLongDesc && (
                                <button className="cdp-more" onClick={() => setShowFullDesc(!showFullDesc)}>
                                    {showFullDesc ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Read More</>}
                                </button>
                            )}
                        </div>
                    )}

                    {!course.isPaid && (
                        <button className="cdp-enroll" onClick={() => setShowEnrollModal(true)}>
                            <Lock size={14} /> Enroll to Unlock All Lectures
                        </button>
                    )}
                </div>

                {/* RIGHT - Lectures */}
                <div className="cdp-right">
                    <h2><BookOpen size={16} /> Lectures <span>({course.lectureCount})</span></h2>
                    <div className="cdp-lectures">
                        {course.lectures?.map((lec) => (
                            <div key={lec._id} className={`cdp-lec ${lec.isLocked ? 'locked' : ''}`} onClick={() => handleLectureClick(lec)}>
                                <div className="cdp-lec-num">{lec.isLocked ? <Lock size={12} /> : String(lec.lectureNumber).padStart(2, '0')}</div>
                                <div className="cdp-lec-info">
                                    <span>{lec.title}</span>
                                    {lec.duration && <small><Clock size={10} /> {lec.duration}</small>}
                                </div>
                                <div className="cdp-lec-icon">{lec.isLocked ? <Lock size={12} /> : <Play size={12} />}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <motion.div className="cdp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEnrollModal(false)}>
                        <motion.div className="cdp-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <button className="cdp-close" onClick={() => setShowEnrollModal(false)}><X size={16} /></button>
                            <div className="cdp-modal-icon"><Lock size={28} /></div>
                            <h3>Enroll to Access</h3>
                            <p>Contact the tutor to unlock all {course.lectureCount} video lectures.</p>
                            <button className="cdp-modal-btn" onClick={() => navigate('/about')}>Contact Tutor</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CourseDetailPage;
