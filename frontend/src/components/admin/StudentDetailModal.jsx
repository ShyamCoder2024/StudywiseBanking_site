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
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                    style={{ padding: '12px' }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Purple Header - More Compact */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full border-2 border-white/50 shadow-md bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        `${student.firstName?.[0]}${student.lastName?.[0]}`
                                    )}
                                </div>

                                {/* Name & Rank */}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-white truncate">{student.firstName} {student.lastName}</h2>
                                    <span className="inline-block px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-medium">
                                        Rank #{student.rank || 'N/A'}
                                    </span>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content - Reduced Padding */}
                        <div className="p-4 space-y-4">

                            {/* Performance Stats - Compact Grid */}
                            <div>
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-2">Performance Stats</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-2.5 rounded-lg text-center border border-indigo-200">
                                        <div className="text-indigo-600 mb-0.5 flex justify-center"><Award size={18} /></div>
                                        <div className="text-lg font-bold text-gray-900">{student.avgScore || 0}%</div>
                                        <div className="text-[10px] font-semibold text-indigo-500 uppercase">Avg Score</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-2.5 rounded-lg text-center border border-teal-200">
                                        <div className="text-teal-600 mb-0.5 flex justify-center"><BookOpen size={18} /></div>
                                        <div className="text-lg font-bold text-gray-900">{student.totalAttempts || 0}</div>
                                        <div className="text-[10px] font-semibold text-teal-500 uppercase">Quizzes</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-2.5 rounded-lg text-center border border-amber-200">
                                        <div className="text-amber-600 mb-0.5 flex justify-center"><Star size={18} /></div>
                                        <div className="text-lg font-bold text-gray-900">#{student.rank || 'N/A'}</div>
                                        <div className="text-[10px] font-semibold text-amber-500 uppercase">Rank</div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information - Better Readability */}
                            <div>
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-100">
                                        <div className="text-xs text-purple-600 font-semibold">Preparing For</div>
                                        <div className="text-sm font-bold text-gray-800 mt-0.5">{student.targetExam || 'Student'}</div>
                                    </div>
                                    <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                                        <div className="text-xs text-blue-600 font-semibold">Gender</div>
                                        <div className="text-sm font-bold text-gray-800 mt-0.5">{student.gender || 'Male'}</div>
                                    </div>
                                    <div className="bg-pink-50 p-2.5 rounded-lg border border-pink-100">
                                        <div className="text-xs text-pink-600 font-semibold">Age</div>
                                        <div className="text-sm font-bold text-gray-800 mt-0.5">{student.age || '22'} yrs</div>
                                    </div>
                                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                                        <div className="text-xs text-emerald-600 font-semibold">Email</div>
                                        <div className="text-xs font-bold text-gray-800 truncate mt-0.5">{student.email}</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Close Button at Bottom - Compact */}
                        <div className="px-4 pb-4">
                            <button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
