import React from 'react';
import { motion } from 'framer-motion';
import {
    Youtube,
    Award,
    Users,
    TrendingUp,
    CheckCircle2,
    Quote,
    Play
} from 'lucide-react';
import './AboutTutor.css';

export function AboutTutor() {
    const tutorInfo = {
        name: 'Bharat Mangaonkar',
        title: 'Banking Exam Expert & Mentor',
        youtube: 'https://www.youtube.com/@studywisebanking',
        headerBio: "Guiding aspirants to clear SBI PO, IBPS, and RBI exams with confidence.",
        bio: `With 5+ years of dedicated experience in banking exam preparation, Bharat Mangaonkar has guided 5,000+ aspirants towards clearing SBI PO, IBPS, and RBI examinations.

His teaching philosophy is simple and exam-focused — no unnecessary theory, only what actually appears in the exam. Bharat is widely known for transforming average students into confident performers by focusing on concept clarity, smart problem-solving techniques, and the right exam approach.

He specializes in Quantitative Aptitude and Data Interpretation, where his simplified methods and speed-based strategies help students solve complex questions accurately within strict time limits.

What truly sets him apart is his approach-based teaching. He doesn't just teach how to solve questions — he teaches how to think in the exam, how to choose the right questions, and how to manage time effectively under pressure.

Through personalized mentorship and daily task-based practice, students receive consistent guidance at every stage of their preparation, especially during the critical Prelims phase.

His structured and practical methods have helped thousands of students navigate the challenges of competitive exams with confidence, discipline, and clarity.`,
        features: [
            { icon: <CheckCircle2 size={28} className="text-green" />, title: 'Exam-Oriented Teaching', desc: 'Only relevant concepts and patterns that appear in exams.' },
            { icon: <CheckCircle2 size={28} className="text-blue" />, title: 'Simplified Math Techniques', desc: 'Fast and accurate problem-solving methods.' },
            { icon: <CheckCircle2 size={28} className="text-purple" />, title: 'Approach-Based Learning', desc: 'Think like the exam expects you to.' },
            { icon: <CheckCircle2 size={28} className="text-orange" />, title: 'Personalized Mentorship', desc: 'Daily guidance and accountability at every step.' },
        ],
        videos: [
            { id: 1, title: 'SBI PO Prelims Strategy 2025', views: '1.2M views', url: 'https://www.youtube.com/@studywisebanking' },
            { id: 2, title: 'Math Tricks: Calculation Speed', views: '850k views', url: 'https://www.youtube.com/@studywisebanking' },
            { id: 3, title: 'Reasoning Puzzles Masterclass', views: '500k views', url: 'https://www.youtube.com/@studywisebanking' }
        ],
        testimonials: [
            { text: "Detailed explanations and constant motivation. I cleared IBPS PO because of Bharat Sir!", name: "Anjali Singh", role: "IBPS PO 2024" },
            { text: "The best math tricks ever. I used to fear quants, now it's my strength.", name: "Rahul Verma", role: "SBI Clerk" },
            { text: "Genuine guidance. No marketing gimmicks, just pure teaching.", name: "Priya Sharma", role: "RBI Assistant" },
            { text: "His strategy videos are a game changer. Follow him blindly!", name: "Vikram Das", role: "LIC AAO" },
            { text: "StudyWise Banking is not just a channel, it's an emotion for us.", name: "Neha Gupta", role: "Bank Aspirant" },
            { text: "Cleared my basics in just 1 month. Thank you Sir!", name: "Arjun K.", role: "SBI PO" },
        ]
    };

    return (
        <div className="about-page-container">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="hero-content-about">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="badge-highlight">#1 Banking Mentor</span>
                        <h1>{tutorInfo.name}</h1>
                        <h2>{tutorInfo.title}</h2>
                        <p className="hero-tagline">{tutorInfo.headerBio}</p>

                        <div className="hero-cta-group">
                            <a href="https://www.youtube.com/@studywisebanking" target="_blank" rel="noreferrer" className="btn-yt-primary">
                                <Youtube size={20} /> Subscribe Channel
                            </a>
                            <div className="hero-stat-pill">
                                <span><Users size={16} /> 5k+ Aspirants</span>
                                <span><TrendingUp size={16} /> 5+ Years</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <motion.div
                    className="hero-image-about"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Placeholder for Tutor Image */}
                    <div className="tutor-img-placeholder">
                        <img src="/tutor-bharat.png" alt="Bharat Sir" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
                    </div>
                </motion.div>
            </section>

            {/* USP Section - Clean & Simple */}
            <section className="usp-section">
                <div className="usp-grid">
                    {tutorInfo.features.map((f, i) => (
                        <motion.div
                            key={i}
                            className="usp-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="usp-icon">{f.icon}</div>
                            <div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Detailed Bio */}
            <section className="bio-section">
                <motion.div
                    className="bio-container glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>About the Mentor</h2>
                    <div className="bio-paragraphs">
                        {tutorInfo.bio.split('\n\n').map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Sliding Testimonials */}
            <section className="testimonials-slider-section">
                <h2>What Students Say</h2>
                <div className="marquee-wrapper">
                    <div className="marquee-content">
                        {[...tutorInfo.testimonials, ...tutorInfo.testimonials].map((t, i) => (
                            <div key={i} className="testimonial-card-slide">
                                <Quote size={24} className="quote-mark" />
                                <p>"{t.text}"</p>
                                <div className="t-author">
                                    <strong>{t.name}</strong>
                                    <span>{t.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutTutor;
