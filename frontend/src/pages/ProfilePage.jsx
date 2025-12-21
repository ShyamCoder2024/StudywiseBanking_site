import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AvatarDisplay } from '../components/ui/AvatarDisplay';
import {
    CheckCircle2, Target, BookOpen, Pencil, Lock, Bell, LogOut,
    ChevronRight, ClipboardList, TrendingUp, Flame, X
} from 'lucide-react';
import { CARTOON_AVATARS } from '../utils/avatars';
import api from '../services/api';
import './ProfilePage.css';

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

    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATARS[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [stats, setStats] = useState({
        testsCompleted: 0,
        averageScore: 0,
        streak: 0,
    });

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        mobile: user?.mobile || '',
        age: user?.age || '',
        city: user?.city || '',
        targetExam: user?.targetExam || 'ibps-po'
    });

    // Fetch real stats from backend
    useEffect(() => {
        fetchUserStats();
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

    // Body Scroll Lock for Modal
    useEffect(() => {
        if (showAvatarPicker || isEditing) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="profile-page">
            <motion.div
                className="profile-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Profile Header Card */}
                <motion.div className="profile-header-card" variants={itemVariants}>
                    <div className="profile-cover"></div>
                    <div className="profile-header-content">
                        <motion.div
                            className="avatar-section"
                            whileHover={{ scale: 1.02 }}
                        >
                            <AvatarDisplay avatar={selectedAvatar} size={120} />
                            <motion.button
                                className="avatar-edit-btn"
                                onClick={() => setShowAvatarPicker(true)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Pencil size={14} />
                            </motion.button>
                        </motion.div>

                        <div className="user-info">
                            <div className="name-row">
                                <h1>{formData.firstName} {formData.lastName}</h1>
                                {formData.age && <span className="age-badge">{formData.age} yrs</span>}
                            </div>

                            <p className="user-details">
                                {formData.city && <span>📍 {formData.city} • </span>}
                                {user?.email}
                            </p>

                            <div className="target-exam-pill">
                                <Target size={14} />
                                <span>Preparing for <strong>{TARGET_EXAMS.find(e => e.id === formData.targetExam)?.label || 'Banking Exams'}</strong></span>
                            </div>
                        </div>

                        <motion.button
                            className="edit-profile-btn"
                            onClick={() => setIsEditing(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Edit Profile
                        </motion.button>
                    </div>
                </motion.div>

                <div className="profile-grid">
                    {/* Stats Section */}
                    <motion.div className="stats-section" variants={itemVariants}>
                        <h3 className="section-title">Performance Stats</h3>
                        <div className="stats-grid">
                            <motion.div
                                className="stat-card"
                                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)' }}
                            >
                                <div className="stat-icon purple">
                                    <ClipboardList size={22} />
                                </div>
                                <div className="stat-content">
                                    <motion.h4
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: 'spring' }}
                                    >
                                        {stats.testsCompleted}
                                    </motion.h4>
                                    <p>Tests Taken</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)' }}
                            >
                                <div className="stat-icon blue">
                                    <TrendingUp size={22} />
                                </div>
                                <div className="stat-content">
                                    <motion.h4
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: 'spring' }}
                                    >
                                        {stats.averageScore}%
                                    </motion.h4>
                                    <p>Avg. Score</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(249, 115, 22, 0.15)' }}
                            >
                                <div className="stat-icon orange">
                                    <Flame size={22} />
                                </div>
                                <div className="stat-content">
                                    <motion.h4
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        {stats.streak} Days
                                    </motion.h4>
                                    <p>Active Streak</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Settings Section */}
                    <motion.div className="settings-section" variants={itemVariants}>
                        <h3 className="section-title">Account Settings</h3>
                        <div className="settings-list">
                            <motion.div
                                className="setting-item"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="setting-icon purple">
                                    <Lock size={18} />
                                </div>
                                <div className="setting-content">
                                    <h4>Change Password</h4>
                                    <p>Update your security credentials</p>
                                </div>
                                <ChevronRight size={18} className="setting-arrow" />
                            </motion.div>

                            <motion.div
                                className="setting-item"
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="setting-icon blue">
                                    <Bell size={18} />
                                </div>
                                <div className="setting-content">
                                    <h4>Notifications</h4>
                                    <p>Manage email and push alerts</p>
                                </div>
                                <ChevronRight size={18} className="setting-arrow" />
                            </motion.div>

                            <motion.div
                                className="setting-item logout"
                                onClick={handleLogout}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="setting-icon red">
                                    <LogOut size={18} />
                                </div>
                                <div className="setting-content">
                                    <h4>Logout</h4>
                                    <p>Sign out of your account</p>
                                </div>
                                <ChevronRight size={18} className="setting-arrow" />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            className="modal-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="modal-card"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <div className="modal-header">
                                    <h2>Edit Profile</h2>
                                    <button onClick={() => setIsEditing(false)} className="close-btn">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Personal Details</label>
                                        <div className="input-row">
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                placeholder="First Name"
                                            />
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                placeholder="Last Name"
                                            />
                                        </div>
                                        <div className="input-row">
                                            <Input
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                placeholder="Age"
                                                type="number"
                                            />
                                            <Input
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="City"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Contact Info</label>
                                        <Input
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Target Exam</label>
                                        <div className="exam-grid">
                                            {TARGET_EXAMS.map(exam => (
                                                <motion.div
                                                    key={exam.id}
                                                    className={`exam-option ${formData.targetExam === exam.id ? 'selected' : ''}`}
                                                    onClick={() => setFormData({ ...formData, targetExam: exam.id })}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span>{exam.label}</span>
                                                    {formData.targetExam === exam.id && <CheckCircle2 size={16} />}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
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
                        <motion.div
                            className="modal-overlay"
                            onClick={() => setShowAvatarPicker(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="avatar-modal"
                                onClick={e => e.stopPropagation()}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <div className="modal-header">
                                    <h2>Choose Avatar</h2>
                                    <p>Select a persona that represents you</p>
                                </div>

                                <div className="avatar-grid-container">
                                    <div className="avatar-grid">
                                        {AVATARS.map(avatar => (
                                            <motion.div
                                                key={avatar.id}
                                                className="avatar-item"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <AvatarDisplay
                                                    avatar={avatar}
                                                    size={70}
                                                    selected={selectedAvatar.id === avatar.id}
                                                    onClick={() => handleAvatarSelect(avatar)}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <Button className="w-full" onClick={() => setShowAvatarPicker(false)}>Done</Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default ProfilePage;
