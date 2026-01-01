import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, BookOpen, Users, ArrowRight, Star, Award, Video, Play
} from 'lucide-react';
import api from '../../services/api';
import './CoursesPage.css';

// Skeleton component for instant loading feedback
const CourseSkeleton = () => (
    <div className="course-card course-skeleton">
        <div className="course-thumbnail skeleton-shine" />
        <div className="course-card-content">
            <div className="skeleton-line skeleton-short skeleton-shine" />
            <div className="skeleton-line skeleton-full skeleton-shine" />
            <div className="skeleton-line skeleton-medium skeleton-shine" />
        </div>
    </div>
);

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async (retryCount = 0) => {
        try {
            setHasError(false);
            const res = await api.get('/student/video-courses');
            if (res.data?.data) {
                // DEBUG: Log thumbnail data to understand the issue
                console.log('=== COURSE DATA RECEIVED ===');
                res.data.data.forEach((c, i) => {
                    console.log(`Course ${i + 1} (${c.title}): thumbnail = ${c.thumbnail ? 'YES (length: ' + c.thumbnail.length + ')' : 'NO'}`);
                });
                setCourses(res.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            // OPTIMIZED: Faster retry with 300ms delay
            if (retryCount < 2) {
                setTimeout(() => fetchCourses(retryCount + 1), 300);
                return;
            }
            setHasError(true);
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    // OPTIMIZED: Simple fade animation - no stagger delays
    const fadeIn = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } }
    };

    // Show skeleton immediately while loading
    if (loading) {
        return (
            <div className="courses-page">
                <div className="courses-container">
                    {/* Header - always visible */}
                    <div className="courses-header">
                        <div className="courses-header-content">
                            <h1>
                                <Video size={32} className="header-icon" />
                                Video Courses
                            </h1>
                            <p>Access premium video lectures from our expert tutor</p>
                        </div>
                    </div>

                    {/* Stats Bar Skeleton */}
                    <div className="courses-stats">
                        <div className="stat-item">
                            <BookOpen size={20} />
                            <span>Loading...</span>
                        </div>
                    </div>

                    {/* Course Skeletons - instant feedback */}
                    <div className="courses-grid">
                        <CourseSkeleton />
                        <CourseSkeleton />
                        <CourseSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-page">
            <div className="courses-container">
                {/* Header */}
                <motion.div className="courses-header" {...fadeIn}>
                    <div className="courses-header-content">
                        <h1>
                            <Video size={32} className="header-icon" />
                            Video Courses
                        </h1>
                        <p>Access premium video lectures from our expert tutor</p>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div className="courses-stats" {...fadeIn}>
                    <div className="stat-item">
                        <BookOpen size={20} />
                        <span>{courses.length} Courses</span>
                    </div>
                    <div className="stat-item">
                        <Users size={20} />
                        <span>500+ Students</span>
                    </div>
                    <div className="stat-item">
                        <Award size={20} />
                        <span>Private YouTube</span>
                    </div>
                </motion.div>

                {/* Courses Grid - NO stagger, instant render */}
                <motion.div className="courses-grid" {...fadeIn}>
                    {courses.map((course) => (
                        <motion.div
                            key={course._id}
                            className="course-card video-course"
                            onClick={() => handleCourseClick(course._id)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            {/* Thumbnail */}
                            <div className="course-thumbnail">
                                {/* DEBUG: Show thumbnail URL preview */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    background: course.thumbnail ? 'green' : 'red',
                                    color: 'white',
                                    padding: '2px 6px',
                                    fontSize: '8px',
                                    zIndex: 100,
                                    maxWidth: '180px',
                                    overflow: 'hidden'
                                }}>
                                    {course.thumbnail ? `${course.thumbnail.substring(0, 25)}...` : 'NO THUMB'}
                                </div>

                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        loading="eager"
                                        onError={(e) => {
                                            console.error('IMG LOAD FAILED:', course.title);
                                            // Show placeholder on error
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="thumbnail-placeholder">
                                        <Video size={48} />
                                    </div>
                                )}
                                <div className="thumbnail-overlay">
                                    <div className="play-button">
                                        <Play size={24} fill="white" />
                                    </div>
                                </div>
                                <div className="lecture-count">
                                    <BookOpen size={14} />
                                    {course.lectureCount} Lectures
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="course-card-content">
                                {/* Top Row: Subject + Status Badge */}
                                <div className="course-top-row">
                                    <span className="course-subject">{course.subject}</span>
                                    {course.status && (
                                        <span className={`course-status-badge status-${course.status}`}>
                                            {course.status === 'complete' && '✓ Complete'}
                                            {course.status === 'ongoing' && '🔴 Ongoing'}
                                            {course.status === 'upcoming' && '🔜 Upcoming'}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3>{course.title}</h3>
                                <p className="course-batch">{course.batchName}</p>

                                {/* Pricing Row */}
                                {(course.pricing?.originalPrice > 0 || course.pricing?.currentPrice > 0) && (
                                    <div className="course-pricing-row">
                                        <div className="price-info">
                                            {course.pricing.originalPrice > course.pricing.currentPrice && (
                                                <span className="original-price">₹{course.pricing.originalPrice}</span>
                                            )}
                                            <span className="current-price">₹{course.pricing.currentPrice}</span>
                                        </div>

                                        {/* Discount & Price Drop Badges */}
                                        <div className="price-badges">
                                            {course.pricing?.discountPercent > 0 && (
                                                <span className="discount-badge">{course.pricing.discountPercent}% OFF</span>
                                            )}
                                            {course.pricing?.showPriceDrop && course.pricing?.discountPercent > 0 && (
                                                <span className="price-drop-badge">🔥 Deal</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Decorative Elements */}
                            <div className="card-glow" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {courses.length === 0 && !hasError && (
                    <div className="courses-empty">
                        <Video size={48} />
                        <h3>No courses available yet</h3>
                        <p>Check back soon for new video courses!</p>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="courses-empty">
                        <Video size={48} />
                        <h3>Unable to load courses</h3>
                        <p>Please check your connection and try again.</p>
                        <button className="retry-btn" onClick={() => { setLoading(true); fetchCourses(); }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Compact Enrollment CTA Card */}
                {courses.length > 0 && (
                    <motion.div className="enroll-cta-card" {...fadeIn}>
                        {/* Floating Circles */}
                        <div className="enroll-bg-elements">
                            <div className="floating-circle c1" />
                            <div className="floating-circle c2" />
                        </div>

                        {/* Content Row */}
                        <div className="enroll-row">
                            <div className="enroll-left">
                                <GraduationCap size={24} className="enroll-icon-small" />
                                <div className="enroll-text-compact">
                                    <h3>Ready to Enroll?</h3>
                                    <p>Get full course access via WhatsApp</p>
                                </div>
                            </div>

                            {/* WhatsApp CTA Button */}
                            <motion.a
                                href="https://wa.me/919518329260?text=Hi%20Sir%2C%20I%20want%20to%20enroll%20in%20your%20course"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-btn"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>Chat on WhatsApp</span>
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
