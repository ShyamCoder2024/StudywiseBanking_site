import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, User, Eye } from 'lucide-react';
import './TutorVideosPage.css';

const VIDEOS_DATA = [
    { id: 101, title: "Speed Math Tricks - Multiply in 5s", author: "Rahul Sir", views: "12k", time: "10:05", thumb: "https://img.youtube.com/vi/ABCD123/hqdefault.jpg", tag: "Math" },
    { id: 102, title: "Current Affairs - Dec Week 2", author: "Priya Mam", views: "8.5k", time: "15:30", thumb: "https://img.youtube.com/vi/XYZ987/hqdefault.jpg", tag: "GK" },
    { id: 103, title: "Reasoning Puzzles for SBI PO", author: "Amit Sir", views: "22k", time: "45:00", thumb: "https://img.youtube.com/vi/PQR456/hqdefault.jpg", tag: "Reasoning" },
    { id: 104, title: "English Grammar - 50 Golden Rules", author: "Neastu Mam", views: "15k", time: "30:20", thumb: "https://img.youtube.com/vi/LMN789/hqdefault.jpg", tag: "English" },
    { id: 105, title: "Data Interpretation Expert Level", author: "Rahul Sir", views: "9k", time: "28:15", thumb: "https://img.youtube.com/vi/12345/hqdefault.jpg", tag: "Quant" },
    { id: 106, title: "Banking Awareness - RBI Policies", author: "Suresh Sir", views: "18k", time: "35:10", thumb: "https://img.youtube.com/vi/67890/hqdefault.jpg", tag: "Banking" },
];

export default function TutorVideosPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="videos-page-premium"
        >
            <div className="videos-container">
                <div className="page-header">
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Tutor's Desk 🎓</h1>
                </div>

                <div className="video-grid-premium">
                    {VIDEOS_DATA.map((video, index) => (
                        <motion.div
                            key={video.id}
                            className="video-card-premium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="thumbnail-wrapper">
                                {/* Using a placeholder gradient if image fails, or solid color */}
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1e293b, #334155)' }}></div>
                                <div className="play-overlay">
                                    <Play size={20} fill="white" className="text-white" />
                                </div>
                                <span className="duration-badge">{video.time}</span>
                            </div>
                            <div className="video-content">
                                <div className="video-tags">
                                    <span className="tag">{video.tag}</span>
                                </div>
                                <h3>{video.title}</h3>
                                <div className="meta-row">
                                    <div className="author-info">
                                        <User size={14} /> {video.author}
                                    </div>
                                    <div className="author-info">
                                        <Eye size={14} /> {video.views}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
