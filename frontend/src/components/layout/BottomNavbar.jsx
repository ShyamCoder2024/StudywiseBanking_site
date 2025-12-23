import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, User } from 'lucide-react';
import './BottomNavbar.css';

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
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                    (item.to === '/subjects' && location.pathname.includes('/subjects'));

                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="bottom-nav-icon">
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="bottom-nav-label">{item.label}</span>
                        {isActive && <div className="bottom-nav-indicator" />}
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default BottomNavbar;
