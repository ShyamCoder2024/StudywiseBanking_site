import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    icon: {
        type: String,
        default: '📖',
    },
}, { timestamps: true });

// Virtual for topic count
subjectSchema.virtual('topicCount', {
    ref: 'Topic',
    localField: '_id',
    foreignField: 'subject',
    count: true,
});

subjectSchema.set('toJSON', { virtuals: true });
subjectSchema.set('toObject', { virtuals: true });

export const Subject = mongoose.model('Subject', subjectSchema);

// Topic Model
const topicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Topic name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true, // Index for frequent lookups by subject
    },
}, { timestamps: true });

topicSchema.virtual('quizCount', {
    ref: 'Quiz',
    localField: '_id',
    foreignField: 'topic',
    count: true,
});

topicSchema.set('toJSON', { virtuals: true });
topicSchema.set('toObject', { virtuals: true });

export const Topic = mongoose.model('Topic', topicSchema);

// Quiz Model
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
    },
    duration: {
        type: Number,
        required: true,
        default: 15, // in minutes
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
    },
    isMockTest: {
        type: Boolean,
        default: false,
    },
    isBigQuiz: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    // NEW: Expiry system - quizzes expire after 7 days
    publishedAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null, // Set to 7 days from publishedAt when published
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
    // Target Audience for Quiz Access Control
    targetAudience: {
        type: String,
        enum: ['all', 'paid', 'unpaid'],
        default: 'all'
    },
    requiredCourse: {
        type: String,
        default: null
    },
    requiredBatch: {
        type: String,
        default: null
    },
    // NEW: Track which students have viewed/seen the quiz notification
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    timePerQuestion: {
        type: Number,
        default: 60, // in seconds
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Indexes for Quiz model - critical for performance
quizSchema.index({ isPublished: 1, createdAt: -1 }); // Published quizzes sorted by date
quizSchema.index({ topic: 1, isPublished: 1 }); // Quizzes by topic

quizSchema.virtual('questionCount', {
    ref: 'Question',
    localField: '_id',
    foreignField: 'quiz',
    count: true,
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

export const Quiz = mongoose.model('Quiz', quizSchema);

// Question Model
const questionSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
        index: true, // Index for questions by quiz lookup
    },
    type: {
        type: String,
        enum: ['mcq', 'descriptive'],
        required: true,
    },
    text: {
        type: String,
        required: [true, 'Question text is required'],
    },
    // For MCQ
    options: [{
        type: String,
    }],
    correctAnswer: {
        type: String,
    },
    // For Descriptive
    topperAnswer: {
        type: String,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);

// Attempt Model
const attemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true,
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
        },
        answer: String,
        isCorrect: Boolean,
    }],
    score: {
        type: Number,
        default: 0,
    },
    totalQuestions: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    unanswered: Number,
    // New Marking System Fields
    totalMarks: {
        type: Number,
        default: 0
    },
    maxMarks: {
        type: Number,
        default: 0
    },
    negativeMarks: {
        type: Number,
        default: 0
    },
    timeTaken: String, // "MM:SS" format
    startedAt: Date,
    submittedAt: Date,
    // AI Analysis
    aiAnalysis: {
        overallFeedback: String,
        strengths: [String],
        weaknesses: [String],
        topicSuggestions: [{
            topic: String,
            reason: String,
        }],
        processedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
    },
}, { timestamps: true });

// Indexes for Attempt model - critical for leaderboard and user history
attemptSchema.index({ user: 1, createdAt: -1 }); // User's attempts sorted by date
attemptSchema.index({ quiz: 1, score: -1 }); // Quiz results sorted by score
attemptSchema.index({ user: 1, quiz: 1 }); // Check if user attempted specific quiz

export const Attempt = mongoose.model('Attempt', attemptSchema);

export default { Subject, Topic, Quiz, Question, Attempt };
