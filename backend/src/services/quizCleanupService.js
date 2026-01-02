/**
 * Quiz Cleanup Service - DISABLED
 * 
 * Previously this service would:
 * - Mark quizzes as expired after 7 days
 * - Delete question data
 * 
 * NOW: All quizzes and results are kept permanently in the database.
 * Admin requested that tests and results should never be auto-deleted.
 */

// Disabled: No longer sets expiry date
export function setQuizExpiry(quiz, days = 7) {
    // Do nothing - quizzes no longer expire
    return quiz;
}

// Disabled: Always returns not expired
export function getTimeRemaining(expiresAt) {
    return { days: 999, hours: 0, minutes: 0, isExpired: false };
}

// Disabled: Cleanup job does nothing
export function initQuizCleanupJob() {
    console.log('[Quiz Cleanup] DISABLED - Quizzes are kept permanently');
    // No cron job scheduled
}

// Disabled: Cleanup function does nothing
async function cleanupExpiredQuizzes() {
    console.log('[Quiz Cleanup] DISABLED - No cleanup performed');
}

export default { setQuizExpiry, getTimeRemaining, initQuizCleanupJob, cleanupExpiredQuizzes };
