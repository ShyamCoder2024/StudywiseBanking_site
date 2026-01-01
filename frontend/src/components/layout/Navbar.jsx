import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

// Premium Animated Sun/Moon Toggle
function SunMoonToggle({ isDark, onToggle }) {
    return (
        <label className="theme-switch" onClick={onToggle}>
            {/* Sun Icon */}
            <span className="theme-sun">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g fill="#ffd43b">
                        <circle r={5} cy={12} cx={12} />
                        <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
                    </g>
                </svg>
            </span>
            {/* Moon Icon */}
            <span className="theme-moon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                </svg>
            </span>
            <input
                type="checkbox"
                className="theme-input"
                checked={isDark}
                onChange={() => { }}
                aria-label="Toggle dark mode"
            />
            <span className={`theme-slider ${isDark ? 'dark' : ''}`} />
        </label>
    );
}

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

                    {/* Premium Sun/Moon Toggle - Hidden on mobile (shown in profile instead) */}
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
