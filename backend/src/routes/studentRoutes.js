import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import GlobalTask from '../models/GlobalTask.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
// Note: removed studentOnly so all authenticated users can access content

// @route   GET /api/student/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
router.get('/dashboard', async (req, res, next) => {
    try {
        // Get recent attempts
        const recentAttempts = await Attempt.find({ user: req.user._id })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate stats
        const allAttempts = await Attempt.find({ user: req.user._id });
        const totalAttempts = allAttempts.length;
        const averageScore = totalAttempts > 0
            ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
            : 0;

        // Get weak areas from AI analysis
        const weakAreas = [];
        const latestAttempt = await Attempt.findOne({ user: req.user._id })
            .sort({ createdAt: -1 });

        if (latestAttempt?.aiAnalysis?.topicSuggestions) {
            latestAttempt.aiAnalysis.topicSuggestions.forEach((s) => {
                weakAreas.push({ name: s.topic, score: 50 }); // Placeholder score
            });
        }

        res.json({
            success: true,
            data: {
                totalAttempts,
                averageScore,
                weakAreas: weakAreas.slice(0, 3),
                recentAttempts: recentAttempts.map((a) => ({
                    id: a._id,
                    quizName: a.quiz?.title,
                    score: a.score,
                    date: a.createdAt.toISOString().split('T')[0],
                })),
                recommendations: [], // TODO: AI-powered recommendations
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

export default router;
