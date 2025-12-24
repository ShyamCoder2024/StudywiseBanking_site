// Route Preloading Utility for faster navigation
// Preloads critical routes when user is likely to navigate to them

// Map of routes to their component imports
const routeModules = {
    dashboard: () => import('../pages/student/StudentDashboard'),
    subjects: () => import('../pages/student/SubjectsPage'),
    tests: () => import('../pages/student/TestCenterPage'),
    courses: () => import('../pages/student/CoursesPage'),
    leaderboard: () => import('../pages/student/LeaderboardPage'),
    performance: () => import('../pages/student/PerformancePage'),
    profile: () => import('../pages/ProfilePage'),
    // Admin routes
    admin: () => import('../pages/admin/AdminDashboard'),
    adminStudents: () => import('../pages/admin/StudentMonitoring'),
    adminCourses: () => import('../pages/admin/CourseManagement'),
    adminQuizzes: () => import('../pages/admin/QuizManagement')
};

// Preload a specific route
export function preloadRoute(routeName) {
    const loader = routeModules[routeName];
    if (loader) {
        loader().catch(() => {
            // Silently fail - component will load when actually needed
        });
    }
}

// Preload multiple routes
export function preloadRoutes(routeNames) {
    routeNames.forEach(preloadRoute);
}

// Preload on hover - for links
export function handleHoverPreload(routeName) {
    return () => preloadRoute(routeName);
}

// Preload critical routes after initial page load
export function preloadCriticalRoutes(userRole = 'student') {
    // Wait for initial render to complete
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
            if (userRole === 'admin') {
                preloadRoutes(['admin', 'adminStudents', 'adminCourses', 'adminQuizzes']);
            } else {
                preloadRoutes(['dashboard', 'subjects', 'tests', 'courses']);
            }
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            if (userRole === 'admin') {
                preloadRoutes(['admin', 'adminStudents', 'adminCourses', 'adminQuizzes']);
            } else {
                preloadRoutes(['dashboard', 'subjects', 'tests', 'courses']);
            }
        }, 1500);
    }
}

// Preload based on viewport intersection (for link elements)
export function createIntersectionPreloader() {
    if (typeof IntersectionObserver === 'undefined') return null;

    const preloadedRoutes = new Set();

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const routeName = entry.target.dataset.preload;
                if (routeName && !preloadedRoutes.has(routeName)) {
                    preloadedRoutes.add(routeName);
                    preloadRoute(routeName);
                }
            }
        });
    }, { rootMargin: '100px' });
}

export default {
    preloadRoute,
    preloadRoutes,
    handleHoverPreload,
    preloadCriticalRoutes,
    createIntersectionPreloader
};
