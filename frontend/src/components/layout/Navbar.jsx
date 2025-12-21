import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AvatarDisplay } from '../ui/AvatarDisplay';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

// Clean, Simple Toggle - NO FANCY EFFECTS
function CleanToggle({ isDark, onToggle }) {
    return (
        <div
            onClick={onToggle}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            style={{
                width: '48px',
                height: '26px',
                backgroundColor: isDark ? '#3b82f6' : '#d1d5db',
                borderRadius: '13px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.3s ease',
                flexShrink: 0,
            }}
        >
            {/* Single sliding circle */}
            <div style={{
                position: 'absolute',
                top: '3px',
                left: isDark ? '25px' : '3px',
                width: '20px',
                height: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                transition: 'left 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </div>
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

                    {/* Clean Toggle */}
                    <CleanToggle isDark={isDark} onToggle={toggleTheme} />

                    {/* Profile */}
                    {isAuthenticated && (
                        <NavLink to="/profile" className="drd-profile">
                            <AvatarDisplay avatar={user?.avatar} size={34} />
                        </NavLink>
                    )}

                    {/* Hamburger */}
                    {isAuthenticated && (
                        <button
                            className="drd-hamburger"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isAuthenticated && mobileMenuOpen && (
                <nav className="drd-mobile-menu">
                    <NavLink to="/dashboard" className={({ isActive }) => `drd-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/subjects" className={({ isActive }) => `drd-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        Subjects
                    </NavLink>
                    <NavLink to="/about-tutor" className={({ isActive }) => `drd-mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        About
                    </NavLink>
                </nav>
            )}
        </header>
    );
}

export default Navbar;
