import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AvatarDisplay } from '../components/ui/AvatarDisplay';
import { SunMoonToggle } from '../components/ui/SunMoonToggle';
import {
    CheckCircle2, Target, Pencil, Lock, Bell, LogOut,
    ChevronRight, ClipboardList, TrendingUp, Flame, X, MapPin, CreditCard, BookOpenCheck, Moon, Sun, BadgeCheck
} from 'lucide-react';
import { CARTOON_AVATARS } from '../utils/avatars';
import api from '../services/api';
import './ProfilePage.css';
import '../components/ui/SunMoonToggle.css';

const AVATARS = CARTOON_AVATARS;

const TARGET_EXAMS = [
    { id: 'ibps-po', label: 'IBPS PO' },
    { id: 'sbi-po', label: 'SBI PO' },
    { id: 'ibps-clerk', label: 'IBPS Clerk' },
    { id: 'sbi-clerk', label: 'SBI Clerk' },
    { id: 'rbi-grade-b', label: 'RBI Grade B' },
    { id: 'rrb-po', label: 'RRB PO' },
    { id: 'rrb-clerk', label: 'RRB Clerk' },
    { id: 'lic-aao', label: 'LIC AAO' },
    { id: 'nicl-ao', label: 'NICL AO' }
];

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATARS[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [stats, setStats] = useState({
        testsCompleted: 0,
        averageScore: 0,
        streak: 0,
    });
    const [enrollment, setEnrollment] = useState({
        isPaid: false,
        courses: []
    });

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        mobile: user?.mobile || '',
        age: user?.age || '',
        city: user?.city || '',
        targetExam: user?.targetExam || 'ibps-po'
    });

    useEffect(() => {
        fetchUserStats();
        fetchEnrollmentData();
    }, []);

    const fetchUserStats = async () => {
        try {
            const res = await api.get('/student/dashboard');
            if (res.data.success) {
                const data = res.data.data;
                setStats({
                    testsCompleted: data.totalAttempts || 0,
                    averageScore: data.accuracy || 0,
                    streak: data.streakCount || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchEnrollmentData = async () => {
        try {
            const res = await api.get('/student/enrollment');
            if (res.data.success && res.data.data) {
                setEnrollment({
                    isPaid: res.data.data.isPaid || false,
                    courses: res.data.data.courses || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch enrollment:', error);
            // Use user object as fallback if enrollment endpoint doesn't exist
            if (user?.enrollment) {
                setEnrollment({
                    isPaid: user.enrollment.isPaid || false,
                    courses: user.enrollment.courses || []
                });
            }
        }
    };

    useEffect(() => {
        if (showAvatarPicker || isEditing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showAvatarPicker, isEditing]);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                mobile: user.mobile || '',
                age: user.age || '',
                city: user.city || '',
                targetExam: user.targetExam || 'ibps-po'
            });
            if (user.avatar) setSelectedAvatar(user.avatar);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        const updatedUser = { ...user, ...formData, avatar: selectedAvatar };
        updateUser(updatedUser);
        setIsEditing(false);
        try {
            await api.put('/auth/profile', { ...formData, avatar: selectedAvatar });
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleAvatarSelect = async (avatar) => {
        setSelectedAvatar(avatar);
        updateUser({ ...user, avatar: avatar });
        try {
            await api.put('/auth/profile', { avatar });
        } catch (error) {
            console.error('Failed to update avatar:', error);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-wrapper">
                {/* Profile Header */}
                <motion.div
                    className="profile-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="profile-banner"></div>
                    <div className="profile-main">
                        <div className="profile-avatar-wrap">
                            <AvatarDisplay avatar={selectedAvatar} size={110} />
                            <button className="edit-avatar-btn" onClick={() => setShowAvatarPicker(true)}>
                                <Pencil size={12} />
                            </button>
                        </div>
                        <div className="profile-info">
                            <div className="profile-name-line">
                                {/* Name + Badge together (will stack vertically with age on mobile) */}
                                <span className="name-with-badge">
                                    <h1>{formData.firstName} {formData.lastName}</h1>
                                    {/* Instagram-style Blue Tick for Paid Users */}
                                    {enrollment.isPaid && (
                                        <span className="verified-badge" title="Premium Member">
                                            <svg viewBox="0 0 22 22" aria-label="Verified" className="instagram-badge">
                                                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" fill="#1d9bf0"></path>
                                            </svg>
                                        </span>
                                    )}
                                </span>
                                {formData.age && <span className="badge-age">{formData.age} yrs</span>}
                            </div>
                            <div className="profile-meta">
                                {formData.city && (
                                    <span className="meta-item">
                                        <MapPin size={14} />
                                        {formData.city}
                                    </span>
                                )}
                                <span className="meta-item">{user?.email}</span>
                            </div>
                            <div className="profile-exam-badge">
                                <Target size={14} />
                                <span>Preparing for <strong>{TARGET_EXAMS.find(e => e.id === formData.targetExam)?.label || 'Banking Exams'}</strong></span>
                            </div>
                        </div>
                        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    </div>
                </motion.div>

                {/* Two Column Layout */}
                <div className="profile-columns">
                    {/* Performance Stats */}
                    <motion.div
                        className="profile-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="section-label">Performance Stats</h3>
                        <div className="stats-row">
                            <motion.div className="stat-box" whileHover={{ y: -3 }}>
                                <div className="stat-icon-wrap purple">
                                    <ClipboardList size={20} />
                                </div>
                                <span className="stat-num">{stats.testsCompleted}</span>
                                <span className="stat-text">Tests Taken</span>
                            </motion.div>
                            <motion.div className="stat-box" whileHover={{ y: -3 }}>
                                <div className="stat-icon-wrap blue">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="stat-num">{stats.averageScore}%</span>
                                <span className="stat-text">Avg. Score</span>
                            </motion.div>
                            <motion.div className="stat-box" whileHover={{ y: -3 }}>
                                <div className="stat-icon-wrap orange">
                                    <Flame size={20} />
                                </div>
                                <span className="stat-num">{stats.streak}</span>
                                <span className="stat-text">Day Streak</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Enrollment Status */}
                    <motion.div
                        className="profile-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h3 className="section-label">Enrollment Status</h3>
                        <div className="enrollment-status-card">
                            <div className={`enrollment-badge ${enrollment.isPaid ? 'paid' : 'unpaid'}`}>
                                <CreditCard size={18} />
                                <span>{enrollment.isPaid ? 'Premium Member' : 'Free User'}</span>
                            </div>
                            {enrollment.isPaid && enrollment.courses.length > 0 ? (
                                <div className="enrolled-courses">
                                    <h4 className="enrolled-label">
                                        <BookOpenCheck size={14} />
                                        Enrolled Courses ({enrollment.courses.length})
                                    </h4>
                                    <div className="enrolled-courses-list">
                                        {enrollment.courses.map((course, idx) => (
                                            <div key={idx} className="enrolled-course-item">
                                                <span className="course-name">{course.courseName || course.name || 'Course'}</span>
                                                {course.batch && <span className="course-batch">{course.batch}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {enrollment.courses.length > 3 && (
                                        <p className="courses-count">Scroll to see all {enrollment.courses.length} courses</p>
                                    )}
                                </div>
                            ) : enrollment.isPaid ? (
                                <p className="enrollment-hint">You have premium access. Explore courses to enroll.</p>
                            ) : (
                                <p className="enrollment-hint">Upgrade to premium to access exclusive content and courses.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Account Settings */}
                    <motion.div
                        className="profile-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="section-label">Account Settings</h3>
                        <div className="settings-menu">
                            <div className="menu-item">
                                <div className="menu-icon purple"><Lock size={16} /></div>
                                <div className="menu-text">
                                    <h4>Change Password</h4>
                                    <p>Update your security credentials</p>
                                </div>
                                <ChevronRight size={16} className="menu-arrow" />
                            </div>
                            <div className="menu-item">
                                <div className="menu-icon blue">{isDark ? <Moon size={16} /> : <Sun size={16} />}</div>
                                <div className="menu-text">
                                    <h4>Appearance</h4>
                                    <p>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                                </div>
                                <div onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
                                    <SunMoonToggle isDark={isDark} onToggle={toggleTheme} />
                                </div>
                            </div>
                            <div className="menu-item">
                                <div className="menu-icon blue"><Bell size={16} /></div>
                                <div className="menu-text">
                                    <h4>Notifications</h4>
                                    <p>Manage email and push alerts</p>
                                </div>
                                <ChevronRight size={16} className="menu-arrow" />
                            </div>
                            <div className="menu-item danger" onClick={handleLogout}>
                                <div className="menu-icon red"><LogOut size={16} /></div>
                                <div className="menu-text">
                                    <h4>Logout</h4>
                                    <p>Sign out of your account</p>
                                </div>
                                <ChevronRight size={16} className="menu-arrow" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            className="modal-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="modal-box"
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                            >
                                <div className="modal-top">
                                    <h2>Edit Profile</h2>
                                    <button onClick={() => setIsEditing(false)} className="btn-close"><X size={18} /></button>
                                </div>
                                <div className="modal-content">
                                    <div className="form-section">
                                        <label>Personal Details</label>
                                        <div className="form-row">
                                            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First Name" />
                                            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last Name" />
                                        </div>
                                        <div className="form-row">
                                            <Input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Age" type="number" />
                                            <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                                        </div>
                                    </div>
                                    <div className="form-section">
                                        <label>Contact Info</label>
                                        <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="+91 98765 43210" />
                                    </div>
                                    <div className="form-section">
                                        <label>Target Exam</label>
                                        <div className="exam-options">
                                            {TARGET_EXAMS.map(exam => (
                                                <div key={exam.id} className={`exam-chip ${formData.targetExam === exam.id ? 'active' : ''}`} onClick={() => setFormData({ ...formData, targetExam: exam.id })}>
                                                    {exam.label}
                                                    {formData.targetExam === exam.id && <CheckCircle2 size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-bottom">
                                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Avatar Picker Modal */}
                <AnimatePresence>
                    {showAvatarPicker && (
                        <motion.div className="modal-bg" onClick={() => setShowAvatarPicker(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div className="modal-box avatar-picker" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                                <div className="modal-top">
                                    <h2>Choose Avatar</h2>
                                    <p>Select a persona that represents you</p>
                                </div>
                                <div className="avatar-list">
                                    {AVATARS.map(avatar => (
                                        <div key={avatar.id} className="avatar-opt" onClick={() => handleAvatarSelect(avatar)}>
                                            <AvatarDisplay avatar={avatar} size={64} selected={selectedAvatar.id === avatar.id} />
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-bottom">
                                    <Button className="w-full" onClick={() => setShowAvatarPicker(false)}>Done</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ProfilePage;
