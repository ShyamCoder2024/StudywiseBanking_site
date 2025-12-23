import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap, BookOpen, Clock, Users, CheckCircle2,
    Lock, ArrowRight, Star, Sparkles, Award, Play
} from 'lucide-react';
import api from '../../services/api';
import './CoursesPage.css';

export default function CoursesPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [enrollment, setEnrollment] = useState({ isPaid: false, courses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, enrollmentRes] = await Promise.all([
                api.get('/student/courses').catch(() => ({ data: { data: [] } })),
                api.get('/student/enrollment').catch(() => ({ data: { data: { isPaid: false, courses: [] } } }))
            ]);

            setCourses(coursesRes.data.data || []);
            setEnrollment(enrollmentRes.data.data || { isPaid: false, courses: [] });
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollClick = (course) => {
        // For now, show an alert. In production, this would integrate with payment
        alert(`Contact us to enroll in "${course.name}"\n\nPrice: ${course.price}`);
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
                            <GraduationCap size={32} className="header-icon" />
                            Our Courses
                        </h1>
                        <p>Master banking exams with expert-curated courses</p>
                    </div>

                    {enrollment.isPaid && (
                        <div className="premium-badge">
                            <Star size={16} />
                            <span>Premium Member</span>
                        </div>
                    )}
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
                        <span>Expert Mentors</span>
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
                            key={course.id}
                            className={`course-card ${course.isEnrolled ? 'enrolled' : ''}`}
                            variants={item}
                        >
                            {/* Card Header */}
                            <div className="course-card-header">
                                <div className="course-icon">
                                    <GraduationCap size={28} />
                                </div>
                                {course.isEnrolled ? (
                                    <div className="enrolled-badge">
                                        <CheckCircle2 size={14} />
                                        Enrolled
                                    </div>
                                ) : (
                                    <div className="price-badge">
                                        {course.price}
                                    </div>
                                )}
                            </div>

                            {/* Card Content */}
                            <div className="course-card-content">
                                <h3>{course.name}</h3>

                                {course.features && (
                                    <ul className="course-features">
                                        {course.features.map((feature, i) => (
                                            <li key={i}>
                                                <CheckCircle2 size={14} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Card Footer */}
                            <div className="course-card-footer">
                                {course.isEnrolled ? (
                                    <button
                                        className="course-btn enrolled"
                                        onClick={() => navigate('/subjects')}
                                    >
                                        <Play size={18} />
                                        Continue Learning
                                    </button>
                                ) : (
                                    <button
                                        className="course-btn enroll"
                                        onClick={() => handleEnrollClick(course)}
                                    >
                                        <Sparkles size={18} />
                                        Enroll Now
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Decorative Elements */}
                            <div className="card-glow" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="courses-empty">
                        <GraduationCap size={48} />
                        <h3>No courses available</h3>
                        <p>Check back soon for new courses!</p>
                    </div>
                )}

                {/* CTA Section */}
                <motion.div
                    className="courses-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="cta-content">
                        <h3>Need Help Choosing?</h3>
                        <p>Contact our team for personalized course recommendations</p>
                    </div>
                    <button
                        className="cta-btn"
                        onClick={() => navigate('/about-tutor')}
                    >
                        Talk to Us
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
