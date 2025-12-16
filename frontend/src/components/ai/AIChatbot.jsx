import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './AIChatbot.css';
import { API_URL } from '../../services/api';

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hi! I'm your StudyWise AI. 🤖\n\nI can help you with:\n- **Banking Concepts**\n- **Math Shortcuts**\n- **Study Plans**\n\nWhat's on your mind today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Real Backend API
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const botMsg = { id: Date.now() + 1, type: 'bot', text: data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = { id: Date.now() + 1, type: 'bot', text: "⚠️ I'm having trouble connecting to my brain right now. Please check your internet or try again later." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAsk = (question) => {
        setInput(question);
    };

    // Animation Variants
    const windowVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.2 } }
    };

    return (
        <div className="ai-chatbot-container">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window-glass"
                        variants={windowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="bot-info">
                                <div className="bot-avatar-large">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div className="bot-details">
                                    <h3>StudyWise AI</h3>
                                    <div className="bot-status">
                                        <span className="status-dot"></span>
                                        <span>Powered by Gemini</span>
                                    </div>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>
                                <ChevronDown size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`message ${msg.type}`}
                                >
                                    {msg.type === 'bot' ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                    <span className="message-time">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length < 3 && (
                            <div className="quick-questions">
                                <button className="quick-chip" onClick={() => handleQuickAsk("How to solve syllogisms?")}>🧩 Syllogisms</button>
                                <button className="quick-chip" onClick={() => handleQuickAsk("Explain simple interest")}>💰 Interest</button>
                                <button className="quick-chip" onClick={() => handleQuickAsk("Study plan for today")}>📅 Plan</button>
                            </div>
                        )}

                        {/* Input */}
                        <div className="chat-input-area">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isTyping}>
                                <Send size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher (Always Visible when closed, or manages toggle) */}
            {!isOpen && (
                <motion.div
                    className="ai-launcher"
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Sparkles size={28} color="white" />
                </motion.div>
            )}
        </div>
    );
}

export default AIChatbot;
