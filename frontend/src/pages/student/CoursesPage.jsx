import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, BookOpen, Users, ArrowRight, Star, Award, Video, Play
} from 'lucide-react';
import api from '../../services/api';
import './CoursesPage.css';

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/student/video-courses');
            setCourses(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="courses-page">
                <div className="courses-loading">
                    <div className="spinner" />
                    <p>Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="courses-page">
            <div className="courses-container">
                {/* Header */}
                <motion.div
                    className="courses-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="courses-header-content">
                        <h1>
                            <Video size={32} className="header-icon" />
                            Video Courses
                        </h1>
                        <p>Access premium video lectures from our expert tutor</p>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    className="courses-stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
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

                {/* Courses Grid */}
                <motion.div
                    className="courses-grid"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {courses.map((course, index) => (
                        <motion.div
                            key={course._id}
                            className="course-card video-course"
                            variants={item}
                            onClick={() => handleCourseClick(course._id)}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Thumbnail */}
                            <div className="course-thumbnail">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} />
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
                                <span className="course-subject">{course.subject}</span>
                                <h3>{course.title}</h3>
                                <p className="course-batch">{course.batchName}</p>
                                {course.description && (
                                    <p className="course-desc">{course.description}</p>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="course-card-footer">
                                <button className="course-btn view">
                                    View Lectures
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Decorative Elements */}
                            <div className="card-glow" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="courses-empty">
                        <Video size={48} />
                        <h3>No courses available yet</h3>
                        <p>Check back soon for new video courses!</p>
                    </div>
                )}

                {/* Premium Enrollment CTA Card */}
                <motion.div
                    className="enroll-cta-card"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                >
                    {/* Animated Background Elements */}
                    <div className="enroll-bg-elements">
                        <div className="floating-circle c1" />
                        <div className="floating-circle c2" />
                        <div className="floating-circle c3" />
                    </div>

                    {/* Content */}
                    <div className="enroll-content">
                        <motion.div
                            className="enroll-icon"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <GraduationCap size={32} />
                        </motion.div>
                        <div className="enroll-text">
                            <h3>Ready to Start Learning?</h3>
                            <p>Get full access to all premium video courses with expert guidance</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        className="enroll-btn"
                        onClick={() => navigate('/about-tutor')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>Enroll Now</span>
                        <ArrowRight size={18} />
                    </motion.button>

                    {/* Trust Badges */}
                    <div className="enroll-badges">
                        <span><Star size={12} /> 500+ Students</span>
                        <span><Award size={12} /> Expert Tutor</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
