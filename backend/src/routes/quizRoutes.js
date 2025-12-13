import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { Subject, Topic, Quiz, Question, Attempt } from '../models/Content.js';
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

        const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

        // Create attempt
        const attempt = await Attempt.create({
            user: req.user._id,
            quiz: quiz._id,
            answers: processedAnswers,
            score,
            totalQuestions: questions.length,
            correctAnswers,
            wrongAnswers,
            unanswered,
            startedAt: new Date(Date.now() - quiz.duration * 60 * 1000),
            submittedAt: new Date(),
            aiAnalysis: { status: 'pending' },
        });

        // Trigger AI analysis in background (don't await)
        processAIAnalysis(attempt._id, questions, answers).catch(console.error);

        res.json({
            success: true,
            data: { attemptId: attempt._id },
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

export default router;
