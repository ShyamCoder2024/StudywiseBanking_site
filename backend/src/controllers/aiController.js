const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing in server environment");
            return res.status(500).json({
                error: "AI Service Unavailable",
                details: "Server configuration error: Missing API Key"
            });
        }

        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct history context if provided, or just send the prompt
        // Simple implementation first: just prompt
        // Advanced: Construct chat session

        const chat = model.startChat({
            history: history || [], // history format: [{ role: "user"|"model", parts: [{ text: "..." }] }]
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        res.status(500).json({
            error: "Failed to get response from AI",
            details: error.message
        });
    }
};

module.exports = {
    chatWithAI
};
