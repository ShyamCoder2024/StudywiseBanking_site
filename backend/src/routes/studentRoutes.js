import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { cacheMiddleware, CACHE_DURATIONS } from '../middleware/cacheMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import GlobalTask from '../models/GlobalTask.js';
import { generateStudentAnalysis } from '../services/aiAnalysisService.js';
import Course from '../models/Course.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
// Note: removed studentOnly so all authenticated users can access content

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data with comprehensive metrics
// @access  Private (Student)
// CACHED: Dashboard data cached for 30 seconds per user
router.get('/dashboard', cacheMiddleware({ duration: CACHE_DURATIONS.SHORT, perUser: true }), async (req, res, next) => {
    try {
        const userId = req.user._id;

        // OPTIMIZED: Use lean() for faster queries and limit fields
        const allAttempts = await Attempt.find({ user: userId })
            .select('quiz score totalQuestions correctAnswers aiAnalysis createdAt')
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .limit(20)  // Only fetch recent 20 for dashboard
            .lean();

        const totalAttempts = allAttempts.length;

        // Calculate totals for accuracy
        let totalQuestions = 0;
        let totalCorrect = 0;
        allAttempts.forEach(a => {
            totalQuestions += a.totalQuestions || 0;
            totalCorrect += a.correctAnswers || 0;
        });

        // Accuracy calculation
        const accuracy = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        // Average score across attempts
        const averageScore = totalAttempts > 0
            ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
            : 0;

        // Performance Graph: Last 7 attempts
        const performanceGraph = allAttempts.slice(0, 7).reverse().map(a => ({
            date: a.createdAt.toISOString().split('T')[0],
            score: a.score,
            quizTitle: a.quiz?.title || 'Quiz'
        }));

        // Get weak areas from AI analysis of recent attempts
        const weakAreas = [];
        const strengths = [];
        allAttempts.slice(0, 5).forEach(attempt => {
            if (attempt.aiAnalysis?.weaknesses) {
                weakAreas.push(...attempt.aiAnalysis.weaknesses);
            }
            if (attempt.aiAnalysis?.strengths) {
                strengths.push(...attempt.aiAnalysis.strengths);
            }
        });

        // AI-Suggested Study Hours based on accuracy
        let suggestedStudyHours = '2-3';
        let studyRecommendation = 'Maintain your current pace';
        if (accuracy < 50) {
            suggestedStudyHours = '4-5';
            studyRecommendation = 'Focus more on fundamentals and practice daily';
        } else if (accuracy < 70) {
            suggestedStudyHours = '3-4';
            studyRecommendation = 'Good progress! Work on weak areas identified below';
        } else if (accuracy < 85) {
            suggestedStudyHours = '2-3';
            studyRecommendation = 'Great performance! Focus on speed and mock tests';
        } else {
            suggestedStudyHours = '1-2';
            studyRecommendation = 'Excellent! Maintain with revision and full-length mocks';
        }

        // Recent attempts (last 5)
        const recentAttempts = allAttempts.slice(0, 5).map(a => ({
            id: a._id,
            quizName: a.quiz?.title,
            score: a.score,
            date: a.createdAt.toISOString().split('T')[0],
        }));

        // Get user's XP and streak from User model
        const user = req.user;

        res.json({
            success: true,
            data: {
                // User Stats
                xpPoints: user.xpPoints || 0,
                streakCount: user.streakCount || 0,
                accuracy,
                averageScore,
                totalAttempts,
                totalQuestions,
                totalCorrect,

                // Performance Graph (for chart)
                performanceGraph,

                // AI Insights
                suggestedStudyHours,
                studyRecommendation,
                weakAreas: [...new Set(weakAreas)].slice(0, 3),
                strengths: [...new Set(strengths)].slice(0, 3),

                // Recent Activity
                recentAttempts,

                // Recommendations based on performance
                recommendations: weakAreas.length > 0
                    ? [`Focus on: ${[...new Set(weakAreas)].slice(0, 2).join(', ')}`]
                    : ['Take more quizzes to get personalized recommendations'],
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/student/ai-analysis
// @desc    Get AI-powered personalized performance analysis (Gemini)
// @access  Private
// CACHED: AI analysis is expensive (calls Gemini API) - cache for 5 minutes per user
router.get('/ai-analysis', cacheMiddleware({ duration: CACHE_DURATIONS.LONG, perUser: true }), async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Generate AI analysis using Gemini
        const analysis = await generateStudentAnalysis(userId);

        if (!analysis) {
            return res.status(500).json({
                success: false,
                error: { message: 'Failed to generate AI analysis' }
            });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('AI Analysis error:', error);
        next(error);
    }
});

// @route   GET /api/subjects
// @desc    Get all subjects (for students)
// @access  Private
// CACHED: Subjects rarely change, cache for 5 minutes
router.get('/subjects', cacheMiddleware({ duration: CACHE_DURATIONS.LONG }), async (req, res, next) => {
    try {
        // OPTIMIZED: Use lean() and select only needed fields
        const subjects = await Subject.find()
            .select('name description icon')
            .populate('topicCount')
            .lean();

        res.json({
            success: true,
            data: subjects.map((s) => ({
                _id: s._id,
                name: s.name,
                description: s.description,
                icon: s.icon,
                topicCount: s.topicCount || 0,
            })),
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/subjects/:id/topics
// @desc    Get topics for a subject
// @access  Private
router.get('/subjects/:id/topics', async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id).lean();
        const topics = await Topic.find({ subject: req.params.id }).populate('quizCount').lean();

        res.json({
            success: true,
            data: {
                subject: { name: subject?.name },
                topics: topics.map((t) => ({
                    _id: t._id,
                    name: t.name,
                    description: t.description,
                    quizCount: t.quizCount || 0,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/topics/:id/quizzes
// @desc    Get quizzes for a topic (only published quizzes) with completion status
// @access  Private
router.get('/topics/:id/quizzes', async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id).lean();
        const userId = req.user._id;

        // Only show published quizzes to students
        const quizzes = await Quiz.find({
            topic: req.params.id,
            isPublished: true
        }).populate('questionCount').lean();

        // Get user's attempts for these quizzes
        const quizIds = quizzes.map(q => q._id);
        const attempts = await Attempt.find({
            user: userId,
            quiz: { $in: quizIds }
        }).lean();

        // Create a map of quiz ID to attempt
        const attemptMap = {};
        attempts.forEach(a => {
            attemptMap[a.quiz.toString()] = {
                attemptId: a._id,
                score: a.score,
                submittedAt: a.submittedAt
            };
        });

        res.json({
            success: true,
            data: {
                topic: { name: topic?.name, subjectId: topic?.subject },
                quizzes: quizzes.map((q) => {
                    const attemptInfo = attemptMap[q._id.toString()];
                    return {
                        _id: q._id,
                        title: q.title,
                        duration: q.duration,
                        difficulty: q.difficulty,
                        questionCount: q.questionCount || 0,
                        isCompleted: !!attemptInfo,
                        attemptId: attemptInfo?.attemptId || null,
                        score: attemptInfo?.score || null,
                        completedAt: attemptInfo?.submittedAt || null
                    };
                }),
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/student/quizzes/all
// @desc    Get ALL published quizzes for the Test Center (organized by status)
// @access  Private
router.get('/quizzes/all', async (req, res, next) => {
    try {
        // Get all published quizzes
        const quizzes = await Quiz.find({ isPublished: true })
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate('questionCount')
            .sort({ createdAt: -1 })
            .lean();

        // Get user's SUBMITTED attempts only (not in-progress ones)
        // An attempt is considered complete only if submittedAt exists
        // Only fetch the fields we need for performance
        const attempts = await Attempt.find({
            user: req.user._id,
            submittedAt: { $exists: true, $ne: null }  // Only completed/submitted attempts
        })
            .select('quiz score submittedAt')  // Only fetch needed fields
            .lean();

        // Create a map of quiz ID to completed attempt
        const completedAttemptMap = {};
        attempts.forEach(a => {
            // Store the most recent attempt for each quiz
            const quizId = a.quiz.toString();
            if (!completedAttemptMap[quizId] || new Date(a.submittedAt) > new Date(completedAttemptMap[quizId].submittedAt)) {
                completedAttemptMap[quizId] = a;
            }
        });

        // Organize quizzes
        const activeQuizzes = [];
        const completedQuizzes = [];

        quizzes.forEach(q => {
            const quizData = {
                _id: q._id,
                title: q.title,
                subjectName: q.subject?.name || 'General',
                topicName: q.topic?.name || 'Mixed Topics',
                duration: q.duration,
                difficulty: q.difficulty,
                questionCount: q.questionCount || 0,
                isMockTest: q.isMockTest,
                isBigQuiz: q.isBigQuiz,
                createdAt: q.createdAt,
            };

            const completedAttempt = completedAttemptMap[q._id.toString()];

            if (completedAttempt) {
                // Quiz has a submitted attempt - it's completed
                quizData.score = completedAttempt.score;
                quizData.attemptId = completedAttempt._id;
                quizData.completedAt = completedAttempt.submittedAt;
                completedQuizzes.push(quizData);
            } else {
                // No submitted attempt - quiz is active
                activeQuizzes.push(quizData);
            }
        });

        res.json({
            success: true,
            data: {
                active: activeQuizzes,
                completed: completedQuizzes,
                totalActive: activeQuizzes.length,
                totalCompleted: completedQuizzes.length,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/student/tasks
// @desc    Get assigned tasks
// @access  Private
router.get('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: tasks });
    } catch (error) { next(error); }
});

// @route   PATCH /api/student/tasks/:taskId/complete
// @desc    Toggle task completion
// @access  Private
router.patch('/tasks/:id/complete', async (req, res, next) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        task.status = task.status === 'completed' ? 'pending' : 'completed';
        await task.save();

        res.json({ success: true, data: task });
    } catch (error) { next(error); }
});

// @route   GET /api/student/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
        res.json({ success: true, data: notifications });
    } catch (error) { next(error); }
});

// @route   PATCH /api/student/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/notifications/:id/read', async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) { next(error); }
});

// ============ Global Tasks ============

// Helper: Get today's 5AM reset time in IST (Indian Standard Time)
// IST is UTC + 5:30
// 5:00 AM IST = Previous Day 23:30 UTC
const getTodayResetTime = () => {
    const now = new Date();

    // Shift current time to IST frame (UTC + 5.5 hours)
    // We work with "Virtual IST" time by adding the offset to UTC timestamp
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const virtualISTTime = new Date(now.getTime() + IST_OFFSET_MS);

    // Create a reset target at 5:00 AM in this Virtual IST frame
    const resetTargetVirtual = new Date(virtualISTTime);
    resetTargetVirtual.setUTCHours(5, 0, 0, 0);

    // If currently before 5 AM IST, the relevant reset was yesterday
    if (virtualISTTime < resetTargetVirtual) {
        resetTargetVirtual.setUTCDate(resetTargetVirtual.getUTCDate() - 1);
    }

    // Convert back from Virtual IST to Real UTC
    // Real = Virtual - Offset
    const resetTimeReal = new Date(resetTargetVirtual.getTime() - IST_OFFSET_MS);

    return resetTimeReal;
};

router.get('/global-tasks', async (req, res, next) => {
    try {
        const tasks = await GlobalTask.find({ isActive: true }).sort({ createdAt: -1 });
        const userId = req.user._id;
        const resetTime = getTodayResetTime();

        // Add a 'completed' flag for this user - only if completed after today's reset
        const tasksWithStatus = tasks.map(t => {
            const taskObj = t.toObject();
            const userCompletion = taskObj.completedBy?.find(
                c => {
                    const isUser = c.userId?.toString() === userId.toString();
                    const isAfterReset = new Date(c.completedAt) >= resetTime;
                    return isUser && isAfterReset;
                }
            );
            return {
                ...taskObj,
                isCompleted: !!userCompletion
            };
        });

        // Calculate progress
        const completedCount = tasksWithStatus.filter(t => t.isCompleted).length;
        const totalCount = tasksWithStatus.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        res.json({
            success: true,
            data: tasksWithStatus,
            progress: {
                completed: completedCount,
                total: totalCount,
                percent: progressPercent
            }
        });
    } catch (error) { next(error); }
});

router.patch('/global-tasks/:id/toggle', async (req, res, next) => {
    try {
        const task = await GlobalTask.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const userId = req.user._id;
        const resetTime = getTodayResetTime();

        // Check if user completed after today's reset
        const existingCompletionIndex = task.completedBy.findIndex(
            c => c.userId?.toString() === userId.toString() && new Date(c.completedAt) >= resetTime
        );

        const isCompleted = existingCompletionIndex !== -1;

        if (isCompleted) {
            // Remove ALL completions for this user for today (fixes duplicate bug)
            task.completedBy = task.completedBy.filter(c =>
                !(c.userId?.toString() === userId.toString() && new Date(c.completedAt) >= resetTime)
            );
        } else {
            // Add new completion
            task.completedBy.push({
                userId: userId,
                completedAt: new Date()
            });
        }
        await task.save();

        // Calculate updated progress for all tasks (so frontend can verify)
        const allTasks = await GlobalTask.find({ isActive: true });
        let completedCount = 0;
        allTasks.forEach(t => {
            const userCompletion = t.completedBy?.find(
                c => c.userId?.toString() === userId.toString() && new Date(c.completedAt) >= resetTime
            );
            if (userCompletion) completedCount++;
        });

        res.json({
            success: true,
            data: { isCompleted: !isCompleted },
            progress: {
                completed: completedCount,
                total: allTasks.length,
                percent: allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0
            }
        });
    } catch (error) { next(error); }
});

// ============ Leaderboard ============

// @route   GET /api/student/leaderboard
// @desc    Get leaderboard ranked by XP points and test performance
// @access  Private
// CACHED: Leaderboard cached for 30 seconds to reduce aggregation load
router.get('/leaderboard', cacheMiddleware({ duration: CACHE_DURATIONS.SHORT }), async (req, res, next) => {
    try {
        // Get all non-admin users
        const allUsers = await User.find({ role: { $ne: 'admin' } })
            .select('firstName lastName xpPoints streakCount avatar')
            .lean();

        // Get attempt stats for all users
        const attempts = await Attempt.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalAttempts: { $sum: 1 },
                    avgScore: { $avg: '$score' },
                    totalCorrect: { $sum: '$correctAnswers' },
                    totalQuestions: { $sum: '$totalQuestions' }
                }
            }
        ]);

        // Create a map of user stats
        const statsMap = {};
        attempts.forEach(stat => {
            statsMap[stat._id.toString()] = {
                totalAttempts: stat.totalAttempts || 0,
                avgScore: Math.round(stat.avgScore || 0),
                accuracy: stat.totalQuestions > 0
                    ? Math.round((stat.totalCorrect / stat.totalQuestions) * 100)
                    : 0
            };
        });

        // Combine user data with stats - INCLUDE ALL STUDENTS even with 0 activity
        const studentsWithStats = allUsers
            .filter(user => user.firstName || user.lastName) // Only filter out completely empty names
            .map(user => {
                const userStats = statsMap[user._id.toString()] || { totalAttempts: 0, avgScore: 0, accuracy: 0 };
                return {
                    _id: user._id,
                    name: `${user.firstName || 'Student'} ${user.lastName || ''}`.trim(),
                    xpPoints: user.xpPoints || 0,
                    streakCount: user.streakCount || 0,
                    avatar: user.avatar,
                    testsCompleted: userStats.totalAttempts,
                    avgScore: userStats.avgScore,
                    accuracy: userStats.accuracy
                };
            });

        // Sort by XP points (descending) - PRIMARY ranking by XP only
        // If XP is equal, sort by tests completed as tiebreaker
        studentsWithStats.sort((a, b) => {
            // First by XP points (descending)
            if (b.xpPoints !== a.xpPoints) return b.xpPoints - a.xpPoints;
            // Then by tests completed (descending)
            if (b.testsCompleted !== a.testsCompleted) return b.testsCompleted - a.testsCompleted;
            // Then by name alphabetically
            return a.name.localeCompare(b.name);
        });

        // Get current user's rank
        const currentUserId = req.user._id.toString();
        let currentUserRank = 0;
        let currentUserInList = false;

        studentsWithStats.forEach((student, index) => {
            if (student._id.toString() === currentUserId) {
                currentUserRank = index + 1;
                currentUserInList = true;
            }
        });

        // Format leaderboard data (top 50)
        let leaderboard = studentsWithStats.slice(0, 50).map((student, index) => ({
            rank: index + 1,
            _id: student._id,
            name: student.name || 'Student',
            xpPoints: student.xpPoints,
            streakCount: student.streakCount,
            testsCompleted: student.testsCompleted,
            avgScore: student.avgScore,
            avatar: student.avatar,
            isCurrentUser: student._id.toString() === currentUserId
        }));

        // CRITICAL: If leaderboard is empty, add the current user
        if (leaderboard.length === 0) {
            const currentUser = req.user;
            leaderboard = [{
                rank: 1,
                _id: currentUser._id,
                name: `${currentUser.firstName || 'You'} ${currentUser.lastName || ''}`.trim(),
                xpPoints: currentUser.xpPoints || 0,
                streakCount: currentUser.streakCount || 0,
                testsCompleted: 0,
                avgScore: 0,
                avatar: currentUser.avatar,
                isCurrentUser: true
            }];
            currentUserRank = 1;
        }

        res.json({
            success: true,
            data: {
                leaderboard,
                currentUserRank: currentUserRank || 1,
                totalStudents: Math.max(studentsWithStats.length, 1)
            }
        });
    } catch (error) {
        next(error);
    }
});

// ============ AI-Powered Video Recommendations ============

import { getPersonalizedVideos, clearVideoCache } from '../services/youtubeService.js';

// @route   GET /api/student/videos
// @desc    Get AI-personalized video recommendations from tutor's YouTube channel
// @access  Private
router.get('/videos', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get user's weak areas from their attempts
        const allAttempts = await Attempt.find({ user: userId })
            .populate('quiz', 'title subject')
            .sort({ createdAt: -1 });

        // Determine weak subjects based on low-scoring attempts
        const subjectScores = {};
        allAttempts.forEach(attempt => {
            const subject = attempt.quiz?.subject;
            if (subject) {
                if (!subjectScores[subject]) {
                    subjectScores[subject] = { total: 0, count: 0 };
                }
                subjectScores[subject].total += attempt.score;
                subjectScores[subject].count += 1;
            }
        });

        // Find weak subjects (average score < 70%)
        const weakSubjects = [];
        Object.keys(subjectScores).forEach(subject => {
            const avg = subjectScores[subject].total / subjectScores[subject].count;
            if (avg < 70) {
                weakSubjects.push(subject.toUpperCase());
            }
        });

        // Also check AI analysis for weak areas
        const aiWeakAreas = [];
        allAttempts.slice(0, 5).forEach(attempt => {
            if (attempt.aiAnalysis?.weaknesses) {
                aiWeakAreas.push(...attempt.aiAnalysis.weaknesses);
            }
        });

        // Combine weak subjects from scores and AI analysis
        const allWeakAreas = [...new Set([...weakSubjects, ...aiWeakAreas.map(w => w.toUpperCase())])];

        // Get personalized videos from YouTube using AI
        const result = await getPersonalizedVideos(allWeakAreas, 20);

        res.json({
            success: true,
            data: {
                videos: result.videos,
                totalVideos: result.totalVideos || result.videos.length,
                recommendedCount: result.recommendedCount,
                weakSubjects: allWeakAreas,
                source: 'YouTube Channel: Study Wise Banking',
                aiPowered: true
            }
        });
    } catch (error) {
        console.error('Error fetching personalized videos:', error);
        next(error);
    }
});

// @route   POST /api/student/videos/refresh
// @desc    Force refresh of video cache
// @access  Private
router.post('/videos/refresh', async (req, res, next) => {
    try {
        clearVideoCache();
        res.json({ success: true, message: 'Video cache cleared. Next request will fetch fresh videos.' });
    } catch (error) {
        next(error);
    }
});

// ============ Global Settings (Public Read) ============

import GlobalSettings from '../models/GlobalSettings.js';

// @route   GET /api/student/settings/:key
// @desc    Get a public setting value (like upcoming exam info)
// @access  Private
router.get('/settings/:key', async (req, res, next) => {
    try {
        const setting = await GlobalSettings.findOne({ key: req.params.key });
        res.json({ success: true, data: setting?.value || null });
    } catch (error) { next(error); }
});

// @route   GET /api/student/enrollment
// @desc    Get current user's enrollment status
// @access  Private
// CACHED: Enrollment status cached for 1 minute per user
router.get('/enrollment', cacheMiddleware({ duration: CACHE_DURATIONS.MEDIUM, perUser: true }), async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('enrollment').lean();
        res.json({
            success: true,
            data: {
                isPaid: user?.enrollment?.isPaid || false,
                courses: user?.enrollment?.courses || [],
                tags: user?.enrollment?.tags || []
            }
        });
    } catch (error) { next(error); }
});

// @route   GET /api/student/courses
// @desc    Get available courses for enrollment display
// @access  Private
router.get('/courses', async (req, res, next) => {
    try {
        const coursesSetting = await GlobalSettings.findOne({ key: 'available_courses' });

        const defaultCourses = [
            { id: 'banking-complete-2024', name: 'Complete Banking Course 2024', price: '₹4,999', features: ['Full syllabus', '200+ quizzes', 'AI analysis'] },
            { id: 'sbi-po-2024', name: 'SBI PO 2024', price: '₹2,999', features: ['SBI focused', '100+ quizzes', 'Mock tests'] },
            { id: 'ibps-clerk-2024', name: 'IBPS Clerk 2024', price: '₹1,999', features: ['Clerk pattern', '80+ quizzes'] },
            { id: 'rbi-grade-b', name: 'RBI Grade B', price: '₹5,999', features: ['Premium content', 'Phase 1 & 2'] }
        ];

        // Get user's enrolled courses
        const user = await User.findById(req.user._id);
        const enrolledCourseIds = user?.enrollment?.courses?.map(c => c.courseId) || [];

        const courses = (coursesSetting?.value || defaultCourses).map(course => ({
            ...course,
            isEnrolled: enrolledCourseIds.includes(course.id)
        }));

        res.json({ success: true, data: courses });
    } catch (error) { next(error); }
});

// ============ Video Courses (Private YouTube) ============

// Get all published video courses
// OPTIMIZED: Cache for 30 seconds, select only needed fields
router.get('/video-courses', cacheMiddleware({ duration: CACHE_DURATIONS.SHORT }), async (req, res, next) => {
    try {
        // Select only needed fields for the course list (exclude full lectures array for performance)
        const courses = await Course.find({ isPublished: true })
            .select('title thumbnail subject batchName description pricing status displayOrder lectures')
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();

        // Transform data for frontend
        const coursesForStudent = courses.map(course => {
            // Calculate discount percentage
            let discountPercent = 0;
            const originalPrice = course.pricing?.originalPrice || 0;
            const currentPrice = course.pricing?.currentPrice || 0;
            if (originalPrice > currentPrice && originalPrice > 0) {
                discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
            }

            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail || '', // Send thumbnail as-is
                subject: course.subject,
                batchName: course.batchName,
                description: (course.description || '').substring(0, 100),
                lectureCount: course.lectures?.length || 0,
                pricing: {
                    originalPrice,
                    currentPrice,
                    showPriceDrop: course.pricing?.showPriceDrop || false,
                    priceDropLabel: course.pricing?.priceDropLabel || '🔥 Price Drop',
                    discountPercent
                },
                status: course.status || 'ongoing',
                displayOrder: course.displayOrder || 0
            };
        });

        res.json({ success: true, data: coursesForStudent });
    } catch (error) { next(error); }
});

// Get single course with lectures (enrollment check for SPECIFIC course)
// CACHED: Per-user cache for 5 minutes (enrollment status varies per user)
router.get('/video-courses/:id', cacheMiddleware({ duration: CACHE_DURATIONS.COURSE, perUser: true }), async (req, res, next) => {
    try {
        // OPTIMIZED: Run both queries in parallel with .lean() for faster response
        const [course, user] = await Promise.all([
            Course.findById(req.params.id).select('title thumbnail subject batchName description lectures isPublished').lean(),
            User.findById(req.user._id).select('enrollment').lean()
        ]);

        if (!course || !course.isPublished) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if user is enrolled in THIS specific course
        const isPaidUser = user?.enrollment?.isPaid || false;
        const enrolledCourseIds = user?.enrollment?.courses?.map(c => c.courseId) || [];

        // User must be paid AND enrolled in this specific course
        const isEnrolledInThisCourse = isPaidUser && enrolledCourseIds.includes(course._id.toString());

        // OPTIMIZED: Build response efficiently
        const lectures = course.lectures || [];
        const courseData = {
            _id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            subject: course.subject,
            batchName: course.batchName,
            description: course.description,
            lectureCount: lectures.length,
            isPaid: isPaidUser,
            isEnrolled: isEnrolledInThisCourse,
            lectures: lectures.map(lecture => ({
                _id: lecture._id,
                lectureNumber: lecture.lectureNumber,
                title: lecture.title,
                duration: lecture.duration,
                isPublished: lecture.isPublished,
                // Only include YouTube link if user is enrolled in THIS course
                youtubeLink: isEnrolledInThisCourse ? lecture.youtubeLink : null,
                isLocked: !isEnrolledInThisCourse
            }))
        };

        res.json({ success: true, data: courseData });
    } catch (error) { next(error); }
});

// Get lecture link (requires enrollment in THIS SPECIFIC course)
router.get('/video-courses/:id/lectures/:lectureId', async (req, res, next) => {
    try {
        const courseId = req.params.id;

        // Check if user is enrolled in THIS specific course
        const user = await User.findById(req.user._id);
        const isPaidUser = user?.enrollment?.isPaid || false;
        const enrolledCourseIds = user?.enrollment?.courses?.map(c => c.courseId) || [];
        const isEnrolledInThisCourse = isPaidUser && enrolledCourseIds.includes(courseId);

        // Must be enrolled in this specific course
        if (!isEnrolledInThisCourse) {
            return res.status(403).json({
                success: false,
                message: 'Please enroll in this course to access content',
                requiresEnrollment: true,
                courseId: courseId
            });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.isPublished) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const lecture = course.lectures.id(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        res.json({
            success: true,
            data: {
                lectureNumber: lecture.lectureNumber,
                title: lecture.title,
                youtubeLink: lecture.youtubeLink,
                duration: lecture.duration
            }
        });
    } catch (error) { next(error); }
});

export default router;

