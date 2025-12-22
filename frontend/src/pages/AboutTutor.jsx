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
        headerBio: "Helping aspirants crack SBI PO, IBPS, and RBI exams with ease.",
        bio: `With over 12 years of dedicated teaching experience, Bharat Mangaonkar has become a trusted name in Banking Exam preparation. His simplified teaching methods, especially in Quantitative Aptitude and Reasoning, have helped over 50,000 students navigate the complex world of competitive exams. He believes in smart work over hard work, focusing on exam-oriented strategies that yield maximum results in minimum time.`,
        features: [
            { icon: <CheckCircle2 size={28} className="text-green" />, title: 'Exam-Oriented Approach', desc: 'No fluff. Only what appears in the exam.' },
            { icon: <CheckCircle2 size={28} className="text-blue" />, title: 'Simplified Math Tricks', desc: 'Solve complex problems in seconds.' },
            { icon: <CheckCircle2 size={28} className="text-purple" />, title: 'Personal Mentorship', desc: 'Guidance at every step of your journey.' },
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
                                <span><Users size={16} /> 50k+ Students</span>
                                <span><TrendingUp size={16} /> 10+ Years</span>
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
                    <h2>My Journey</h2>
                    <p>{tutorInfo.bio}</p>
                </motion.div>
            </section>

            {/* Popular Videos Section */}
            <section className="videos-section">
                <h2><Youtube size={28} color="#FF0000" /> Most Watched Sessions</h2>
                <div className="video-grid-about">
                    {tutorInfo.videos.map((v, i) => (
                        <motion.a
                            key={v.id}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="video-card-about"
                            whileHover={{ y: -5 }}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="video-thumb">
                                <div className="play-overlay"><Play fill="white" size={32} /></div>
                            </div>
                            <div className="video-meta">
                                <h3>{v.title}</h3>
                                <span>{v.views}</span>
                            </div>
                        </motion.a>
                    ))}
                </div>
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
