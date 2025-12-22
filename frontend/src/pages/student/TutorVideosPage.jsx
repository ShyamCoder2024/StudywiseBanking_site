import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, User, Sparkles, RefreshCw, Youtube, Zap } from 'lucide-react';
import api from '../../services/api';
import './TutorVideosPage.css';

export default function TutorVideosPage() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recommendedCount, setRecommendedCount] = useState(0);
    const [aiPowered, setAiPowered] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setError(null);
            const res = await api.get('/student/videos');
            if (res.data.success && res.data.data) {
                setVideos(res.data.data.videos || []);
                setRecommendedCount(res.data.data.recommendedCount || 0);
                setAiPowered(res.data.data.aiPowered || false);
                setIsFallback(res.data.data.isFallback || false);
                setFallbackMessage(res.data.data.message || '');
            }
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setError('Failed to load videos. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Clear cache and refetch
            await api.post('/student/videos/refresh');
            await fetchVideos();
        } catch (err) {
            console.error('Failed to refresh:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleVideoClick = (video) => {
        window.open(video.watchUrl, '_blank');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
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
                    <div style={{ flex: 1 }}>
                        <h1>Tutor's Desk 🎓</h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Youtube size={14} style={{ color: '#FF0000' }} />
                            Videos from Study Wise Banking
                            {aiPowered && (
                                <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Zap size={10} /> AI Personalized
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="btn-refresh"
                        disabled={refreshing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '10px',
                            color: 'var(--color-text)',
                            cursor: refreshing ? 'wait' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500
                        }}
                    >
                        <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {recommendedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="recommendation-banner"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05))',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Sparkles size={18} style={{ color: '#f59e0b' }} />
                        <span style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>
                            <strong>{recommendedCount} videos</strong> personalized for your weak areas. Watch these first!
                        </span>
                    </motion.div>
                )}

                {isFallback && fallbackMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05))',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Youtube size={18} style={{ color: '#8b5cf6' }} />
                        <span style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>
                            {fallbackMessage} <a href="https://www.youtube.com/@studywisebanking" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontWeight: 600 }}>Visit Channel →</a>
                        </span>
                    </motion.div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ display: 'inline-block', marginBottom: '16px' }}
                        >
                            <RefreshCw size={32} style={{ color: 'var(--color-primary)' }} />
                        </motion.div>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Fetching videos from YouTube channel...
                        </p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>
                            AI is categorizing videos for your personalized recommendations
                        </p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
                        <button onClick={fetchVideos} style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            Try Again
                        </button>
                    </div>
                ) : videos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Youtube size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            No videos available at the moment. Click refresh to try again.
                        </p>
                    </div>
                ) : (
                    <div className="video-grid-premium">
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.youtubeId || index}
                                className={`video-card-premium ${video.isRecommended ? 'recommended' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleVideoClick(video)}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="thumbnail-wrapper">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        onError={(e) => {
                                            // Try lower quality thumbnail on error
                                            e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="play-overlay">
                                        <Play size={20} fill="white" className="text-white" />
                                    </div>
                                    {video.isRecommended && (
                                        <span className="recommended-badge">
                                            <Sparkles size={10} /> Recommended
                                        </span>
                                    )}
                                </div>
                                <div className="video-content">
                                    <div className="video-tags">
                                        <span className={`tag ${video.subject?.toLowerCase()}`}>{video.subject}</span>
                                        {video.isRecommended && (
                                            <span className="tag ai-tag">AI Pick</span>
                                        )}
                                    </div>
                                    <h3>{video.title}</h3>
                                    <div className="meta-row">
                                        <div className="author-info">
                                            <User size={14} /> {video.tutorName || 'Bharat Sir'}
                                        </div>
                                        <div className="author-info">
                                            {formatDate(video.publishedAt)}
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
