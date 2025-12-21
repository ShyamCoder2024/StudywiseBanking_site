import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import GlobalTask from '../models/GlobalTask.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
// Note: removed studentOnly so all authenticated users can access content

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data with comprehensive metrics
// @access  Private (Student)
router.get('/dashboard', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get all attempts for this user
        const allAttempts = await Attempt.find({ user: userId })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 });

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


// @route   GET /api/subjects
// @desc    Get all subjects (for students)
// @access  Private
router.get('/subjects', async (req, res, next) => {
    try {
        const subjects = await Subject.find().populate('topicCount');

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
        const subject = await Subject.findById(req.params.id);
        const topics = await Topic.find({ subject: req.params.id }).populate('quizCount');

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
// @desc    Get quizzes for a topic (only published quizzes)
// @access  Private
router.get('/topics/:id/quizzes', async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);
        // Only show published quizzes to students
        const quizzes = await Quiz.find({
            topic: req.params.id,
            isPublished: true
        }).populate('questionCount');

        res.json({
            success: true,
            data: {
                topic: { name: topic?.name, subjectId: topic?.subject },
                quizzes: quizzes.map((q) => ({
                    _id: q._id,
                    title: q.title,
                    duration: q.duration,
                    difficulty: q.difficulty,
                    questionCount: q.questionCount || 0,
                })),
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
            .sort({ createdAt: -1 });

        // Get user's attempts to determine which quizzes are completed
        const attempts = await Attempt.find({ user: req.user._id });
        const completedQuizIds = attempts.map(a => a.quiz.toString());

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

            if (completedQuizIds.includes(q._id.toString())) {
                // Find the attempt for this quiz
                const attempt = attempts.find(a => a.quiz.toString() === q._id.toString());
                quizData.score = attempt?.score;
                quizData.attemptId = attempt?._id;
                completedQuizzes.push(quizData);
            } else {
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
        const tasks = await Task.find({ assignedTo: req.user._id }).sort({ createdAt: -1 });
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
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
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

router.get('/global-tasks', async (req, res, next) => {
    try {
        const tasks = await GlobalTask.find({ isActive: true }).sort({ createdAt: -1 });
        // Add a 'completed' flag for this user
        const tasksWithStatus = tasks.map(t => ({
            ...t.toObject(),
            isCompleted: t.completedBy.includes(req.user._id)
        }));
        res.json({ success: true, data: tasksWithStatus });
    } catch (error) { next(error); }
});

router.patch('/global-tasks/:id/toggle', async (req, res, next) => {
    try {
        const task = await GlobalTask.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const userId = req.user._id;
        const isCompleted = task.completedBy.includes(userId);

        if (isCompleted) {
            task.completedBy = task.completedBy.filter(id => id.toString() !== userId.toString());
        } else {
            task.completedBy.push(userId);
        }
        await task.save();

        res.json({ success: true, data: { isCompleted: !isCompleted } });
    } catch (error) { next(error); }
});

// ============ Leaderboard ============

// @route   GET /api/student/leaderboard
// @desc    Get leaderboard ranked by XP points
// @access  Private
router.get('/leaderboard', async (req, res, next) => {
    try {
        // Get top 50 students by XP
        const topStudents = await User.find({ role: 'student' })
            .select('firstName lastName xpPoints streakCount avatar')
            .sort({ xpPoints: -1 })
            .limit(50);

        // Get current user's rank
        const currentUserId = req.user._id;
        const allStudentsByXP = await User.find({ role: 'student' })
            .select('_id xpPoints')
            .sort({ xpPoints: -1 });

        let currentUserRank = 0;
        allStudentsByXP.forEach((student, index) => {
            if (student._id.toString() === currentUserId.toString()) {
                currentUserRank = index + 1;
            }
        });

        // Format leaderboard data
        const leaderboard = topStudents.map((student, index) => ({
            rank: index + 1,
            _id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            xpPoints: student.xpPoints || 0,
            streakCount: student.streakCount || 0,
            avatar: student.avatar,
            isCurrentUser: student._id.toString() === currentUserId.toString()
        }));

        res.json({
            success: true,
            data: {
                leaderboard,
                currentUserRank,
                totalStudents: allStudentsByXP.length
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;

