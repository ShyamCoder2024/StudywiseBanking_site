import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/index.css';
import './App.css';

// Page Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectsPage from './pages/student/SubjectsPage';
import TopicsPage from './pages/student/TopicsPage';
import QuizListPage from './pages/student/QuizListPage';
import QuizPage from './pages/student/QuizPage';
import ResultPage from './pages/student/ResultPage';
import ProfilePage from './pages/ProfilePage';
import AboutTutor from './pages/AboutTutor';
import TutorVideosPage from './pages/student/TutorVideosPage';
import TasksPage from './pages/student/TasksPage';
import PerformancePage from './pages/student/PerformancePage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import AIAnalysisPage from './pages/student/AIAnalysisPage';
import TestCenterPage from './pages/student/TestCenterPage';
import TestReviewPage from './pages/student/TestReviewPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import SubjectManagement from './pages/admin/SubjectManagement';
import TopicManagement from './pages/admin/TopicManagement';
import QuizManagement from './pages/admin/QuizManagement';
import QuestionManagement from './pages/admin/QuestionManagement';
import StudentMonitoring from './pages/admin/StudentMonitoring';
import TaskManagementPage from './pages/admin/TaskManagementPage';
import AllTasksPage from './pages/admin/AllTasksPage';
import AllInactiveStudentsPage from './pages/admin/AllInactiveStudentsPage';
import QuizAnalytics from './pages/admin/QuizAnalytics';

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
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

function AppContent() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Check localStorage for navbar visibility (faster than context)
  const storedUser = localStorage.getItem('user');
  let showNavbar = true;
  if (storedUser) {
    try {
      showNavbar = JSON.parse(storedUser).role !== 'admin';
    } catch (e) {
      // Invalid JSON, show navbar by default
      showNavbar = true;
    }
  }

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

          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PageTransition><StudentDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><PageTransition><SubjectsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/subjects/:subjectId/topics" element={<ProtectedRoute><PageTransition><TopicsPage /></PageTransition></ProtectedRoute>} />
          <Route path="/topics/:topicId/quizzes" element={<ProtectedRoute><PageTransition><QuizListPage /></PageTransition></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><PageTransition><QuizPage /></PageTransition></ProtectedRoute>} />
          <Route path="/result/:attemptId" element={<ProtectedRoute><PageTransition><ResultPage /></PageTransition></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
          <Route path="/about-tutor" element={<ProtectedRoute><PageTransition><AboutTutor /></PageTransition></ProtectedRoute>} />
          <Route path="/videos" element={<ProtectedRoute><PageTransition><TutorVideosPage /></PageTransition></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><PageTransition><TasksPage /></PageTransition></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PageTransition><PerformancePage /></PageTransition></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><PageTransition><LeaderboardPage /></PageTransition></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><PageTransition><AIAnalysisPage /></PageTransition></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><PageTransition><TestCenterPage /></PageTransition></ProtectedRoute>} />
          <Route path="/test-review/:attemptId" element={<ProtectedRoute><PageTransition><TestReviewPage /></PageTransition></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute adminOnly><PageTransition><SubjectManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/subjects/:subjectId/topics" element={<ProtectedRoute adminOnly><PageTransition><TopicManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute adminOnly><PageTransition><QuizManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes/:quizId/questions" element={<ProtectedRoute adminOnly><PageTransition><QuestionManagement /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/quizzes/:id/stats" element={<ProtectedRoute adminOnly><PageTransition><QuizAnalytics /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><PageTransition><StudentMonitoring /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute adminOnly><PageTransition><TaskManagementPage /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/tasks/all" element={<ProtectedRoute adminOnly><PageTransition><AllTasksPage /></PageTransition></ProtectedRoute>} />
          <Route path="/admin/inactive-students" element={<ProtectedRoute adminOnly><PageTransition><AllInactiveStudentsPage /></PageTransition></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
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
