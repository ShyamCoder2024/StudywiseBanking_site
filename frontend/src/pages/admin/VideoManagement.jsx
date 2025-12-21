import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plus, Trash2, Edit2, X, ExternalLink, Save, Youtube } from 'lucide-react';
import api from '../../services/api';

const SUBJECTS = ['MATH', 'REASONING', 'GK', 'ENGLISH', 'QUANT', 'BANKING', 'COMPUTER', 'GENERAL'];

export default function VideoManagement() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [form, setForm] = useState({
        youtubeId: '',
        title: '',
        tutorName: '',
        duration: '',
        subject: 'GENERAL',
        views: '0',
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await api.get('/admin/videos');
            setVideos(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVideo) {
                await api.put(`/admin/videos/${editingVideo._id}`, form);
            } else {
                await api.post('/admin/videos', form);
            }
            fetchVideos();
            closeModal();
        } catch (error) {
            console.error('Failed to save video:', error);
            alert('Failed to save video: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            await api.delete(`/admin/videos/${id}`);
            fetchVideos();
        } catch (error) {
            console.error('Failed to delete video:', error);
        }
    };

    const openAddModal = () => {
        setEditingVideo(null);
        setForm({
            youtubeId: '',
            title: '',
            tutorName: '',
            duration: '',
            subject: 'GENERAL',
            views: '0',
        });
        setShowModal(true);
    };

    const openEditModal = (video) => {
        setEditingVideo(video);
        setForm({
            youtubeId: video.youtubeId,
            title: video.title,
            tutorName: video.tutorName || '',
            duration: video.duration || '',
            subject: video.subject,
            views: video.views || '0',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingVideo(null);
    };

    // Extract video ID from YouTube URL
    const extractYoutubeId = (url) => {
        if (!url) return url;
        if (url.includes('youtube.com/watch?v=')) {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('v') || url;
        }
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }
        return url;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Youtube className="text-red-500" /> Video Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Add YouTube videos for students. Videos matching weak areas will be recommended.
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Video
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading videos...</div>
            ) : videos.length === 0 ? (
                <div className="text-center py-12">
                    <Video size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No videos added yet. Click "Add Video" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <motion.div
                            key={video._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <div className="relative">
                                <img
                                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-40 object-cover"
                                />
                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                </span>
                                <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-semibold ${video.subject === 'MATH' ? 'bg-blue-100 text-blue-700' :
                                        video.subject === 'REASONING' ? 'bg-green-100 text-green-700' :
                                            video.subject === 'GK' ? 'bg-yellow-100 text-yellow-700' :
                                                video.subject === 'ENGLISH' ? 'bg-pink-100 text-pink-700' :
                                                    video.subject === 'QUANT' ? 'bg-indigo-100 text-indigo-700' :
                                                        video.subject === 'BANKING' ? 'bg-cyan-100 text-cyan-700' :
                                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {video.subject}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {video.tutorName} • {video.views} views
                                </p>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <ExternalLink size={14} /> View
                                    </a>
                                    <button
                                        onClick={() => openEditModal(video)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video._id)}
                                        className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingVideo ? 'Edit Video' : 'Add New Video'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        YouTube URL or Video ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.youtubeId}
                                        onChange={(e) => setForm({ ...form, youtubeId: extractYoutubeId(e.target.value) })}
                                        placeholder="https://youtube.com/watch?v=... or video ID"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Paste full YouTube URL or just the video ID</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Video Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Speed Math Tricks - Multiply in 5s"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Subject *
                                        </label>
                                        <select
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            {SUBJECTS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={form.duration}
                                            onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                            placeholder="10:30"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tutor Name
                                        </label>
                                        <input
                                            type="text"
                                            value={form.tutorName}
                                            onChange={(e) => setForm({ ...form, tutorName: e.target.value })}
                                            placeholder="Rahul Sir"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Views
                                        </label>
                                        <input
                                            type="text"
                                            value={form.views}
                                            onChange={(e) => setForm({ ...form, views: e.target.value })}
                                            placeholder="1.2k"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                                >
                                    <Save size={18} />
                                    {editingVideo ? 'Update Video' : 'Add Video'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
