import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, GraduationCap, User } from 'lucide-react';
import './BottomNavbar.css';

// Haptic feedback helper (works on iOS)
const vibrate = (pattern = [5]) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

export function BottomNavbar() {
    const location = useLocation();

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/courses', icon: GraduationCap, label: 'Courses' },
        { to: '/subjects', icon: BookOpen, label: 'Subjects' },
        { to: '/about-tutor', icon: User, label: 'About' }
    ];

    return (
        <nav className="bottom-navbar">
            {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                    (item.to === '/subjects' && location.pathname.includes('/subjects'));

                return (
                    <motion.div
                        key={item.to}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileTap={{ scale: 0.9 }}
                        className="bottom-nav-wrapper"
                    >
                        <NavLink
                            to={item.to}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => vibrate([5])}
                        >
                            <motion.div
                                className="bottom-nav-icon"
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    y: isActive ? -2 : 0
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>
                            <motion.span
                                className="bottom-nav-label"
                                animate={{
                                    opacity: isActive ? 1 : 0.7,
                                    fontWeight: isActive ? 600 : 500
                                }}
                            >
                                {item.label}
                            </motion.span>
                            {isActive && (
                                <motion.div
                                    className="bottom-nav-indicator"
                                    layoutId="indicator"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </NavLink>
                    </motion.div>
                );
            })}
        </nav>
    );
}

export default BottomNavbar;
