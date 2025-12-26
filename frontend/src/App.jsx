import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNavbar } from './components/layout/BottomNavbar';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { preloadCriticalRoutes } from './utils/routePreloader';
import LoadingFallback from './components/LoadingFallback';
import './styles/index.css';
import './App.css';

// Lazy load all page components for better performance
// Auth Pages - Load immediately (critical path)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Student Pages - Lazy loaded with retry for critical routes
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const SubjectsPage = lazy(() => import('./pages/student/SubjectsPage'));
const TopicsPage = lazy(() => import('./pages/student/TopicsPage'));
const QuizListPage = lazy(() => import('./pages/student/QuizListPage'));
const QuizPage = lazy(() => import('./pages/student/QuizPage'));
const ResultPage = lazy(() => import('./pages/student/ResultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutTutor = lazy(() => import('./pages/AboutTutor'));
// TutorVideosPage - REMOVED
const TasksPage = lazy(() => lazyWithRetry(() => import('./pages/student/TasksPage')));
const PerformancePage = lazy(() => lazyWithRetry(() => import('./pages/student/PerformancePage')));
const LeaderboardPage = lazy(() => lazyWithRetry(() => import('./pages/student/LeaderboardPage')));
const AIAnalysisPage = lazy(() => lazyWithRetry(() => import('./pages/student/AIAnalysisPage')));
const TestCenterPage = lazy(() => lazyWithRetry(() => import('./pages/student/TestCenterPage')));
const TestReviewPage = lazy(() => import('./pages/student/TestReviewPage'));
const CoursesPage = lazy(() => lazyWithRetry(() => import('./pages/student/CoursesPage')));
const CourseDetailPage = lazy(() => import('./pages/student/CourseDetailPage'));

// Admin Pages - Lazy loaded with retry for deployment stability
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const SubjectManagement = lazy(() => import('./pages/admin/SubjectManagement'));
const TopicManagement = lazy(() => import('./pages/admin/TopicManagement'));
const QuizManagement = lazy(() => import('./pages/admin/QuizManagement'));
const QuestionManagement = lazy(() => import('./pages/admin/QuestionManagement'));
const StudentMonitoring = lazy(() => import('./pages/admin/StudentMonitoring'));
const TaskManagementPage = lazy(() => lazyWithRetry(() => import('./pages/admin/TaskManagementPage')));
const AllTasksPage = lazy(() => lazyWithRetry(() => import('./pages/admin/AllTasksPage')));
const AllInactiveStudentsPage = lazy(() => lazyWithRetry(() => import('./pages/admin/AllInactiveStudentsPage')));
const QuizAnalytics = lazy(() => import('./pages/admin/QuizAnalytics'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));

// SIMPLIFIED Protected Route - Direct localStorage check
function ProtectedRoute({ children, adminOnly = false }) {
  // Read directly from localStorage for INSTANT check
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (!storedUser || !storedToken) {
    return <Navigate to="/login" replace />;
  }

  // Safe JSON parse with fallback
  let userData;
  try {
    userData = JSON.parse(storedUser);
  } catch (e) {
    // Corrupted data - clear and redirect to login
    console.error('Invalid user data in localStorage:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userData.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// SIMPLIFIED Public Route - Direct localStorage check
function PublicRoute({ children }) {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser && storedToken) {
    // Safe JSON parse with fallback
    let userData;
    try {
      userData = JSON.parse(storedUser);
    } catch (e) {
      // Corrupted data - clear it
      console.error('Invalid user data in localStorage:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return children;
    }
    return <Navigate to={userData.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

// Page Transition - Optimized for faster perceived performance
const PageTransition = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  </Suspense>
);

function AppContent() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Check localStorage for navbar visibility (faster than context)
  const storedUser = localStorage.getItem('user');
  let showNavbar = true;
  let userRole = 'student';
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      showNavbar = parsed.role !== 'admin';
      userRole = parsed.role || 'student';
    } catch (e) {
      // Invalid JSON, show navbar by default
      showNavbar = true;
    }
  }

  // Check if user is authenticated and is a student (for bottom nav)
  const isAuthenticatedStudent = storedUser && showNavbar && localStorage.getItem('token');

  // Preload critical routes after initial render for instant navigation
  useEffect(() => {
    if (storedUser && localStorage.getItem('token')) {
      preloadCriticalRoutes(userRole);
    }
  }, [storedUser, userRole]);

  return (
    <>
      {showNavbar && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><PageTransition><LoginPage /></PageTransition></PublicRoute>} />
          <Route path="/admin-login" element={<PublicRoute><PageTransition><AdminLoginPage /></PageTransition></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><PageTransition><RegisterPage /></PageTransition></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><PageTransition><ForgotPasswordPage /></PageTransition></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><PageTransition><ResetPasswordPage /></PageTransition></PublicRoute>} />

          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PageTransition><StudentDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><PageTransition><SubjectsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/subjects/:subjectId/topics" element={<ProtectedRoute><PageTransition><TopicsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/topics/:topicId/quizzes" element={<ProtectedRoute><PageTransition><QuizListPage /></PageTransition></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><PageTransition><QuizPage /></PageTransition></ProtectedRoute>} />
          <Route path="/result/:attemptId" element={<ProtectedRoute><PageTransition><ResultPage /></PageTransition></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
          <Route path="/about-tutor" element={<ProtectedRoute><PageTransition><AboutTutor /></PageTransition></ProtectedRoute>} />
          {/* /videos route - REMOVED */}
          <Route path="/tasks" element={<ProtectedRoute><PageTransition><TasksPage /></PageTransition></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PageTransition><PerformancePage /></PageTransition></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><PageTransition><LeaderboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><PageTransition><AIAnalysisPage /></PageTransition></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><PageTransition><TestCenterPage /></PageTransition></ProtectedRoute>} />
          <Route path="/test-review/:attemptId" element={<ProtectedRoute><PageTransition><TestReviewPage /></PageTransition></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><PageTransition><CoursesPage /></PageTransition></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><PageTransition><CourseDetailPage /></PageTransition></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute adminOnly><PageTransition><SubjectManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/subjects/:subjectId/topics" element={<ProtectedRoute adminOnly><PageTransition><TopicManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly><PageTransition><QuizManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes/:quizId/questions" element={<ProtectedRoute adminOnly><PageTransition><QuestionManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes/:id/stats" element={<ProtectedRoute adminOnly><PageTransition><QuizAnalytics /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><PageTransition><StudentMonitoring /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute adminOnly><PageTransition><CourseManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><PageTransition><TaskManagementPage /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/tasks/all" element={<ProtectedRoute adminOnly><PageTransition><AllTasksPage /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/inactive-students" element={<ProtectedRoute adminOnly><PageTransition><AllInactiveStudentsPage /></PageTransition></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Bottom Navigation for Mobile Students */}
      {isAuthenticatedStudent && <BottomNavbar />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
