import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Award, BookOpen, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export function StudentDetailModal({ student, onClose }) {
    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return createPortal(
        <AnimatePresence>
            {student && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="admin-modal-overlay backdrop-blur-md bg-black/40"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl m-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative Background Header */}
                        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                            <div className="absolute top-0 right-0 p-4">
                                <button
                                    onClick={onClose}
                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition backdrop-blur-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Content Container */}
                        <div className="px-8 pb-8 -mt-16 relative">

                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-bold overflow-hidden">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            student.firstName?.[0]
                                        )}
                                    </div>
                                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm ${student.avgScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                </div>
                                <div className="flex-1 pt-2 md:pt-0 mb-2 md:mb-0">
                                    <h2 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide border border-indigo-100">Student</span>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold uppercase tracking-wide border border-gray-200">
                                            Joined {formatDate(student.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm"><Mail size={16} /></div>
                                            <span className="text-sm font-medium">{student.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm"><Phone size={16} /></div>
                                            <span className="text-sm font-medium">{student.mobile || 'No mobile provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Stats */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Performance Overview</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl text-center border border-indigo-200">
                                            <div className="text-indigo-600 mb-1 flex justify-center"><Award size={24} /></div>
                                            <div className="text-2xl font-bold text-gray-900">{student.avgScore || 0}%</div>
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Avg Score</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center border border-pink-200">
                                            <div className="text-pink-600 mb-1 flex justify-center"><BookOpen size={24} /></div>
                                            <div className="text-2xl font-bold text-gray-900">{student.totalAttempts || 0}</div>
                                            <div className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Tests Taken</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full blur-[60px] opacity-20 -ml-12 -mb-12 pointer-events-none"></div>

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-indigo-500/30">
                                        <TrendingUp size={20} className="text-indigo-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white tracking-wide">AI Performance Analysis</h3>
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            <strong className="text-white block mb-2">Executive Summary:</strong>
                                            {student.firstName} is showing strong consistency in <span className="text-indigo-300 font-semibold">Reasoning</span>, but <span className="text-pink-300 font-semibold">Quantitative Aptitude</span> needs more focus on speed. Overall accuracy has improved by 12% this week.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                                            <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Award size={14} /> Key Strengths
                                            </h4>
                                            <ul className="space-y-2">
                                                {['Syllogism (95% Accuracy)', 'Reading Comprehension', 'Data Interpretation'].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                                            <h4 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <AlertCircle size={14} /> Areas to Improve
                                            </h4>
                                            <ul className="space-y-2">
                                                {['Time & Distance', 'Quadratic Equations', 'Current Affairs'].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
