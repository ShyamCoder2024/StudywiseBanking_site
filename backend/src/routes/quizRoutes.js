import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
import User from '../models/User.js';
import { NotFoundError } from '../middleware/errorMiddleware.js';
import { analyzeDescriptiveAnswer } from '../services/aiService.js';

const router = express.Router();

// @route   GET /api/quizzes/:id/start
// @desc    Start a quiz
// @access  Private
router.get('/quizzes/:id/start', protect, async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new NotFoundError('Quiz');

        // Security: Only allow starting published quizzes (unless admin)
        if (!quiz.isPublished && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'This quiz is not available yet. Please wait for it to be published.'
            });
        }

        // Enrollment Check: Verify user has access based on targetAudience
        const user = await User.findById(req.user._id);
        const isPaidUser = user?.enrollment?.isPaid || false;

        if (quiz.targetAudience === 'paid' && !isPaidUser && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                restricted: true,
                restrictionType: 'paid_only',
                message: 'This test is for paid users only. Please enroll in a course to access this content.'
            });
        }

        if (quiz.targetAudience === 'unpaid' && isPaidUser && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                restricted: true,
                restrictionType: 'unpaid_only',
                message: 'This test is available only for free users.'
            });
        }

        // Check required course enrollment
        if (quiz.requiredCourse && isPaidUser) {
            const hasRequiredCourse = user?.enrollment?.courses?.some(
                c => c.courseId === quiz.requiredCourse
            );
            if (!hasRequiredCourse && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    restricted: true,
                    restrictionType: 'course_required',
                    requiredCourse: quiz.requiredCourse,
                    message: 'This test requires enrollment in a specific course.'
                });
            }
        }

        // RE-ATTEMPT PREVENTION: Check if user has already completed this quiz
        const existingAttempt = await Attempt.findOne({
            user: req.user._id,
            quiz: req.params.id
        });

        if (existingAttempt) {
            return res.status(403).json({
                success: false,
                alreadyCompleted: true,
                attemptId: existingAttempt._id,
                message: 'You have already completed this test. You cannot retake it.'
            });
        }

        const questions = await Question.find({ quiz: req.params.id }).sort({ order: 1 });

        // Return questions without answers
        res.json({
            success: true,
            data: {
                quiz: {
                    _id: quiz._id,
                    title: quiz.title,
                    duration: quiz.duration,
                },
                questions: questions.map((q) => ({
                    _id: q._id,
                    type: q.type,
                    text: q.text,
                    options: q.type === 'mcq' ? q.options : undefined,
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/quizzes/:id/autosave
// @desc    Autosave quiz answers
// @access  Private
router.post('/quizzes/:id/autosave', protect, async (req, res, next) => {
    try {
        const { answers } = req.body;
        // In a real implementation, save to a temporary storage
        // For now, just acknowledge
        res.json({ success: true, message: 'Answers saved' });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz
// @access  Private
router.post('/quizzes/:id/submit', protect, async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) throw new NotFoundError('Quiz');

        const { answers } = req.body;
        const questions = await Question.find({ quiz: req.params.id });

        // Calculate score
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unanswered = 0;
        const processedAnswers = [];

        for (const question of questions) {
            const studentAnswer = answers[question._id];

            if (!studentAnswer) {
                unanswered++;
                processedAnswers.push({ question: question._id, answer: '', isCorrect: false });
            } else if (question.type === 'mcq') {
                const isCorrect = studentAnswer === question.correctAnswer;
                if (isCorrect) correctAnswers++;
                else wrongAnswers++;
                processedAnswers.push({ question: question._id, answer: studentAnswer, isCorrect });
            } else {
                // Descriptive - will be analyzed by AI
                processedAnswers.push({ question: question._id, answer: studentAnswer, isCorrect: null });
            }
        }

        // NEW MARKING SYSTEM: +1 for correct, -0.25 for wrong, 0 for unanswered
        const marksPerCorrect = 1;
        const negativePerWrong = 0.25;

        let totalMarks = (correctAnswers * marksPerCorrect) - (wrongAnswers * negativePerWrong);
        totalMarks = Math.max(0, totalMarks); // No negative total marks

        const maxMarks = questions.length * marksPerCorrect;
        const score = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

        // Create attempt with new marking details
        const attempt = await Attempt.create({
            user: req.user._id,
            quiz: quiz._id,
            answers: processedAnswers,
            score,
            totalQuestions: questions.length,
            correctAnswers,
            wrongAnswers,
            unanswered,
            totalMarks: parseFloat(totalMarks.toFixed(2)),
            maxMarks,
            negativeMarks: parseFloat((wrongAnswers * negativePerWrong).toFixed(2)),
            startedAt: new Date(Date.now() - quiz.duration * 60 * 1000),
            submittedAt: new Date(),
            aiAnalysis: { status: 'pending' },
        });

        // === XP CALCULATION ===
        // Base XP: 100 for completing a quiz
        let xpEarned = 100;
        // +10 XP per correct answer
        xpEarned += correctAnswers * 10;
        // -5 XP per wrong answer (minimum 0 total)
        xpEarned -= wrongAnswers * 5;
        // Bonus: +50 XP for scoring above 80%
        if (score >= 80) xpEarned += 50;
        // Bonus: +25 XP for scoring above 90%
        if (score >= 90) xpEarned += 25;
        // Ensure XP doesn't go negative
        xpEarned = Math.max(0, xpEarned);

        // === STREAK CALCULATION ===
        const user = await User.findById(req.user._id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = 1;
        if (user.lastActivityDate) {
            const lastActivity = new Date(user.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day - keep current streak
                newStreak = user.streakCount || 1;
            } else if (diffDays === 1) {
                // Consecutive day - increment streak
                newStreak = (user.streakCount || 0) + 1;
            } else {
                // Missed days - reset streak to 1
                newStreak = 1;
            }
        }

        // Update user's XP and streak
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { xpPoints: xpEarned },
            streakCount: newStreak,
            lastActivityDate: new Date()
        });

        // Trigger AI analysis in background (don't await)
        processAIAnalysis(attempt._id, questions, answers).catch(console.error);

        res.json({
            success: true,
            data: {
                attemptId: attempt._id,
                xpEarned,
                newStreak
            },
        });
    } catch (error) {
        next(error);
    }
});

// Background AI analysis
async function processAIAnalysis(attemptId, questions, answers) {
    try {
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) return;

        attempt.aiAnalysis.status = 'processing';
        await attempt.save();

        const descriptiveQuestions = questions.filter((q) => q.type === 'descriptive');
        const strengths = [];
        const weaknesses = [];
        const topicSuggestions = [];

        for (const question of descriptiveQuestions) {
            const studentAnswer = answers[question._id];
            if (studentAnswer && question.topperAnswer) {
                try {
                    const analysis = await analyzeDescriptiveAnswer(
                        question.text,
                        studentAnswer,
                        question.topperAnswer
                    );
                    if (analysis.strengths) strengths.push(...analysis.strengths);
                    if (analysis.weaknesses) weaknesses.push(...analysis.weaknesses);
                    if (analysis.suggestions) topicSuggestions.push(...analysis.suggestions);
                } catch (e) {
                    console.error('AI analysis failed for question:', question._id, e);
                }
            }
        }

        attempt.aiAnalysis = {
            status: 'completed',
            overallFeedback: 'Your performance has been analyzed. Review the detailed feedback below.',
            strengths: [...new Set(strengths)].slice(0, 5),
            weaknesses: [...new Set(weaknesses)].slice(0, 5),
            topicSuggestions: topicSuggestions.slice(0, 3),
            processedAt: new Date(),
        };
        await attempt.save();
    } catch (error) {
        console.error('AI analysis error:', error);
        await Attempt.findByIdAndUpdate(attemptId, { 'aiAnalysis.status': 'failed' });
    }
}

// @route   GET /api/attempts/:id
// @desc    Get attempt result
// @access  Private
router.get('/attempts/:id', protect, async (req, res, next) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate('quiz', 'title')
            .populate('answers.question', 'text type options correctAnswer');

        if (!attempt) throw new NotFoundError('Attempt');

        // Calculate time taken
        const diffMs = attempt.submittedAt - attempt.startedAt;
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        const timeTaken = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        res.json({
            success: true,
            data: {
                quizTitle: attempt.quiz?.title,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                correctAnswers: attempt.correctAnswers,
                wrongAnswers: attempt.wrongAnswers,
                unanswered: attempt.unanswered,
                timeTaken,
                submittedAt: attempt.submittedAt.toISOString().split('T')[0],
                strengths: attempt.aiAnalysis?.strengths || [],
                weaknesses: attempt.aiAnalysis?.weaknesses || [],
                aiAnalysis: attempt.aiAnalysis?.status === 'completed' ? {
                    overallFeedback: attempt.aiAnalysis.overallFeedback,
                    topicSuggestions: attempt.aiAnalysis.topicSuggestions,
                } : null,
                recommendations: [],
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/attempts/:id/review
// @desc    Get detailed test review with all questions and answers
// @access  Private
router.get('/attempts/:id/review', protect, async (req, res, next) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate('quiz', 'title duration')
            .populate({
                path: 'answers.question',
                select: 'text type options correctAnswer explanation'
            });

        if (!attempt) throw new NotFoundError('Attempt');

        // Format questions with student answers and correct answers
        const reviewData = attempt.answers.map((answerItem, index) => {
            const question = answerItem.question;
            if (!question) return null;

            return {
                questionNumber: index + 1,
                questionId: question._id,
                questionText: question.text,
                questionType: question.type,
                options: question.options || [],
                studentAnswer: answerItem.answer,
                correctAnswer: question.correctAnswer,
                isCorrect: answerItem.isCorrect,
                explanation: question.explanation || null
            };
        }).filter(Boolean);

        // Calculate time taken
        const diffMs = attempt.submittedAt - attempt.startedAt;
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        const timeTaken = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        res.json({
            success: true,
            data: {
                quizTitle: attempt.quiz?.title,
                quizDuration: attempt.quiz?.duration,
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                correctAnswers: attempt.correctAnswers,
                wrongAnswers: attempt.wrongAnswers,
                unanswered: attempt.unanswered,
                timeTaken,
                submittedAt: attempt.submittedAt.toISOString().split('T')[0],
                questions: reviewData
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
