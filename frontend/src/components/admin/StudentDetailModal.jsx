import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Calendar, Award, BookOpen, Clock, TrendingUp, AlertCircle, Star } from 'lucide-react';

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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                        style={{ margin: '16px' }}
                    >
                        {/* Compact Purple Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-16 h-16 rounded-full border-3 border-white shadow-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
                                >
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        `${student.firstName?.[0]}${student.lastName?.[0]}`
                                    )}
                                </motion.div>

                                {/* Name & Rank */}
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white">{student.firstName} {student.lastName}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-white/30">
                                            Rank #{student.rank || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition backdrop-blur-sm"
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Content - NO PADDING ISSUES */}
                        <div className="p-6 space-y-5">

                            {/* Performance Stats - Compact 3-card grid */}
                            <div>
                                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Performance Stats</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 rounded-xl text-center border border-indigo-200 cursor-pointer"
                                    >
                                        <div className="text-indigo-600 mb-1 flex justify-center"><Award size={20} /></div>
                                        <div className="text-xl font-bold text-gray-900">{student.avgScore || 0}%</div>
                                        <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Avg Score</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="bg-gradient-to-br from-teal-50 to-teal-100 p-3 rounded-xl text-center border border-teal-200 cursor-pointer"
                                    >
                                        <div className="text-teal-600 mb-1 flex justify-center"><BookOpen size={20} /></div>
                                        <div className="text-xl font-bold text-gray-900">{student.totalAttempts || 0}</div>
                                        <div className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Quizzes Taken</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl text-center border border-amber-200 cursor-pointer"
                                    >
                                        <div className="text-amber-600 mb-1 flex justify-center"><Star size={20} /></div>
                                        <div className="text-xl font-bold text-gray-900">#{student.rank || 'N/A'}</div>
                                        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Rank</div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Personal Information - Compact */}
                            <div>
                                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-purple-50 p-3 rounded-xl border border-purple-100"
                                    >
                                        <div className="text-xs text-purple-600 font-semibold mb-1">Preparing For</div>
                                        <div className="text-sm font-bold text-gray-900">{student.targetExam || 'Student'}</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-blue-50 p-3 rounded-xl border border-blue-100"
                                    >
                                        <div className="text-xs text-blue-600 font-semibold mb-1">Gender</div>
                                        <div className="text-sm font-bold text-gray-900">{student.gender || 'Male'}</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-pink-50 p-3 rounded-xl border border-pink-100"
                                    >
                                        <div className="text-xs text-pink-600 font-semibold mb-1">Age</div>
                                        <div className="text-sm font-bold text-gray-900">{student.age || '22'} years</div>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-emerald-50 p-3 rounded-xl border border-emerald-100"
                                    >
                                        <div className="text-xs text-emerald-600 font-semibold mb-1">Email</div>
                                        <div className="text-xs font-bold text-gray-900 truncate">{student.email}</div>
                                    </motion.div>
                                </div>
                            </div>

                        </div>

                        {/* Close Button at Bottom */}
                        <div className="px-6 pb-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition"
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
