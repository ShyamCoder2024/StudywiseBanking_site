import express from 'express';
import { protect, studentOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(studentOnly);

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
// @desc    Get quizzes for a topic
// @access  Private
router.get('/topics/:id/quizzes', async (req, res, next) => {
    try {
        const topic = await Topic.findById(req.params.id);
        const quizzes = await Quiz.find({ topic: req.params.id, isActive: true }).populate('questionCount');

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

export default router;
