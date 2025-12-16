import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { NotFoundError } from '../middleware/errorMiddleware.js';
import Notification from '../models/Notification.js';
import GlobalTask from '../models/GlobalTask.js';

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
        // Map subjectId/topicId to subject/topic for proper schema matching
        const quizData = {
            title: req.body.title,
            subject: req.body.subjectId || req.body.subject,
            topic: req.body.topicId || req.body.topic,
            duration: req.body.duration,
            difficulty: req.body.difficulty,
            isMockTest: req.body.isMockTest,
            isBigQuiz: req.body.isBigQuiz,
            timePerQuestion: req.body.timePerQuestion,
        };
        const quiz = await Quiz.create(quizData);
        res.status(201).json({ success: true, data: quiz });
    } catch (error) { next(error); }
});

router.put('/quizzes/:id', async (req, res, next) => {
    try {
        // Map subjectId/topicId to subject/topic for proper schema matching
        const quizData = {
            title: req.body.title,
            subject: req.body.subjectId || req.body.subject,
            topic: req.body.topicId || req.body.topic,
            duration: req.body.duration,
            difficulty: req.body.difficulty,
            isMockTest: req.body.isMockTest,
            isBigQuiz: req.body.isBigQuiz,
            timePerQuestion: req.body.timePerQuestion,
        };
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, quizData, { new: true });
        if (!quiz) throw new NotFoundError('Quiz');
        res.json({ success: true, data: quiz });
    } catch (error) { next(error); }
});

// Quiz Statistics (Toppers, participation)
router.get('/quizzes/:id/stats', async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new NotFoundError('Quiz');

        const attempts = await Attempt.find({ quiz: req.params.id })
            .populate('user', 'firstName lastName email')
            .sort({ score: -1, timeTaken: 1 }); // Sort by score DESC, then time ASC

        const students = await User.find({ role: 'student' });
        const attemptedUserIds = attempts.map(a => a.user?._id.toString());

        const notAttempted = students.filter(s => !attemptedUserIds.includes(s._id.toString()))
            .map(s => ({ _id: s._id, firstName: s.firstName, lastName: s.lastName, email: s.email }));

        res.json({
            success: true,
            data: {
                quizTitle: quiz.title,
                totalAttempts: attempts.length,
                avgScore: attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
                toppers: attempts.slice(0, 5), // Top 5
                allResults: attempts,
                notAttempted,
            }
        });
    } catch (error) { next(error); }
});

// Publish Quiz
router.post('/quizzes/:id/publish', async (req, res, next) => {
    try {
        console.log('=== PUBLISH QUIZ REQUEST ===');
        console.log('Quiz ID:', req.params.id);
        console.log('User:', req.user?.email, 'Role:', req.user?.role);
        console.log('Headers auth:', req.headers.authorization ? 'Present' : 'Missing');

        // First verify quiz exists
        const existingQuiz = await Quiz.findById(req.params.id);
        if (!existingQuiz) {
            console.log('Quiz not found:', req.params.id);
            throw new NotFoundError('Quiz');
        }

        // Check if already published
        if (existingQuiz.isPublished) {
            console.log('Quiz already published:', req.params.id);
            return res.json({
                success: true,
                message: 'Quiz is already published',
                data: existingQuiz
            });
        }

        // Now update to published
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { isPublished: true },
            { new: true }
        );

        console.log('Quiz updated, isPublished:', quiz.isPublished);

        // Notify all students (non-blocking - don't let notification failure block publish)
        try {
            const students = await User.find({ role: 'student' });
            console.log('Found students to notify:', students.length);

            if (students.length > 0) {
                const notifications = students.map(student => ({
                    user: student._id,
                    title: 'New Quiz Published!',
                    message: `A new quiz "${quiz.title}" is now live. Test your skills!`,
                    type: 'quiz_published',
                    link: `/quiz/${quiz._id}`
                }));

                await Notification.insertMany(notifications);
                console.log('Notifications sent:', notifications.length);
            }
        } catch (notifyError) {
            console.error('Failed to send notifications:', notifyError.message);
            // Don't throw - continue with success response
        }

        res.json({ success: true, message: 'Quiz published and students notified', data: quiz });
    } catch (error) {
        console.error('Publish error:', error.message);
        next(error);
    }
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

        // Fetch all attempts for ranking calculation
        const allAttempts = await Attempt.find();
        const studentScores = {}; // Map: userId -> totalScore

        allAttempts.forEach(a => {
            if (a.user) {
                studentScores[a.user.toString()] = (studentScores[a.user.toString()] || 0) + a.score;
            }
        });

        // Sort student IDs by score descending to determine rank
        const sortedStudentIds = Object.keys(studentScores).sort((a, b) => studentScores[b] - studentScores[a]);

        const studentsWithStats = await Promise.all(
            students.map(async (s) => {
                const sAttempts = allAttempts.filter(a => a.user?.toString() === s._id.toString());
                const avgScore = sAttempts.length > 0
                    ? Math.round(sAttempts.reduce((sum, a) => sum + a.score, 0) / sAttempts.length)
                    : 0;

                const rankIndex = sortedStudentIds.indexOf(s._id.toString());
                const rank = rankIndex !== -1 ? rankIndex + 1 : students.length; // Default to last if no attempts

                return {
                    ...s.toObject(),
                    totalAttempts: sAttempts.length,
                    avgScore,
                    rank,
                    // Ensure age/gender are returned (User model selects them by default, but verifying)
                    age: s.age,
                    gender: s.gender
                };
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

// ============ Tasks CRUD ============

router.get('/tasks/student/:studentId', async (req, res, next) => {
    try {
        const tasks = await Task.find({ assignedTo: req.params.studentId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (error) { next(error); }
});

router.get('/tasks/recent', async (req, res, next) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({ success: true, data: tasks });
    } catch (error) { next(error); }
});

router.post('/tasks', async (req, res, next) => {
    try {
        const task = await Task.create({
            ...req.body,
            assignedBy: req.user._id,
        });
        res.status(201).json({ success: true, data: task });
    } catch (error) { next(error); }
});

router.delete('/tasks/:id', async (req, res, next) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Task deleted' });
    } catch (error) { next(error); }
});

// ============ Global To-Do List ============

router.get('/global-tasks', async (req, res, next) => {
    try {
        const tasks = await GlobalTask.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (error) { next(error); }
});

router.post('/global-tasks', async (req, res, next) => {
    try {
        console.log('Creating global task with body:', req.body);
        console.log('User ID:', req.user?._id);

        const taskData = {
            content: req.body.content,
            tag: req.body.tag || 'General',
            createdBy: req.user._id
        };

        console.log('Task data to create:', taskData);

        const task = await GlobalTask.create(taskData);
        console.log('Task created successfully:', task._id);

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        console.error('Error creating global task:', error.message);
        console.error('Full error:', error);
        next(error);
    }
});

router.delete('/global-tasks/:id', async (req, res, next) => {
    try {
        await GlobalTask.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Global task deleted' });
    } catch (error) { next(error); }
});

export default router;
