import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIServiceError } from '../middleware/errorMiddleware.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

/**
 * Analyze a descriptive answer using Gemini AI
 * @param {string} question - The question text
 * @param {string} studentAnswer - Student's answer
 * @param {string} topperAnswer - Ideal/topper answer for comparison
 * @returns {Object} Analysis result with strengths, weaknesses, suggestions
 */
export async function analyzeDescriptiveAnswer(question, studentAnswer, topperAnswer) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `You are an expert evaluator for banking exam preparation. Analyze the student's answer and compare it with the ideal answer.

Question: ${question}

Student's Answer: ${studentAnswer}

Ideal Answer: ${topperAnswer}

Provide a JSON response with:
1. "score" (0-100): How well the student answered
2. "strengths" (array of strings): What the student did well (max 3)
3. "weaknesses" (array of strings): Areas for improvement (max 3)
4. "suggestions" (array of objects with "topic" and "reason"): Topics to review (max 2)
5. "feedback" (string): Brief constructive feedback (2-3 sentences)

Respond ONLY with valid JSON, no markdown.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON response
            const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

            return {
                score: analysis.score || 0,
                strengths: analysis.strengths || [],
                weaknesses: analysis.weaknesses || [],
                suggestions: analysis.suggestions || [],
                feedback: analysis.feedback || '',
            };
        } catch (error) {
            console.error(`AI analysis attempt ${attempt + 1} failed:`, error.message);
            lastError = error;

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    }

    // All retries failed - return fallback
    console.error('AI analysis failed after retries:', lastError);

    // Return fallback response instead of throwing
    return {
        score: 50,
        strengths: ['Answer was provided'],
        weaknesses: ['Analysis pending - please check back later'],
        suggestions: [],
        feedback: 'AI analysis is temporarily unavailable. Your answer has been recorded and will be reviewed.',
    };
}

export default { analyzeDescriptiveAnswer };
