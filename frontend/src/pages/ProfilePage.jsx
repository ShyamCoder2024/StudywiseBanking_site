import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AvatarDisplay } from '../components/ui/AvatarDisplay';
import { CheckCircle2, Target, BookOpen } from 'lucide-react';
import api from '../services/api';
import './ProfilePage.css';

// Generating Premium "Cartoonish" Avatars
// 40 High-quality, expressive cartoon avatars (Adventurer Style)
const generateAvatars = () => {
    const avatars = [];

    // Curated seeds for diverse, premium-looking characters
    const avatarSeeds = [
        'Felix', 'Aneka', 'Yo', 'Precious', 'Cuddles',
        'Shadow', 'Misty', 'Whiskers', 'Coco', 'Sparky',
        'Bailey', 'Ginger', 'Snowball', 'Dusty', 'Lucky',
        'Simon', 'Garfield', 'Oreo', 'Sassy', 'Abby',
        'Bandit', 'Jasper', 'Tigger', 'Simba', 'Peanut',
        'Casper', 'Midnight', 'Rocky', 'Toby', 'Lola',
        'Bella', 'Max', 'Charlie', 'Jack', 'Daisy',
        'Luna', 'Milo', 'Oliver', 'Leo', 'Buddy'
    ];

    // Premium pastel background colors
    const bgColors = [
        'b6e3f4', 'c0aede', 'd1d4f9', 'ffdfbf', 'ffd5dc',
        'f0f4f8', 'e2e8f0', 'fed7aa', 'fbcfe8', 'bfdbfe'
    ];

    for (let i = 0; i < 40; i++) {
        // Use mod to cycle through seeds if we run out, though we have 40
        const seed = avatarSeeds[i % avatarSeeds.length];
        const bg = bgColors[i % bgColors.length];

        avatars.push({
            id: `k-avatar-${i + 1}`,
            // Using 'adventurer' style for a premium, cartoonish look
            url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}&radius=10`
        });
    }

    return avatars;
};

const AVATARS = generateAvatars();

const TARGET_EXAMS = [
    { id: 'ibps-po', label: 'IBPS PO', icon: '🏦' },
    { id: 'sbi-po', label: 'SBI PO', icon: '🦁' },
    { id: 'ibps-clerk', label: 'IBPS Clerk', icon: '📝' },
    { id: 'sbi-clerk', label: 'SBI Clerk', icon: '📋' },
    { id: 'rbi-grade-b', label: 'RBI Grade B', icon: '🏦' },
    { id: 'rrb-po', label: 'RRB PO', icon: '🌾' },
    { id: 'rrb-clerk', label: 'RRB Clerk', icon: '🚜' },
    { id: 'lic-aao', label: 'LIC AAO', icon: '🛡️' },
    { id: 'nicl-ao', label: 'NICL AO', icon: '⚖️' }
];

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();

    // State
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATARS[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Body Scroll Lock for Mobile Modal
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

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        mobile: user?.mobile || '',
        age: user?.age || '',
        city: user?.city || '',
        targetExam: user?.targetExam || 'ibps-po'
    });

    const [stats] = useState({
        testsCompleted: 12,
        averageScore: 72,
        streak: 5,
    });

    // Update form data when user loads
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
        // Optimistic Update
        const updatedUser = {
            ...user,
            ...formData,
            avatar: selectedAvatar
        };
        updateUser(updatedUser);
        setIsEditing(false);

        // Persist to backend
        try {
            await api.put('/auth/profile', {
                ...formData,
                avatar: selectedAvatar
            });
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleAvatarSelect = async (avatar) => {
        setSelectedAvatar(avatar);
        // Immediate update for global context (Navbar, mobile header, etc.)
        updateUser({ ...user, avatar: avatar });

        // Persist to backend
        try {
            await api.put('/auth/profile', { avatar });
        } catch (error) {
            console.error('Failed to update avatar:', error);
        }
    };

    return (
        <div className="page-profile-premium">
            <div className="profile-container-premium">

                {/* Profile Header Card */}
                <div className="profile-card-main glass-panel">
                    <div className="header-cover"></div>
                    <div className="header-content">
                        <div className="avatar-wrapper-premium">
                            <AvatarDisplay avatar={selectedAvatar} size={140} />
                            <button className="btn-edit-avatar" onClick={() => setShowAvatarPicker(true)}>
                                🖊️
                            </button>
                        </div>

                        <div className="user-info-premium">
                            <div className="name-badge-row">
                                <h1>{formData.firstName} {formData.lastName}</h1>
                                {formData.age && <span className="meta-badge">{formData.age} yrs</span>}
                            </div>

                            <p className="user-bio-line">
                                {formData.city && <span>📍 {formData.city} • </span>}
                                {user?.email}
                            </p>

                            {/* Target Exam Pill */}
                            <div className="preference-pill">
                                <Target size={14} />
                                <span>Preparing for <strong>{TARGET_EXAMS.find(e => e.id === formData.targetExam)?.label || 'Banking Exams'}</strong></span>
                            </div>
                        </div>

                        <button className="btn-edit-profile-action" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="profile-content-grid">
                    {/* Stats Grid */}
                    <div className="stats-section-premium">
                        <div className="section-header">
                            <h3>Performance Stats</h3>
                        </div>
                        <div className="stats-grid-premium">
                            <div className="stat-card-p">
                                <div className="icon-box-p purple">📝</div>
                                <div>
                                    <h3>{stats.testsCompleted}</h3>
                                    <p>Tests Taken</p>
                                </div>
                            </div>
                            <div className="stat-card-p">
                                <div className="icon-box-p blue">📊</div>
                                <div>
                                    <h3>{stats.averageScore}%</h3>
                                    <p>Avg. Score</p>
                                </div>
                            </div>
                            <div className="stat-card-p">
                                <div className="icon-box-p orange">🔥</div>
                                <div>
                                    <h3>{stats.streak} Days</h3>
                                    <p>Active Streak</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings List */}
                    <div className="settings-section glass-panel">
                        <div className="section-header">
                            <h3>Account Settings</h3>
                        </div>
                        <div className="settings-list">
                            <div className="setting-item clickable">
                                <div className="s-icon">🔐</div>
                                <div className="s-content">
                                    <h4>Change Password</h4>
                                    <p>Update your security credentials</p>
                                </div>
                                <div className="s-action">→</div>
                            </div>
                            <div className="setting-item clickable">
                                <div className="s-icon">🔔</div>
                                <div className="s-content">
                                    <h4>Notifications</h4>
                                    <p>Manage email and push alerts</p>
                                </div>
                                <div className="s-action">→</div>
                            </div>
                            <div className="setting-item clickable" onClick={handleLogout} style={{ borderBottom: 'none' }}>
                                <div className="s-icon">🚪</div>
                                <div className="s-content">
                                    <h4 style={{ color: '#ef4444' }}>Logout</h4>
                                    <p>Sign out of your account</p>
                                </div>
                                <div className="s-action">→</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal (Overlay) */}
                {isEditing && (
                    <div className="modal-overlay">
                        <div className="modal-card animate-pop">
                            <div className="modal-header">
                                <h2>Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="btn-close">✕</button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Personal Details</label>
                                    <div className="row-inputs">
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
                                    <div className="row-inputs mt-3">
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

                                {/* Target Exam Selector */}
                                <div className="form-group">
                                    <label>Target Exam</label>
                                    <div className="exam-selector-scroll">
                                        {TARGET_EXAMS.map(exam => (
                                            <div
                                                key={exam.id}
                                                className={`exam-option ${formData.targetExam === exam.id ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, targetExam: exam.id })}
                                            >
                                                <span className="exam-icon">{exam.icon}</span>
                                                <span className="exam-label">{exam.label}</span>
                                                {formData.targetExam === exam.id && <CheckCircle2 size={16} className="check-icon" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Avatar Picker Modal */}
                {showAvatarPicker && (
                    <div className="modal-overlay" onClick={() => setShowAvatarPicker(false)}>
                        <div className="avatar-modal-card animate-pop" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Choose Avatar</h2>
                                <p>Select a persona that represents you</p>
                            </div>

                            <div className="avatar-grid-wrapper">
                                <div className="avatar-grid-large">
                                    {AVATARS.map(avatar => (
                                        <div key={avatar.id} className="avatar-item-wrapper">
                                            <AvatarDisplay
                                                avatar={avatar}
                                                size={80}
                                                selected={selectedAvatar.id === avatar.id}
                                                onClick={() => handleAvatarSelect(avatar)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <Button className="w-full" onClick={() => setShowAvatarPicker(false)}>Done</Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ProfilePage;
