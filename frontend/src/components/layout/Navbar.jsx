import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X } from 'lucide-react';
import { SunMoonToggle } from '../ui/SunMoonToggle';
import './Navbar.css';

export function Navbar() {
    const { isAuthenticated, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDark = theme === 'dark';

    return (
        <header className="drd-navbar">
            <div className="drd-navbar-inner">
                {/* Logo */}
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="drd-logo">
                    <img src="/logo_new.jpg" alt="StudyWise" className="drd-logo-img" />
                    <span className="drd-logo-text">StudyWiseBanking</span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <nav className="drd-desktop-nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `drd-nav-link ${isActive ? 'active' : ''}`}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/subjects" className={({ isActive }) => `drd-nav-link ${isActive ? 'active' : ''}`}>
                            Subjects
                        </NavLink>
                        <NavLink to="/courses" className={({ isActive }) => `drd-nav-link ${isActive ? 'active' : ''}`}>
                            Courses
                        </NavLink>
                        <NavLink to="/about-tutor" className={({ isActive }) => `drd-nav-link ${isActive ? 'active' : ''}`}>
                            About
                        </NavLink>
                    </nav>
                )}

                {/* Right Actions */}
                <div className="drd-actions">
                    {/* Auth */}
                    {!isAuthenticated && (
                        <>
                            {location.pathname !== '/login' && (
                                <NavLink to="/login" className="drd-auth-link">Login</NavLink>
                            )}
                            {location.pathname !== '/register' && (
                                <NavLink to="/register" className="drd-auth-btn">Register</NavLink>
                            )}
                        </>
                    )}

                    {/* Premium Sun/Moon Toggle - Hidden on mobile, shown in profile instead */}
                    <div className="hide-on-mobile">
                        <SunMoonToggle isDark={isDark} onToggle={toggleTheme} />
                    </div>

                    {/* Profile */}
                    {isAuthenticated && (
                        <NavLink to="/profile" className="drd-profile">
                            <AvatarDisplay avatar={user?.avatar} size={34} />
                        </NavLink>
                    )}

                    {/* Note: Hamburger menu removed - using BottomNavbar for mobile navigation */}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
