import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, FileText, Users, LogOut, ListTodo, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryDark: '#6B5A96',
    primaryLight: '#EDE9F6',
    sidebarBg: '#1a1625',
    sidebarDark: '#0f0d14',
    text: '#FFFFFF',
    textMuted: '#a8a3b3',
    border: '#2d2640'
};

// Navigation item component with animations
const NavItem = ({ item, isActive, onClick }) => {
    const Icon = item.icon;

    return (
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Link
                to={item.path}
                onClick={onClick}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    marginBottom: '4px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    textDecoration: 'none',
                    position: 'relative',
                    backgroundColor: isActive ? BRAND.primary : 'transparent',
                    color: isActive ? '#FFFFFF' : BRAND.textMuted,
                    boxShadow: isActive ? '0 4px 15px rgba(138, 117, 186, 0.4)' : 'none',
                    transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease'
                }}
            >
                {/* Active indicator bar */}
                {isActive && (
                    <motion.div
                        layoutId="activeIndicator"
                        style={{
                            position: 'absolute',
                            left: '-12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '24px',
                            backgroundColor: BRAND.primary,
                            borderRadius: '0 4px 4px 0'
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
            </Link>
        </motion.div>
    );
};

export function AdminSidebar({ isOpen, onClose, isDesktop }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    const navItems = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/admin/quizzes', label: 'Quizzes', icon: FileText },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/tasks', label: 'Tasks', icon: ListTodo },
    ];

    const shouldShow = isDesktop || isOpen;

    const sidebarVariants = {
        hidden: { x: '-100%', opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 35 }
        },
        exit: {
            x: '-100%',
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {!isDesktop && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            zIndex: 45
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {(isDesktop || isOpen) && (
                    <motion.aside
                        variants={!isDesktop ? sidebarVariants : undefined}
                        initial={!isDesktop ? "hidden" : false}
                        animate={!isDesktop ? "visible" : undefined}
                        exit={!isDesktop ? "exit" : undefined}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '260px',
                            backgroundColor: BRAND.sidebarBg,
                            borderRight: `1px solid ${BRAND.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 50,
                            boxShadow: !isDesktop ? '4px 0 25px rgba(0, 0, 0, 0.3)' : 'none'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: `1px solid ${BRAND.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: BRAND.sidebarDark
                        }}>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                            >
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    src="/logo_new.jpg"
                                    alt="StudyWise Banking"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        objectFit: 'cover',
                                        border: `2px solid ${BRAND.primary}`
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: BRAND.text,
                                        lineHeight: '1.2'
                                    }}>
                                        StudyWise
                                    </span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: BRAND.primary,
                                        lineHeight: '1.2'
                                    }}>
                                        Banking Admin
                                    </span>
                                </div>
                            </motion.div>

                            {/* Close button - Mobile only */}
                            {!isDesktop && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        color: BRAND.textMuted,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={18} />
                                </motion.button>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                style={{
                                    padding: '0 12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: BRAND.textMuted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: '12px'
                                }}
                            >
                                Platform
                            </motion.p>

                            {navItems.map((item, index) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/admin' && location.pathname.startsWith(item.path));

                                return (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.1 + index * 0.05,
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 25
                                        }}
                                    >
                                        <NavItem
                                            item={item}
                                            isActive={isActive}
                                            onClick={() => !isDesktop && onClose()}
                                        />
                                    </motion.div>
                                );
                            })}
                        </nav>

                        {/* Footer - User Profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                padding: '16px',
                                borderTop: `1px solid ${BRAND.border}`,
                                backgroundColor: BRAND.sidebarDark
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: BRAND.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}>
                                    {user?.firstName?.[0] || 'A'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: BRAND.text,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {user?.firstName || 'Admin'}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: BRAND.textMuted
                                    }}>
                                        Administrator
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: '#dc2626' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <LogOut size={16} />
                                Sign Out
                            </motion.button>
                        </motion.div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
