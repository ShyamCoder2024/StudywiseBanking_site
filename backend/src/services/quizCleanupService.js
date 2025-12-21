import cron from 'node-cron';
import { Quiz, Question } from '../models/Content.js';

/**
 * Quiz Cleanup Service
 * - Marks quizzes as expired after 7 days
 * - Deletes question data but keeps quiz metadata for records
 */

/**
 * Mark expired quizzes and clean up question data
 */
async function cleanupExpiredQuizzes() {
    try {
        const now = new Date();

        // Find quizzes that have passed their expiry date and are not yet marked expired
        const expiredQuizzes = await Quiz.find({
            isPublished: true,
            isExpired: false,
            expiresAt: { $lte: now }
        });

        if (expiredQuizzes.length === 0) {
            console.log('[Quiz Cleanup] No expired quizzes found');
            return;
        }

        console.log(`[Quiz Cleanup] Found ${expiredQuizzes.length} expired quizzes`);

        for (const quiz of expiredQuizzes) {
            // Delete all questions for this quiz to save storage
            const deleteResult = await Question.deleteMany({ quiz: quiz._id });
            console.log(`[Quiz Cleanup] Deleted ${deleteResult.deletedCount} questions from quiz: ${quiz.title}`);

            // Mark quiz as expired but keep the card visible
            quiz.isExpired = true;
            quiz.isActive = false;
            await quiz.save();

            console.log(`[Quiz Cleanup] Marked quiz as expired: ${quiz.title}`);
        }

        console.log('[Quiz Cleanup] Cleanup completed successfully');
    } catch (error) {
        console.error('[Quiz Cleanup] Error during cleanup:', error);
    }
}

/**
 * Set expiry date when a quiz is published
 * @param {Object} quiz - The quiz document
 * @param {Number} days - Number of days until expiry (default: 7)
 */
export function setQuizExpiry(quiz, days = 7) {
    const now = new Date();
    quiz.publishedAt = now;
    quiz.expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return quiz;
}

/**
 * Calculate remaining time until quiz expires
 * @param {Date} expiresAt - Expiry date
 * @returns {Object} - { days, hours, minutes, isExpired }
 */
export function getTimeRemaining(expiresAt) {
    if (!expiresAt) return { days: 0, hours: 0, minutes: 0, isExpired: true };

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isExpired: false };
}

/**
 * Initialize the cleanup cron job
 * Runs every day at midnight
 */
export function initQuizCleanupJob() {
    // Run every day at midnight
    cron.schedule('0 0 * * *', () => {
        console.log('[Quiz Cleanup] Running scheduled cleanup job');
        cleanupExpiredQuizzes();
    });

    console.log('[Quiz Cleanup] Scheduled cleanup job initialized (runs daily at midnight)');

    // Also run immediately on startup to catch any expired quizzes
    cleanupExpiredQuizzes();
}

export default { setQuizExpiry, getTimeRemaining, initQuizCleanupJob, cleanupExpiredQuizzes };
