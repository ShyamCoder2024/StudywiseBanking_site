import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, User, Eye, Sparkles, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import './TutorVideosPage.css';

// Mock data for fallback when no videos in database
const MOCK_VIDEOS = [
    { id: 101, title: "Speed Math Tricks - Multiply in 5s", tutorName: "Rahul Sir", views: "12k", duration: "10:05", youtubeId: "dQw4w9WgXcQ", subject: "MATH" },
    { id: 102, title: "Current Affairs - Dec Week 2", tutorName: "Priya Mam", views: "8.5k", duration: "15:30", youtubeId: "dQw4w9WgXcQ", subject: "GK" },
    { id: 103, title: "Reasoning Puzzles for SBI PO", tutorName: "Amit Sir", views: "22k", duration: "45:00", youtubeId: "dQw4w9WgXcQ", subject: "REASONING" },
    { id: 104, title: "English Grammar - 50 Golden Rules", tutorName: "Neastu Mam", views: "15k", duration: "30:20", youtubeId: "dQw4w9WgXcQ", subject: "ENGLISH" },
    { id: 105, title: "Data Interpretation Expert Level", tutorName: "Rahul Sir", views: "9k", duration: "28:15", youtubeId: "dQw4w9WgXcQ", subject: "QUANT" },
    { id: 106, title: "Banking Awareness - RBI Policies", tutorName: "Suresh Sir", views: "18k", duration: "35:10", youtubeId: "dQw4w9WgXcQ", subject: "BANKING" },
];

export default function TutorVideosPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedCount, setRecommendedCount] = useState(0);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await api.get('/student/videos');
            if (res.data.success && res.data.data.videos.length > 0) {
                setVideos(res.data.data.videos);
                setRecommendedCount(res.data.data.recommendedCount || 0);
            } else {
                // Use mock data if no videos in database
                setVideos(MOCK_VIDEOS.map(v => ({
                    ...v,
                    thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
                    watchUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
                    isRecommended: false
                })));
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            // Use mock data on error
            setVideos(MOCK_VIDEOS.map(v => ({
                ...v,
                thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
                watchUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
                isRecommended: false
            })));
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (video) => {
        window.open(video.watchUrl, '_blank');
    };

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
                    <div>
                        <h1>Tutor's Desk 🎓</h1>
                        {recommendedCount > 0 && (
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                                <Sparkles size={14} style={{ color: '#f59e0b', marginRight: '4px' }} />
                                {recommendedCount} videos recommended based on your performance
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
                        Loading videos...
                    </div>
                ) : (
                    <div className="video-grid-premium">
                        {videos.map((video, index) => (
                            <motion.div
                                key={video._id || video.id}
                                className={`video-card-premium ${video.isRecommended ? 'recommended' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                onClick={() => handleVideoClick(video)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="thumbnail-wrapper">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ display: 'none', width: '100%', height: '100%', background: 'linear-gradient(45deg, #1e293b, #334155)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Play size={40} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                    </div>
                                    <div className="play-overlay">
                                        <Play size={20} fill="white" className="text-white" />
                                    </div>
                                    <span className="duration-badge">{video.duration}</span>
                                    {video.isRecommended && (
                                        <span className="recommended-badge">
                                            <Sparkles size={10} /> Recommended
                                        </span>
                                    )}
                                </div>
                                <div className="video-content">
                                    <div className="video-tags">
                                        <span className={`tag ${video.subject?.toLowerCase()}`}>{video.subject}</span>
                                    </div>
                                    <h3>{video.title}</h3>
                                    <div className="meta-row">
                                        <div className="author-info">
                                            <User size={14} /> {video.tutorName}
                                        </div>
                                        <div className="author-info">
                                            <Eye size={14} /> {video.views}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

