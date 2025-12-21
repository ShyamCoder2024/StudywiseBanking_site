import { GoogleGenerativeAI } from '@google/generative-ai';
import { Attempt } from '../models/Content.js';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate personalized AI analysis for a student based on their quiz performance
 */
export async function generateStudentAnalysis(userId) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found, returning fallback analysis');
            return null;
        }

        // Fetch student's quiz attempts
        const attempts = await Attempt.find({ user: userId })
            .populate('quiz', 'title subject')
            .sort({ createdAt: -1 })
            .limit(20);

        if (attempts.length === 0) {
            return {
                summary: "Welcome! Take your first quiz to get personalized AI insights and recommendations.",
                strengths: [],
                weaknesses: [],
                suggestions: [
                    {
                        topic: "Start Your Journey",
                        reason: "Take your first quiz to unlock personalized AI analysis",
                        icon: "🚀",
                        priority: "High"
                    }
                ],
                accuracy: 0,
                streakDays: 0
            };
        }

        // Calculate performance metrics
        let totalQuestions = 0;
        let totalCorrect = 0;
        const subjectPerformance = {};

        attempts.forEach(attempt => {
            totalQuestions += attempt.totalQuestions || 0;
            totalCorrect += attempt.correctAnswers || 0;

            const subject = attempt.quiz?.subject || 'General';
            if (!subjectPerformance[subject]) {
                subjectPerformance[subject] = { total: 0, correct: 0, count: 0 };
            }
            subjectPerformance[subject].total += attempt.totalQuestions || 0;
            subjectPerformance[subject].correct += attempt.correctAnswers || 0;
            subjectPerformance[subject].count += 1;
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // Find strengths and weaknesses
        const strengths = [];
        const weaknesses = [];

        Object.entries(subjectPerformance).forEach(([subject, data]) => {
            const subjectAccuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            if (subjectAccuracy >= 70) {
                strengths.push({ topic: subject, score: subjectAccuracy, detail: 'Strong performance' });
            } else {
                weaknesses.push({ topic: subject, score: subjectAccuracy, detail: 'Needs improvement' });
            }
        });

        // Generate AI analysis using Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a helpful study advisor for banking exam preparation. Analyze this student's performance and provide a personalized, encouraging summary (2-3 sentences max).

Student Performance:
- Overall Accuracy: ${accuracy}%
- Total Quizzes: ${attempts.length}
- Strong Areas: ${strengths.map(s => s.topic).join(', ') || 'None identified yet'}
- Weak Areas: ${weaknesses.map(w => w.topic).join(', ') || 'None identified yet'}

Provide a supportive, motivating summary that:
1. Acknowledges their progress (if any)
2. Identifies one key area to focus on
3. Ends with encouragement

Keep it brief, warm, and specific to their data. Do not use asterisks or special formatting.`;

        try {
            const result = await model.generateContent(prompt);
            const aiSummary = result.response.text();

            // Generate suggestions based on performance
            const suggestions = generateSuggestions(accuracy, weaknesses, attempts.length);

            return {
                summary: aiSummary,
                strengths: strengths.slice(0, 3),
                weaknesses: weaknesses.slice(0, 3),
                suggestions,
                accuracy,
                totalAttempts: attempts.length,
                aiGenerated: true
            };
        } catch (aiError) {
            console.error('Gemini API error:', aiError);
            // Return data without AI summary
            return {
                summary: accuracy >= 80
                    ? `Excellent work! With ${accuracy}% accuracy across ${attempts.length} quizzes, you're on track for success. Keep up the momentum!`
                    : accuracy >= 60
                        ? `Good progress! You've achieved ${accuracy}% accuracy. Focus on ${weaknesses[0]?.topic || 'practice'} to push your scores even higher.`
                        : `You're building your foundation with ${accuracy}% accuracy. Consistent daily practice will help you improve quickly.`,
                strengths: strengths.slice(0, 3),
                weaknesses: weaknesses.slice(0, 3),
                suggestions: generateSuggestions(accuracy, weaknesses, attempts.length),
                accuracy,
                totalAttempts: attempts.length,
                aiGenerated: false
            };
        }

    } catch (error) {
        console.error('Error generating student analysis:', error);
        return null;
    }
}

/**
 * Generate study suggestions based on performance
 */
function generateSuggestions(accuracy, weaknesses, attemptCount) {
    const suggestions = [];

    if (attemptCount < 5) {
        suggestions.push({
            topic: "Take More Quizzes",
            reason: "Complete at least 5 quizzes to get detailed performance insights",
            icon: "📝",
            priority: "High"
        });
    }

    if (accuracy < 50) {
        suggestions.push({
            topic: "Foundation Building",
            reason: "Focus on understanding core concepts before timed practice",
            icon: "📚",
            priority: "High"
        });
        suggestions.push({
            topic: "Study 4-5 Hours Daily",
            reason: "Dedicate consistent time to build your knowledge base",
            icon: "⏰",
            priority: "High"
        });
    } else if (accuracy < 70) {
        suggestions.push({
            topic: "Targeted Practice",
            reason: `Focus extra time on ${weaknesses[0]?.topic || 'weak areas'}`,
            icon: "🎯",
            priority: "High"
        });
        suggestions.push({
            topic: "Study 3-4 Hours Daily",
            reason: "Balance learning new topics with revision",
            icon: "⏰",
            priority: "Medium"
        });
    } else if (accuracy < 85) {
        suggestions.push({
            topic: "Speed Training",
            reason: "Work on solving questions faster without losing accuracy",
            icon: "⚡",
            priority: "High"
        });
        suggestions.push({
            topic: "Mock Tests",
            reason: "Take 2 full-length mock tests weekly for exam simulation",
            icon: "📊",
            priority: "High"
        });
    } else {
        suggestions.push({
            topic: "Maintain Excellence",
            reason: "Regular revision and mock tests to stay sharp",
            icon: "🏆",
            priority: "Medium"
        });
        suggestions.push({
            topic: "Help Others",
            reason: "Teaching concepts to peers reinforces your understanding",
            icon: "🤝",
            priority: "Low"
        });
    }

    // Add a weakness-specific suggestion
    if (weaknesses.length > 0) {
        suggestions.unshift({
            topic: `Master ${weaknesses[0].topic}`,
            reason: `Your ${weaknesses[0].topic} score is ${weaknesses[0].score}%. Daily practice will boost it quickly!`,
            icon: "📈",
            priority: "High"
        });
    }

    return suggestions.slice(0, 4);
}

export default { generateStudentAnalysis };
