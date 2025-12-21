import { GoogleGenerativeAI } from '@google/generative-ai';
import { Attempt, Quiz, Subject, Topic } from '../models/Content.js';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate personalized AI analysis for a student based on their quiz performance
 * Optimized for Indian Banking Exam preparation (IBPS, SBI, RBI, etc.)
 */
export async function generateStudentAnalysis(userId) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found, returning fallback analysis');
            return null;
        }

        // Fetch student's quiz attempts with full population
        const attempts = await Attempt.find({ user: userId })
            .populate({
                path: 'quiz',
                populate: [
                    { path: 'subject', select: 'name' },
                    { path: 'topic', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 })
            .limit(30);

        if (attempts.length === 0) {
            return {
                summary: "Welcome to StudyWise Banking! Take your first quiz to get personalized AI insights for your IBPS/SBI exam preparation.",
                strengths: [],
                weaknesses: [],
                suggestions: [
                    {
                        topic: "Start Your Journey",
                        reason: "Take your first quiz to unlock personalized AI analysis for banking exams",
                        icon: "🚀",
                        priority: "High"
                    }
                ],
                accuracy: 0,
                streakDays: 0
            };
        }

        // Calculate performance metrics by SUBJECT
        const subjectPerformance = {};
        // Calculate performance metrics by TOPIC
        const topicPerformance = {};

        let totalQuestions = 0;
        let totalCorrect = 0;

        attempts.forEach(attempt => {
            totalQuestions += attempt.totalQuestions || 0;
            totalCorrect += attempt.correctAnswers || 0;

            // Subject-level tracking
            const subjectName = attempt.quiz?.subject?.name || 'General';
            if (!subjectPerformance[subjectName]) {
                subjectPerformance[subjectName] = { total: 0, correct: 0, count: 0 };
            }
            subjectPerformance[subjectName].total += attempt.totalQuestions || 0;
            subjectPerformance[subjectName].correct += attempt.correctAnswers || 0;
            subjectPerformance[subjectName].count += 1;

            // Topic-level tracking
            const topicName = attempt.quiz?.topic?.name || 'Mixed Topics';
            if (!topicPerformance[topicName]) {
                topicPerformance[topicName] = {
                    total: 0,
                    correct: 0,
                    count: 0,
                    subject: subjectName
                };
            }
            topicPerformance[topicName].total += attempt.totalQuestions || 0;
            topicPerformance[topicName].correct += attempt.correctAnswers || 0;
            topicPerformance[topicName].count += 1;
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // Calculate Subject Strengths and Weaknesses
        const subjectStrengths = [];
        const subjectWeaknesses = [];

        Object.entries(subjectPerformance).forEach(([subject, data]) => {
            if (data.total === 0) return;
            const subjectAccuracy = Math.round((data.correct / data.total) * 100);
            const entry = {
                topic: subject,
                score: subjectAccuracy,
                questionsAttempted: data.total,
                quizzesTaken: data.count
            };

            if (subjectAccuracy >= 70) {
                subjectStrengths.push(entry);
            } else {
                subjectWeaknesses.push(entry);
            }
        });

        // Sort by score
        subjectStrengths.sort((a, b) => b.score - a.score);
        subjectWeaknesses.sort((a, b) => a.score - b.score);

        // Calculate Topic Strengths and Weaknesses  
        const topicStrengths = [];
        const topicWeaknesses = [];

        Object.entries(topicPerformance).forEach(([topic, data]) => {
            if (data.total === 0) return;
            const topicAccuracy = Math.round((data.correct / data.total) * 100);
            const entry = {
                topic: topic,
                score: topicAccuracy,
                subject: data.subject,
                questionsAttempted: data.total
            };

            if (topicAccuracy >= 70) {
                topicStrengths.push(entry);
            } else {
                topicWeaknesses.push(entry);
            }
        });

        topicStrengths.sort((a, b) => b.score - a.score);
        topicWeaknesses.sort((a, b) => a.score - b.score);

        // Combine Subject + Top Topics for final strengths/weaknesses
        const finalStrengths = [
            ...subjectStrengths.slice(0, 2),
            ...topicStrengths.filter(t => !subjectStrengths.find(s => s.topic === t.topic)).slice(0, 1)
        ].slice(0, 3);

        const finalWeaknesses = [
            ...subjectWeaknesses.slice(0, 2),
            ...topicWeaknesses.filter(t => !subjectWeaknesses.find(s => s.topic === t.topic)).slice(0, 1)
        ].slice(0, 3);

        // Generate AI analysis using Gemini - Banking Exam Focused
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an expert study advisor specializing in Indian Banking Exams (IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, RBI Grade B, RRB PO/Clerk). 

Analyze this student's performance and provide a personalized, encouraging summary (2-3 sentences max).

STUDENT PERFORMANCE DATA:
- Overall Accuracy: ${accuracy}%
- Total Quizzes Completed: ${attempts.length}
- Total Questions Attempted: ${totalQuestions}
- Correct Answers: ${totalCorrect}

SUBJECT-WISE ANALYSIS:
Strong Subjects: ${finalStrengths.map(s => `${s.topic} (${s.score}%)`).join(', ') || 'Not enough data yet'}
Weak Subjects: ${finalWeaknesses.map(w => `${w.topic} (${w.score}%)`).join(', ') || 'All subjects performing well!'}

TOPIC-LEVEL INSIGHTS:
Best Topics: ${topicStrengths.slice(0, 3).map(t => `${t.topic} (${t.score}%)`).join(', ') || 'Take more quizzes'}
Topics Needing Work: ${topicWeaknesses.slice(0, 3).map(t => `${t.topic} (${t.score}%)`).join(', ') || 'Great progress!'}

INSTRUCTIONS:
1. Address them as a banking exam aspirant
2. Acknowledge specific strong subjects/topics by name if any
3. Suggest focusing on their weakest subject/topic by name
4. Reference banking exam context (like Prelims/Mains, sectional cutoffs, time management)
5. Be encouraging but specific - use their actual data
6. Keep it to 2-3 sentences maximum
7. Do NOT use asterisks, bullet points, or special formatting

Example tone: "Great progress in Quantitative Aptitude at 85%! For your IBPS preparation, focus on improving Reasoning Ability where you scored 45%. Daily practice of 20-30 reasoning questions will help you clear sectional cutoffs."`;

        try {
            const result = await model.generateContent(prompt);
            const aiSummary = result.response.text();

            // Generate banking-specific suggestions
            const suggestions = generateBankingSuggestions(accuracy, finalWeaknesses, topicWeaknesses, attempts.length);

            return {
                summary: aiSummary,
                strengths: finalStrengths,
                weaknesses: finalWeaknesses,
                topicStrengths: topicStrengths.slice(0, 5),
                topicWeaknesses: topicWeaknesses.slice(0, 5),
                suggestions,
                accuracy,
                totalAttempts: attempts.length,
                totalQuestions,
                totalCorrect,
                aiGenerated: true
            };
        } catch (aiError) {
            console.error('Gemini API error:', aiError);
            // Return data without AI summary (fallback)
            const fallbackSummary = generateFallbackSummary(accuracy, attempts.length, finalStrengths, finalWeaknesses);

            return {
                summary: fallbackSummary,
                strengths: finalStrengths,
                weaknesses: finalWeaknesses,
                topicStrengths: topicStrengths.slice(0, 5),
                topicWeaknesses: topicWeaknesses.slice(0, 5),
                suggestions: generateBankingSuggestions(accuracy, finalWeaknesses, topicWeaknesses, attempts.length),
                accuracy,
                totalAttempts: attempts.length,
                totalQuestions,
                totalCorrect,
                aiGenerated: false
            };
        }

    } catch (error) {
        console.error('Error generating student analysis:', error);
        return null;
    }
}

/**
 * Generate fallback summary without AI
 */
function generateFallbackSummary(accuracy, attemptCount, strengths, weaknesses) {
    if (attemptCount < 3) {
        return "You're just getting started on your banking exam journey! Take a few more quizzes to unlock detailed performance insights.";
    }

    if (accuracy >= 80) {
        const strongSubject = strengths[0]?.topic || 'multiple subjects';
        return `Excellent performance at ${accuracy}% accuracy! You're excelling in ${strongSubject}. Keep up your IBPS/SBI preparation momentum with regular mock tests.`;
    } else if (accuracy >= 60) {
        const weakSubject = weaknesses[0]?.topic || 'certain areas';
        return `Good progress at ${accuracy}% accuracy! To crack your banking exam, focus extra time on ${weakSubject} to improve sectional scores.`;
    } else {
        return `You're building your foundation with ${accuracy}% accuracy. For banking exams, focus on conceptual clarity before speed. Daily practice will show rapid improvement!`;
    }
}

/**
 * Generate banking exam-specific study suggestions
 */
function generateBankingSuggestions(accuracy, subjectWeaknesses, topicWeaknesses, attemptCount) {
    const suggestions = [];

    // If not enough quizzes taken
    if (attemptCount < 5) {
        suggestions.push({
            topic: "Complete More Quizzes",
            reason: "Attempt at least 5 quizzes across different subjects for accurate analysis",
            icon: "📝",
            priority: "High"
        });
    }

    // Add weakness-specific suggestion for banking context
    if (subjectWeaknesses.length > 0) {
        const weakestSubject = subjectWeaknesses[0];
        suggestions.push({
            topic: `Improve ${weakestSubject.topic}`,
            reason: `Your ${weakestSubject.topic} score is ${weakestSubject.score}%. This subject carries significant weightage in banking exams.`,
            icon: "📈",
            priority: "High"
        });
    }

    // Add topic-specific suggestion
    if (topicWeaknesses.length > 0) {
        const weakestTopic = topicWeaknesses[0];
        suggestions.push({
            topic: `Practice ${weakestTopic.topic}`,
            reason: `Score only ${weakestTopic.score}% in ${weakestTopic.topic}. Focus 30 mins daily on this topic.`,
            icon: "🎯",
            priority: "High"
        });
    }

    // Accuracy-based banking exam recommendations
    if (accuracy < 50) {
        suggestions.push({
            topic: "Build Strong Foundation",
            reason: "Focus on NCERT basics and banking awareness fundamentals before attempting timed tests",
            icon: "📚",
            priority: "High"
        });
        suggestions.push({
            topic: "Study 4-5 Hours Daily",
            reason: "Allocate time: 2hrs Quant, 1.5hrs Reasoning, 1hr English, 30min Banking Awareness",
            icon: "⏰",
            priority: "High"
        });
    } else if (accuracy < 70) {
        suggestions.push({
            topic: "Sectional Practice",
            reason: "Practice section-wise tests focusing on your weak subjects to clear cutoffs",
            icon: "📊",
            priority: "High"
        });
        suggestions.push({
            topic: "Daily Quiz Routine",
            reason: "Solve 50-100 questions daily across all banking exam sections",
            icon: "⚡",
            priority: "Medium"
        });
    } else if (accuracy < 85) {
        suggestions.push({
            topic: "Speed Enhancement",
            reason: "Work on solving questions in under 30 seconds for Prelims time management",
            icon: "⚡",
            priority: "High"
        });
        suggestions.push({
            topic: "Full Mock Tests",
            reason: "Attempt 2-3 full-length mock tests weekly simulating actual exam conditions",
            icon: "📋",
            priority: "High"
        });
    } else {
        suggestions.push({
            topic: "Maintain Excellence",
            reason: "You're exam-ready! Focus on current affairs and banking awareness for final edge",
            icon: "🏆",
            priority: "Medium"
        });
        suggestions.push({
            topic: "Prelims + Mains Balance",
            reason: "Start practicing descriptive answers and case studies for Mains preparation",
            icon: "✍️",
            priority: "Medium"
        });
    }

    return suggestions.slice(0, 4);
}

export default { generateStudentAnalysis };
