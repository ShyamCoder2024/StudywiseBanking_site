# StudyWiseBanking - Application Architecture Document

> **Purpose**: This document provides a comprehensive overview of the StudyWiseBanking application for AI agents and developers. Read this document first to understand the entire codebase before making any changes.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
5. [API Routes](#api-routes)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication Flow](#authentication-flow)
8. [Key Features](#key-features)
9. [Design System](#design-system)
10. [Deployment](#deployment)
11. [Important Files Reference](#important-files-reference)

---

## Application Overview

**StudyWiseBanking** is a mobile-first, AI-powered test preparation platform for Indian banking exam aspirants (IBPS, SBI, RBI exams).

### Core Functionality
- **Quiz Engine**: MCQ and descriptive questions with timer, negative marking
- **AI Analysis**: Google Gemini-powered personalized performance feedback
- **Video Courses**: YouTube-based paid courses with enrollment system
- **Gamification**: XP points, daily streaks, leaderboard ranking
- **Admin Panel**: Full content management for subjects, topics, quizzes, courses

### User Roles
| Role | Access |
|------|--------|
| `student` | Dashboard, quizzes, courses, performance tracking |
| `admin` | Full CRUD operations, student monitoring, analytics |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 7.2.4 | Build tool & dev server |
| React Router DOM | 7.10.1 | Client-side routing |
| Axios | 1.13.2 | HTTP client |
| Framer Motion | 12.23.26 | Animations |
| Lucide React | 0.561.0 | Icons |
| Tailwind CSS | 4.1.18 | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.18.2 | Web framework |
| Mongoose | 8.0.0 | MongoDB ODM |
| JWT | 9.0.2 | Authentication |
| Bcrypt.js | 2.4.3 | Password hashing |
| Google Generative AI | 0.1.3 | Gemini integration |
| Nodemailer | 6.9.7 | Email service |
| Compression | 1.8.1 | Response compression |

### Database & Deployment
| Component | Platform |
|-----------|----------|
| Database | MongoDB Atlas |
| Frontend | Vercel |
| Backend | Render |

---

## Project Structure

```
Studywise_Banking/
├── frontend/                          # React Vite application
│   ├── src/
│   │   ├── App.jsx                    # Main app with routing
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Global styles
│   │   ├── App.css                    # App-level styles
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── LoginPage.jsx          # Student login
│   │   │   ├── RegisterPage.jsx       # Student registration
│   │   │   ├── ProfilePage.jsx        # User profile
│   │   │   ├── ForgotPasswordPage.jsx # Password recovery
│   │   │   ├── ResetPasswordPage.jsx  # Password reset
│   │   │   ├── AboutTutor.jsx         # Tutor information
│   │   │   │
│   │   │   ├── student/               # Student pages
│   │   │   │   ├── StudentDashboard.jsx    # Main dashboard
│   │   │   │   ├── SubjectsPage.jsx        # Subject listing
│   │   │   │   ├── TopicsPage.jsx          # Topics within subject
│   │   │   │   ├── QuizListPage.jsx        # Quizzes for topic
│   │   │   │   ├── QuizPage.jsx            # Quiz taking interface
│   │   │   │   ├── ResultPage.jsx          # Quiz results
│   │   │   │   ├── TestCenterPage.jsx      # All tests view
│   │   │   │   ├── TestReviewPage.jsx      # Review attempted test
│   │   │   │   ├── CoursesPage.jsx         # Course catalog
│   │   │   │   ├── CourseDetailPage.jsx    # Course details & lectures
│   │   │   │   ├── PerformancePage.jsx     # Performance analytics
│   │   │   │   ├── LeaderboardPage.jsx     # XP rankings
│   │   │   │   ├── AIAnalysisPage.jsx      # AI insights
│   │   │   │   └── TasksPage.jsx           # To-do lists
│   │   │   │
│   │   │   └── admin/                 # Admin pages
│   │   │       ├── AdminDashboard.jsx      # Admin overview
│   │   │       ├── AdminLoginPage.jsx      # Admin login
│   │   │       ├── SubjectManagement.jsx   # CRUD subjects
│   │   │       ├── TopicManagement.jsx     # CRUD topics
│   │   │       ├── QuizManagement.jsx      # CRUD quizzes
│   │   │       ├── QuestionManagement.jsx  # CRUD questions
│   │   │       ├── CourseManagement.jsx    # CRUD courses
│   │   │       ├── StudentMonitoring.jsx   # Student analytics
│   │   │       ├── QuizAnalytics.jsx       # Quiz statistics
│   │   │       ├── TaskManagementPage.jsx  # Assign tasks
│   │   │       ├── AllTasksPage.jsx        # View all tasks
│   │   │       └── AllInactiveStudentsPage.jsx  # Inactive students
│   │   │
│   │   ├── components/                # Reusable components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # Top navigation (students)
│   │   │   │   └── BottomNavbar.jsx   # Mobile bottom nav
│   │   │   ├── ui/                    # UI primitives
│   │   │   ├── admin/                 # Admin-specific components
│   │   │   ├── ai/                    # AI analysis components
│   │   │   ├── tasks/                 # Task list components
│   │   │   └── leaderboard/           # Leaderboard components
│   │   │
│   │   ├── context/                   # React Context
│   │   │   ├── AuthContext.jsx        # Authentication state
│   │   │   └── ThemeContext.jsx       # Dark/light mode
│   │   │
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with interceptors
│   │   │
│   │   └── utils/                     # Helper functions
│   │       ├── lazyWithRetry.js       # Lazy loading with retry
│   │       └── routePreloader.js      # Route preloading
│   │
│   ├── public/                        # Static assets
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind configuration
│   └── vercel.json                    # Vercel deployment config
│
├── backend/                           # Express.js API
│   ├── src/
│   │   ├── server.js                  # Express app entry point
│   │   │
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── User.js                # User model (students & admins)
│   │   │   ├── Course.js              # Video courses with lectures
│   │   │   ├── Content.js             # Subject, Topic, Quiz, Question, Attempt
│   │   │   ├── Task.js                # Individual tasks
│   │   │   ├── GlobalTask.js          # Global to-do items
│   │   │   ├── Notification.js        # Push notifications
│   │   │   └── GlobalSettings.js      # App settings
│   │   │
│   │   ├── routes/                    # API route handlers
│   │   │   ├── authRoutes.js          # /api/auth/*
│   │   │   ├── studentRoutes.js       # /api/student/*
│   │   │   ├── adminRoutes.js         # /api/admin/*
│   │   │   ├── quizRoutes.js          # /api/quizzes/*, /api/attempts/*
│   │   │   └── aiRoutes.js            # /api/ai/*
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification, role checks
│   │   │   ├── errorMiddleware.js     # Error handling
│   │   │   └── cacheMiddleware.js     # Response caching
│   │   │
│   │   ├── services/
│   │   │   ├── aiService.js           # Gemini descriptive answer analysis
│   │   │   ├── aiAnalysisService.js   # Personalized performance analysis
│   │   │   ├── emailService.js        # Password reset emails
│   │   │   ├── youtubeService.js      # YouTube video metadata
│   │   │   └── quizCleanupService.js  # Expired quiz cleanup cron
│   │   │
│   │   └── scripts/                   # Utility scripts
│   │
│   ├── .env                           # Environment variables
│   └── package.json
│
├── .agent/workflows/                  # AI agent workflows
└── README.md
```

---

## Database Models

### User Model (`backend/src/models/User.js`)

```javascript
{
  firstName: String,           // Required
  lastName: String,            // Required
  email: String,               // Unique, lowercase
  mobile: String,              // 10-digit validation
  password: String,            // Bcrypt hashed, select: false
  gender: ['male', 'female', 'other'],
  age: Number,                 // 16-60
  status: ['preparing_fulltime', 'student', 'working_professional', 'other'],
  targetExam: String,          // Target banking exam
  city: String,
  role: ['student', 'admin'],  // Default: 'student'
  avatar: { id, url },
  
  // Enrollment System
  enrollment: {
    isPaid: Boolean,           // Paid user status
    courses: [{
      courseId: String,
      courseName: String,
      batch: String,
      enrolledAt: Date,
      duration: Number,
      durationType: ['days', 'months'],
      expiryDate: Date
    }],
    tags: [String]             // Enrollment tags
  },
  
  // Gamification
  xpPoints: Number,            // Experience points
  streakCount: Number,         // Daily activity streak
  lastActivityDate: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Course Model (`backend/src/models/Course.js`)

```javascript
{
  title: String,
  thumbnail: String,           // URL or Base64
  subject: String,
  batchName: String,
  description: String,
  
  pricing: {
    originalPrice: Number,
    currentPrice: Number,
    showPriceDrop: Boolean,
    priceDropLabel: String     // e.g., "🔥 Price Drop"
  },
  
  status: ['complete', 'ongoing', 'upcoming'],
  displayOrder: Number,        // For sorting
  isPublished: Boolean,
  
  lectures: [{
    lectureNumber: Number,
    title: String,
    youtubeLink: String,
    duration: String,
    isPublished: Boolean
  }],
  
  createdBy: ObjectId → User
}
```

### Content Models (`backend/src/models/Content.js`)

#### Subject
```javascript
{
  name: String,
  description: String,
  icon: String                 // Emoji icon, default: '📖'
}
```

#### Topic
```javascript
{
  name: String,
  description: String,
  subject: ObjectId → Subject  // Foreign key
}
```

#### Quiz
```javascript
{
  title: String,
  subject: ObjectId → Subject,
  topic: ObjectId → Topic,
  duration: Number,            // Minutes, default: 15
  difficulty: ['Easy', 'Medium', 'Hard'],
  
  // Quiz Types
  isMockTest: Boolean,
  isBigQuiz: Boolean,
  
  // Publishing
  isPublished: Boolean,
  publishedAt: Date,
  expiresAt: Date,             // 7 days from publish
  isExpired: Boolean,
  
  // Access Control
  targetAudience: ['all', 'paid', 'unpaid'],
  requiredCourse: String,
  requiredBatch: String,
  
  viewedBy: [ObjectId → User], // Notification tracking
  timePerQuestion: Number,     // Seconds, default: 60
  isActive: Boolean
}
```

#### Question
```javascript
{
  quiz: ObjectId → Quiz,
  type: ['mcq', 'descriptive'],
  text: String,
  
  // For MCQ
  options: [String],
  correctAnswer: String,
  
  // For Descriptive
  topperAnswer: String,        // Ideal answer for AI comparison
  
  order: Number
}
```

#### Attempt
```javascript
{
  user: ObjectId → User,
  quiz: ObjectId → Quiz,
  
  answers: [{
    question: ObjectId → Question,
    answer: String,
    isCorrect: Boolean
  }],
  
  // Scoring
  score: Number,               // Percentage
  totalQuestions: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  unanswered: Number,
  
  // New Marking System
  totalMarks: Number,          // +1 correct, -0.25 wrong
  maxMarks: Number,
  negativeMarks: Number,
  
  timeTaken: String,           // "MM:SS" format
  startedAt: Date,
  submittedAt: Date,
  
  // AI Analysis
  aiAnalysis: {
    overallFeedback: String,
    strengths: [String],
    weaknesses: [String],
    topicSuggestions: [{ topic, reason }],
    processedAt: Date,
    status: ['pending', 'processing', 'completed', 'failed']
  }
}
```

### Task Models

#### Task (`backend/src/models/Task.js`)
```javascript
{
  title: String,
  description: String,
  assignedTo: ObjectId → User,
  assignedBy: ObjectId → User,
  status: ['pending', 'completed'],
  dueDate: Date
}
```

#### GlobalTask (`backend/src/models/GlobalTask.js`)
```javascript
{
  content: String,
  tag: String,                 // Category tag
  createdBy: Mixed,
  completedBy: [{
    userId: ObjectId → User,
    completedAt: Date
  }],
  isActive: Boolean
}
```

---

## API Routes

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new student | Public |
| POST | `/login` | Student/admin login | Public |
| POST | `/admin/login` | Admin-specific login | Public |
| POST | `/forgot-password` | Request password reset | Public |
| GET | `/reset-password/:token` | Validate reset token | Public |
| POST | `/reset-password/:token` | Reset password | Public |
| GET | `/profile` | Get current user profile | Private |
| PUT | `/profile` | Update profile | Private |

### Student Routes (`/api/student`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Dashboard stats & data | Student |
| GET | `/ai-analysis` | AI-powered performance analysis | Student |
| GET | `/subjects` | List all subjects | Student |
| GET | `/topics/:id/quizzes` | Quizzes for a topic | Student |
| GET | `/quizzes/all` | All published quizzes (Test Center) | Student |
| GET | `/courses` | Published courses catalog | Student |
| GET | `/courses/:id` | Course details with lectures | Student |
| GET | `/enrollment` | User enrollment status | Student |
| POST | `/enrollment/update` | Update enrollment | Student |
| GET | `/global-tasks` | Global to-do list | Student |
| POST | `/global-tasks/:id/toggle` | Toggle task completion | Student |
| GET | `/tasks` | Assigned tasks | Student |
| PUT | `/tasks/:id` | Update task status | Student |
| GET | `/leaderboard` | XP-based rankings | Student |
| GET | `/notifications` | User notifications | Student |

### Quiz Routes (`/api`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/quizzes/:id/start` | Start quiz, get questions | Private |
| POST | `/quizzes/:id/autosave` | Autosave answers | Private |
| POST | `/quizzes/:id/submit` | Submit quiz | Private |
| GET | `/attempts/:id` | Get attempt result | Private |
| GET | `/attempts/:id/review` | Detailed review with answers | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Admin overview stats |
| **Subjects** |||
| GET | `/subjects` | List all subjects |
| POST | `/subjects` | Create subject |
| PUT | `/subjects/:id` | Update subject |
| DELETE | `/subjects/:id` | Delete subject (cascade) |
| **Topics** |||
| GET | `/subjects/:subjectId/topics` | Topics for subject |
| POST | `/topics` | Create topic |
| PUT | `/topics/:id` | Update topic |
| DELETE | `/topics/:id` | Delete topic |
| **Quizzes** |||
| GET | `/quizzes` | List all quizzes |
| POST | `/quizzes` | Create quiz |
| PUT | `/quizzes/:id` | Update quiz |
| DELETE | `/quizzes/:id` | Delete quiz (cascade) |
| POST | `/quizzes/:id/publish` | Publish quiz |
| GET | `/quizzes/:id/stats` | Quiz analytics |
| **Questions** |||
| GET | `/quizzes/:quizId/questions` | Questions for quiz |
| POST | `/questions` | Create question |
| PUT | `/questions/:id` | Update question |
| DELETE | `/questions/:id` | Delete question |
| **Courses** |||
| GET | `/courses` | List all courses |
| POST | `/courses` | Create course |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |
| **Students** |||
| GET | `/students` | List all students |
| GET | `/students/:id` | Student details |
| PUT | `/students/:id/enrollment` | Update enrollment |
| **Tasks** |||
| GET | `/global-tasks` | All global tasks |
| POST | `/global-tasks` | Create global task |
| DELETE | `/global-tasks/:id` | Delete global task |
| POST | `/tasks` | Assign task to student |
| GET | `/tasks/all` | All assigned tasks |

---

## Frontend Architecture

### Routing (App.jsx)

```javascript
// Public Routes
/login              → LoginPage
/admin-login        → AdminLoginPage
/register           → RegisterPage
/forgot-password    → ForgotPasswordPage
/reset-password/:token → ResetPasswordPage

// Student Routes (Protected)
/dashboard          → StudentDashboard
/subjects           → SubjectsPage
/subjects/:id/topics → TopicsPage
/topics/:id/quizzes → QuizListPage
/quiz/:quizId       → QuizPage
/result/:attemptId  → ResultPage
/tests              → TestCenterPage
/test-review/:id    → TestReviewPage
/courses            → CoursesPage
/courses/:id        → CourseDetailPage
/profile            → ProfilePage
/performance        → PerformancePage
/leaderboard        → LeaderboardPage
/analysis           → AIAnalysisPage
/tasks              → TasksPage
/about-tutor        → AboutTutor

// Admin Routes (Protected, adminOnly)
/admin              → AdminDashboard
/admin/subjects     → SubjectManagement
/admin/subjects/:id/topics → TopicManagement
/admin/quizzes      → QuizManagement
/admin/quizzes/:id/questions → QuestionManagement
/admin/quizzes/:id/stats → QuizAnalytics
/admin/courses      → CourseManagement
/admin/students     → StudentMonitoring
/admin/tasks        → TaskManagementPage
/admin/tasks/all    → AllTasksPage
/admin/inactive-students → AllInactiveStudentsPage
```

### State Management

| Context | Location | Purpose |
|---------|----------|---------|
| AuthContext | `context/AuthContext.jsx` | User auth state, login/logout |
| ThemeContext | `context/ThemeContext.jsx` | Dark/light mode toggle |

### API Service (`services/api.js`)

- **Base URL**: Configured via `VITE_API_URL` env variable
- **Interceptors**:
  - Request: Adds JWT token from localStorage
  - Response: Handles 401 (redirect to login), caches GET responses
- **Caching**: 30-second in-memory cache for GET requests
- **Retry**: 2 retries with exponential backoff for network errors

### Route Protection

```javascript
// ProtectedRoute - Checks localStorage for auth
<ProtectedRoute>           // Requires authentication
<ProtectedRoute adminOnly> // Requires admin role

// PublicRoute - Redirects authenticated users
<PublicRoute>              // Only for unauthenticated users
```

---

## Authentication Flow

### Registration
1. User submits form → `POST /api/auth/register`
2. Server validates, hashes password, creates user
3. Server generates JWT, returns user + token
4. Client stores in localStorage, updates AuthContext
5. Redirect to `/dashboard`

### Login
1. User submits credentials → `POST /api/auth/login`
2. Server validates, compares password hash
3. Server generates JWT, returns user + token
4. Client stores in localStorage, updates AuthContext
5. Redirect based on role (`/dashboard` or `/admin`)

### Token Verification
- JWT stored in localStorage as `token`
- Sent in `Authorization: Bearer <token>` header
- Backend `protect` middleware verifies on each request
- 401 response triggers logout + redirect

### Password Reset
1. Request: `POST /api/auth/forgot-password` with email
2. Server generates reset token, sends email
3. User clicks link → `GET /api/auth/reset-password/:token`
4. Submit new password → `POST /api/auth/reset-password/:token`

---

## Key Features

### Quiz System

**Scoring Formula**:
- Correct: +1 mark
- Wrong: -0.25 mark (negative marking)
- Unanswered: 0 marks
- Score = (totalMarks / maxMarks) × 100

**XP Calculation**:
```javascript
xpEarned = 10 + Math.floor(score / 10) * 5
// 10 base XP + bonus per 10% score
```

**Streak System**:
- Daily boundary: 5 AM IST (23:30 UTC previous day)
- Streak increments if last activity was yesterday
- Streak resets if missed a day
- Maintained if multiple activities same day

### AI Integration

**Descriptive Answer Analysis** (`aiService.js`):
- Uses Gemini to compare student answer with topper answer
- Returns: score, strengths, weaknesses, suggestions, feedback

**Personalized Analysis** (`aiAnalysisService.js`):
- Calculates performance trends from quiz history
- Identifies weak subjects/topics
- Generates study plan recommendations
- Shows percentile ranking

### Enrollment System

**Access Control**:
- `targetAudience: 'all'` → Everyone can access
- `targetAudience: 'paid'` → Only paid users
- `targetAudience: 'unpaid'` → Only free users
- `requiredCourse` → Must be enrolled in specific course

---

## Design System

### Colors
```css
--primary: #8A75BA        /* Purple - main brand color */
--success: #6EBCC3        /* Teal - success states */
--warning: #ED6771        /* Coral - warnings, errors */
--background: #F8F9FA     /* Light gray background */
```

### Typography
- Font: Inter, system-ui
- Mobile-first responsive design

### Components
- Bottom navigation for mobile students
- Admin sidebar navigation
- Framer Motion page transitions

---

## Deployment

### Environment Variables

**Backend (.env)**:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env)**:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### Platforms
| Component | Platform | Config File |
|-----------|----------|-------------|
| Frontend | Vercel | `vercel.json` |
| Backend | Render | - |
| Database | MongoDB Atlas | - |

---

## Important Files Reference

### Critical Backend Files
| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express app entry, middleware setup |
| `backend/src/models/User.js` | User schema with auth methods |
| `backend/src/models/Content.js` | Subject, Topic, Quiz, Question, Attempt |
| `backend/src/routes/authRoutes.js` | Authentication endpoints |
| `backend/src/routes/studentRoutes.js` | Student API endpoints |
| `backend/src/routes/adminRoutes.js` | Admin API endpoints |
| `backend/src/routes/quizRoutes.js` | Quiz taking endpoints |
| `backend/src/middleware/authMiddleware.js` | JWT verification |
| `backend/src/services/aiAnalysisService.js` | Gemini AI analysis |

### Critical Frontend Files
| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | Main app, routing, protection |
| `frontend/src/context/AuthContext.jsx` | Auth state management |
| `frontend/src/services/api.js` | Axios instance, interceptors |
| `frontend/src/pages/student/StudentDashboard.jsx` | Main student dashboard |
| `frontend/src/pages/student/QuizPage.jsx` | Quiz taking interface |
| `frontend/src/pages/admin/AdminDashboard.jsx` | Admin overview |

---

## Quick Commands

```bash
# Development
cd frontend && npm run dev    # Start frontend (port 5173)
cd backend && npm run dev     # Start backend (port 5000)

# Production Build
cd frontend && npm run build  # Build for production

# Database Scripts
cd backend && node src/scripts/seedData.js  # Seed sample data
```

---

> **Last Updated**: January 2026
> **Maintainer**: StudyWiseBanking Team
