import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorMiddleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);
router.use(adminOnly);

// ============ Dashboard ============

router.get('/dashboard', async (req, res, next) => {
    try {
        const [totalStudents, totalSubjects, totalQuizzes, totalAttempts] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Subject.countDocuments(),
            Quiz.countDocuments(),
            Attempt.countDocuments(),
        ]);

        const recentAttempts = await Attempt.find()
            .populate('user', 'firstName lastName')
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalStudents,
                totalSubjects,
                totalQuizzes,
                totalAttempts,
                recentAttempts: recentAttempts.map((a) => ({
                    id: a._id,
                    studentName: `${a.user?.firstName} ${a.user?.lastName}`,
                    quizTitle: a.quiz?.title,
                    score: a.score,
                    date: a.createdAt.toISOString().split('T')[0],
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

// ============ Subjects CRUD ============

router.get('/subjects', async (req, res, next) => {
    try {
        const subjects = await Subject.find().populate('topicCount');
        res.json({
            success: true,
            data: subjects.map((s) => ({ ...s.toObject(), topicCount: s.topicCount || 0 })),
        });
    } catch (error) { next(error); }
});

router.post('/subjects', async (req, res, next) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (error) { next(error); }
});

router.put('/subjects/:id', async (req, res, next) => {
    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!subject) throw new NotFoundError('Subject');
        res.json({ success: true, data: subject });
    } catch (error) { next(error); }
});

router.delete('/subjects/:id', async (req, res, next) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        await Topic.deleteMany({ subject: req.params.id });
        res.json({ success: true, message: 'Subject deleted' });
    } catch (error) { next(error); }
});

// ============ Topics CRUD ============

router.get('/subjects/:subjectId/topics', async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.subjectId);
        const topics = await Topic.find({ subject: req.params.subjectId }).populate('quizCount');
        res.json({
            success: true,
            data: { subject, topics: topics.map((t) => ({ ...t.toObject(), quizCount: t.quizCount || 0 })) },
        });
    } catch (error) { next(error); }
});

router.post('/subjects/:subjectId/topics', async (req, res, next) => {
    try {
        const topic = await Topic.create({ ...req.body, subject: req.params.subjectId });
        res.status(201).json({ success: true, data: topic });
    } catch (error) { next(error); }
});

router.put('/topics/:id', async (req, res, next) => {
    try {
        const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!topic) throw new NotFoundError('Topic');
        res.json({ success: true, data: topic });
    } catch (error) { next(error); }
});

router.delete('/topics/:id', async (req, res, next) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Topic deleted' });
    } catch (error) { next(error); }
});

// ============ Quizzes CRUD ============

router.get('/quizzes', async (req, res, next) => {
    try {
        const quizzes = await Quiz.find()
            .populate('subject', 'name')
            .populate('topic', 'name')
            .populate('questionCount');
        res.json({
            success: true,
            data: quizzes.map((q) => ({
                ...q.toObject(),
                subjectName: q.subject?.name,
                topicName: q.topic?.name,
                questionCount: q.questionCount || 0,
            })),
        });
    } catch (error) { next(error); }
});

router.post('/quizzes', async (req, res, next) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json({ success: true, data: quiz });
    } catch (error) { next(error); }
});

router.put('/quizzes/:id', async (req, res, next) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!quiz) throw new NotFoundError('Quiz');
        res.json({ success: true, data: quiz });
    } catch (error) { next(error); }
});

router.delete('/quizzes/:id', async (req, res, next) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        await Question.deleteMany({ quiz: req.params.id });
        res.json({ success: true, message: 'Quiz deleted' });
    } catch (error) { next(error); }
});

// ============ Questions CRUD ============

router.get('/quizzes/:quizId/questions', async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        const questions = await Question.find({ quiz: req.params.quizId }).sort({ order: 1 });
        res.json({ success: true, data: { quiz, questions } });
    } catch (error) { next(error); }
});

router.post('/quizzes/:quizId/questions', async (req, res, next) => {
    try {
        const count = await Question.countDocuments({ quiz: req.params.quizId });
        const question = await Question.create({ ...req.body, quiz: req.params.quizId, order: count });
        res.status(201).json({ success: true, data: question });
    } catch (error) { next(error); }
});

router.put('/questions/:id', async (req, res, next) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) throw new NotFoundError('Question');
        res.json({ success: true, data: question });
    } catch (error) { next(error); }
});

router.delete('/questions/:id', async (req, res, next) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) { next(error); }
});

// ============ Students ============

router.get('/students', async (req, res, next) => {
    try {
        const students = await User.find({ role: 'student' });
        const studentsWithStats = await Promise.all(
            students.map(async (s) => {
                const attempts = await Attempt.find({ user: s._id });
                const avgScore = attempts.length > 0
                    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
                    : 0;
                return { ...s.toObject(), totalAttempts: attempts.length, avgScore };
            })
        );
        res.json({ success: true, data: studentsWithStats });
    } catch (error) { next(error); }
});

router.get('/students/:id/attempts', async (req, res, next) => {
    try {
        const attempts = await Attempt.find({ user: req.params.id })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: attempts.map((a) => ({
                _id: a._id,
                quizTitle: a.quiz?.title,
                score: a.score,
                date: a.createdAt.toISOString().split('T')[0],
                aiAnalysis: a.aiAnalysis?.status === 'completed',
            })),
        });
    } catch (error) { next(error); }
});

export default router;
