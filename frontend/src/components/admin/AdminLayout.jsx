import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';
import './AdminResponsive.css';

// App-like page transitions - Fast and snappy like iOS/Android
const pageVariants = {
    initial: {
        opacity: 0,
        x: 60,
        scale: 0.98
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
        }
    },
    exit: {
        opacity: 0,
        x: -30,
        scale: 0.98,
        transition: {
            duration: 0.15,
            ease: "easeIn"
        }
    }
};

// Content stagger animation for child elements
const containerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
        }
    }
};

export function AdminLayout({ children }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Detect if we're on desktop (>= 1024px)
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
    );

    // Listen for resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar and trigger navigation animation
    useEffect(() => {
        setIsNavigating(true);
        if (!isDesktop) {
            setSidebarOpen(false);
        }
        // Quick reset for snappier feel
        const timer = setTimeout(() => setIsNavigating(false), 50);
        return () => clearTimeout(timer);
    }, [location.pathname, isDesktop]);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            overflow: 'hidden' // Prevent scroll during animation
        }}>
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isDesktop={isDesktop}
            />

            {/* Main Content Area */}
            <div style={{
                marginLeft: isDesktop ? '260px' : '0',
                minHeight: '100vh',
                transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
            }}>
                {/* Mobile Header */}
                {!isDesktop && (
                    <motion.header
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 30,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderBottom: '1px solid #e5e7eb',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(true)}
                            style={{
                                padding: '10px',
                                marginLeft: '-6px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#374151'
                            }}
                        >
                            <Menu size={24} />
                        </motion.button>
                        <span style={{ fontWeight: '700', color: '#111827', fontSize: '18px' }}>
                            Admin Portal
                        </span>
                    </motion.header>
                )}

                {/* Animated Page Content - Simplified for stability */}
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        padding: isDesktop ? '28px 32px' : '16px',
                        maxWidth: '1400px',
                        margin: '0 auto'
                    }}
                >
                    {children}
                </motion.main>
            </div>

            {/* Mobile Sidebar Overlay with blur */}
            <AnimatePresence>
                {!isDesktop && sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 40
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Global styles for smooth interactions */}
            <style>{`
                /* GPU-accelerated transforms */
                * {
                    -webkit-tap-highlight-color: transparent;
                }
                
                /* Smooth scrolling */
                html, body {
                    scroll-behavior: smooth;
                }
                
                /* Button press effect */
                button:active {
                    transform: scale(0.97);
                }
                
                /* Card hover lift */
                [data-card]:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
                }
                
                /* Instant visual feedback */
                a, button {
                    transition: transform 0.1s ease, opacity 0.1s ease !important;
                }
                
                /* Prevent layout shift */
                main {
                    min-height: calc(100vh - 80px);
                }
            `}</style>
        </div>
    );
}

// Export animation variants for use in child components
export { itemVariants, containerVariants };
