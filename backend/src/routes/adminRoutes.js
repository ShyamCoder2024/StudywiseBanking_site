import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { NotFoundError } from '../middleware/errorMiddleware.js';
import Notification from '../models/Notification.js';
import GlobalTask from '../models/GlobalTask.js';
import Course from '../models/Course.js';

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
            .limit(5)
            .lean();

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
            targetAudience: req.body.targetAudience || 'all',
            requiredCourse: req.body.requiredCourse || null,
            requiredBatch: req.body.requiredBatch || null,
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
            targetAudience: req.body.targetAudience || 'all',
            requiredCourse: req.body.requiredCourse || null,
            requiredBatch: req.body.requiredBatch || null,
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

        // Set publish date and expiry (7 days from now)
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Now update to published with expiry
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            {
                isPublished: true,
                publishedAt: now,
                expiresAt: expiresAt,
                isExpired: false,
                viewedBy: [] // Reset viewed list on publish
            },
            { new: true }
        );

        console.log('Quiz updated, isPublished:', quiz.isPublished, 'expiresAt:', quiz.expiresAt);

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
        // Use lean() for faster query - returns plain JS objects, not Mongoose docs
        const students = await User.find({ role: 'student' }).lean();

        // Use aggregation for efficient attempt counting
        const attemptStats = await Attempt.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalAttempts: { $sum: 1 },
                    totalScore: { $sum: '$score' },
                    avgScore: { $avg: '$score' }
                }
            }
        ]);

        // Create a map for O(1) lookup
        const statsMap = {};
        attemptStats.forEach(stat => {
            statsMap[stat._id?.toString()] = stat;
        });

        // Sort for ranking
        const sortedByScore = [...attemptStats].sort((a, b) => b.totalScore - a.totalScore);
        const rankMap = {};
        sortedByScore.forEach((stat, index) => {
            rankMap[stat._id?.toString()] = index + 1;
        });

        // Map students with their stats
        const studentsWithStats = students.map(s => {
            const stats = statsMap[s._id.toString()] || { totalAttempts: 0, avgScore: 0 };
            return {
                ...s,
                totalAttempts: stats.totalAttempts || 0,
                avgScore: Math.round(stats.avgScore || 0),
                rank: rankMap[s._id.toString()] || students.length
            };
        });

        res.json({ success: true, data: studentsWithStats });
    } catch (error) { next(error); }
});

router.get('/students/:id/attempts', async (req, res, next) => {
    try {
        const attempts = await Attempt.find({ user: req.params.id })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 })
            .lean();
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
        const tasks = await Task.find({ assignedTo: req.params.studentId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: tasks });
    } catch (error) { next(error); }
});

router.get('/tasks/recent', async (req, res, next) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
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
        const tasks = await GlobalTask.find({ isActive: true }).sort({ createdAt: -1 }).lean();
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

// ============ Student Enrollment Management ============

router.put('/students/:id/enrollment', async (req, res, next) => {
    try {
        const { isPaid, courses, tags, batch, courseName, courseId, courseIds, enrollAll } = req.body;

        const updateData = {};

        if (typeof isPaid === 'boolean') {
            updateData['enrollment.isPaid'] = isPaid;
        }

        if (courses && Array.isArray(courses)) {
            updateData['enrollment.courses'] = courses;
        }

        if (tags && Array.isArray(tags)) {
            updateData['enrollment.tags'] = tags;
        }

        // NEW: Enroll in ALL published courses
        if (enrollAll === true) {
            const allCourses = await Course.find({ isPublished: true }).select('_id title batchName');
            const newCourses = allCourses.map(c => ({
                courseId: c._id.toString(),
                courseName: c.title,
                batch: c.batchName || 'Default',
                enrolledAt: new Date()
            }));

            const student = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        'enrollment.isPaid': true,
                        'enrollment.courses': newCourses
                    }
                },
                { new: true }
            );

            return res.json({
                success: true,
                data: student,
                message: `Enrolled in ${newCourses.length} courses`
            });
        }

        // NEW: Enroll in MULTIPLE specific courses
        if (courseIds && Array.isArray(courseIds) && courseIds.length > 0) {
            // Fetch course details for the selected IDs
            const selectedCourses = await Course.find({
                _id: { $in: courseIds }
            }).select('_id title batchName');

            const newCourses = selectedCourses.map(c => ({
                courseId: c._id.toString(),
                courseName: c.title,
                batch: c.batchName || 'Default',
                enrolledAt: new Date()
            }));

            const student = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: {
                        'enrollment.isPaid': true,
                        'enrollment.courses': newCourses
                    }
                },
                { new: true }
            );

            return res.json({
                success: true,
                data: student,
                message: `Enrolled in ${newCourses.length} courses`
            });
        }

        // Legacy: Add single course enrollment
        if (courseId && courseName) {
            const newCourse = {
                courseId,
                courseName,
                batch: batch || 'Default',
                enrolledAt: new Date()
            };

            const student = await User.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { 'enrollment.isPaid': true },
                    $push: { 'enrollment.courses': newCourse }
                },
                { new: true }
            );

            return res.json({ success: true, data: student });
        }

        const student = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!student) throw new NotFoundError('Student');

        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// Add tag to student
router.post('/students/:id/tags', async (req, res, next) => {
    try {
        const { tag } = req.body;

        const student = await User.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { 'enrollment.tags': tag } },
            { new: true }
        );

        if (!student) throw new NotFoundError('Student');

        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// Remove tag from student
router.delete('/students/:id/tags/:tag', async (req, res, next) => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { $pull: { 'enrollment.tags': req.params.tag } },
            { new: true }
        );

        if (!student) throw new NotFoundError('Student');

        res.json({ success: true, data: student });
    } catch (error) { next(error); }
});

// ============ Global Settings ============

import GlobalSettings from '../models/GlobalSettings.js';

router.get('/settings', async (req, res, next) => {
    try {
        const settings = await GlobalSettings.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json({ success: true, data: settingsObj });
    } catch (error) { next(error); }
});

router.get('/settings/:key', async (req, res, next) => {
    try {
        const setting = await GlobalSettings.findOne({ key: req.params.key });
        res.json({ success: true, data: setting?.value || null });
    } catch (error) { next(error); }
});

router.put('/settings/:key', async (req, res, next) => {
    try {
        const { value } = req.body;

        const setting = await GlobalSettings.findOneAndUpdate(
            { key: req.params.key },
            {
                value,
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: setting });
    } catch (error) { next(error); }
});

// ============ Available Courses for Admin ============

router.get('/courses', async (req, res, next) => {
    try {
        // Fetch REAL courses from the database
        const courses = await Course.find({ isPublished: true })
            .select('_id title subject batchName description lectures')
            .sort({ createdAt: -1 })
            .lean();

        // Transform to match expected format
        const formattedCourses = courses.map(course => ({
            _id: course._id,
            id: course._id, // Include both for compatibility
            name: course.title,
            subject: course.subject,
            batches: course.batchName ? [course.batchName] : ['Main Batch'], // Convert to array
            description: course.description || '',
            lectureCount: course.lectures?.length || 0
        }));

        res.json({
            success: true,
            data: formattedCourses
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        next(error);
    }
});

// Note: Video management has been replaced with AI-powered YouTube integration
// Videos are now automatically fetched from the tutor's YouTube channel
// and personalized based on student performance

// ============ Course Management ============

// Get all courses (sorted by displayOrder)
router.get('/manage-courses', async (req, res, next) => {
    try {
        const courses = await Course.find()
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate('createdBy', 'firstName lastName');
        res.json({ success: true, data: courses });
    } catch (error) { next(error); }
});

// Get single course with all lectures
router.get('/manage-courses/:id', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');
        if (!course) throw new NotFoundError('Course');
        res.json({ success: true, data: course });
    } catch (error) { next(error); }
});

// Create new course
router.post('/manage-courses', async (req, res, next) => {
    try {
        const { title, thumbnail, subject, batchName, description, pricing, status, displayOrder } = req.body;

        if (!title || !subject || !batchName) {
            return res.status(400).json({
                success: false,
                message: 'Title, subject, and batch name are required'
            });
        }

        // Get the highest display order and add 1 for new course
        const highestOrder = await Course.findOne().sort({ displayOrder: -1 }).select('displayOrder');
        const newOrder = displayOrder ?? ((highestOrder?.displayOrder || 0) + 1);

        const course = await Course.create({
            title,
            thumbnail: thumbnail || '',
            subject,
            batchName,
            description: description || '',
            pricing: pricing || {
                originalPrice: 0,
                currentPrice: 0,
                showPriceDrop: false,
                priceDropLabel: '🔥 Price Drop'
            },
            status: status || 'ongoing',
            displayOrder: newOrder,
            createdBy: req.user._id,
            isPublished: false,
            lectures: []
        });

        res.status(201).json({ success: true, data: course });
    } catch (error) { next(error); }
});

// Update course details
router.put('/manage-courses/:id', async (req, res, next) => {
    try {
        const { title, thumbnail, subject, batchName, description, pricing, status, displayOrder } = req.body;

        const updateData = {
            title,
            thumbnail,
            subject,
            batchName,
            description,
            updatedAt: new Date()
        };

        // Handle pricing update
        if (pricing) {
            updateData.pricing = pricing;
        }

        // Handle status update
        if (status) {
            updateData.status = status;
        }

        // Handle displayOrder update
        if (typeof displayOrder === 'number') {
            updateData.displayOrder = displayOrder;
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!course) throw new NotFoundError('Course');
        res.json({ success: true, data: course });
    } catch (error) { next(error); }
});

// Delete course
router.delete('/manage-courses/:id', async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) throw new NotFoundError('Course');
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) { next(error); }
});

// Publish/Unpublish course
router.put('/manage-courses/:id/publish', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) throw new NotFoundError('Course');

        course.isPublished = !course.isPublished;
        await course.save();

        res.json({
            success: true,
            data: course,
            message: course.isPublished ? 'Course published!' : 'Course unpublished'
        });
    } catch (error) { next(error); }
});

// Reorder courses (bulk update display order)
router.put('/manage-courses/reorder', async (req, res, next) => {
    try {
        const { courseOrders } = req.body;

        if (!Array.isArray(courseOrders)) {
            return res.status(400).json({
                success: false,
                message: 'courseOrders must be an array'
            });
        }

        // Update each course's display order
        const updatePromises = courseOrders.map(item =>
            Course.findByIdAndUpdate(
                item.id,
                { displayOrder: item.order },
                { new: true }
            )
        );

        await Promise.all(updatePromises);

        // Return updated courses in new order
        const courses = await Course.find()
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate('createdBy', 'firstName lastName');

        res.json({ success: true, data: courses, message: 'Course order updated' });
    } catch (error) { next(error); }
});

// ============ Lecture Management ============

// Add lecture to course
router.post('/manage-courses/:id/lectures', async (req, res, next) => {
    try {
        const { lectureNumber, title, youtubeLink, duration } = req.body;

        if (!lectureNumber || !title || !youtubeLink) {
            return res.status(400).json({
                success: false,
                message: 'Lecture number, title, and YouTube link are required'
            });
        }

        const course = await Course.findById(req.params.id);
        if (!course) throw new NotFoundError('Course');

        course.lectures.push({
            lectureNumber,
            title,
            youtubeLink,
            duration: duration || '',
            isPublished: true
        });

        // Sort lectures by number
        course.lectures.sort((a, b) => a.lectureNumber - b.lectureNumber);
        await course.save();

        res.status(201).json({ success: true, data: course });
    } catch (error) { next(error); }
});

// Update lecture
router.put('/manage-courses/:id/lectures/:lectureId', async (req, res, next) => {
    try {
        const { lectureNumber, title, youtubeLink, duration, isPublished } = req.body;

        const course = await Course.findById(req.params.id);
        if (!course) throw new NotFoundError('Course');

        const lecture = course.lectures.id(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        if (lectureNumber !== undefined) lecture.lectureNumber = lectureNumber;
        if (title !== undefined) lecture.title = title;
        if (youtubeLink !== undefined) lecture.youtubeLink = youtubeLink;
        if (duration !== undefined) lecture.duration = duration;
        if (isPublished !== undefined) lecture.isPublished = isPublished;

        // Re-sort lectures by number
        course.lectures.sort((a, b) => a.lectureNumber - b.lectureNumber);
        await course.save();

        res.json({ success: true, data: course });
    } catch (error) { next(error); }
});

// Delete lecture
router.delete('/manage-courses/:id/lectures/:lectureId', async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) throw new NotFoundError('Course');

        const lecture = course.lectures.id(req.params.lectureId);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        lecture.deleteOne();
        await course.save();

        res.json({ success: true, data: course, message: 'Lecture deleted' });
    } catch (error) { next(error); }
});

export default router;

