import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpen, ArrowRight, BrainCircuit, Calculator,
    Globe2, Languages, TrendingUp, MoreHorizontal
} from 'lucide-react';
import { Loader } from '../../components/ui/Loader';
import api from '../../services/api';
import './SubjectsPage.css';

// Icon mapping for subjects
const ICON_MAP = {
    'english': Languages,
    'quant': Calculator,
    'quantitative': Calculator,
    'reasoning': BrainCircuit,
    'ga': Globe2,
    'general': Globe2,
    'banking': TrendingUp,
    'default': BookOpen
};

// Theme mapping
const THEME_MAP = {
    'english': 'theme-purple',
    'quant': 'theme-blue',
    'quantitative': 'theme-blue',
    'reasoning': 'theme-orange',
    'ga': 'theme-teal',
    'general': 'theme-teal',
    'banking': 'theme-teal',
    'default': 'theme-purple'
};

const getIcon = (name) => {
    const key = name?.toLowerCase().split(' ')[0] || 'default';
    return ICON_MAP[key] || ICON_MAP['default'];
};

const getTheme = (name) => {
    const key = name?.toLowerCase().split(' ')[0] || 'default';
    return THEME_MAP[key] || THEME_MAP['default'];
};

export function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/student/subjects');
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            // Fallback to mock data if API fails
            setSubjects([
                { _id: 'mock-english', name: 'English Language', description: 'Grammar, Reading Comprehension, and Vocabulary mastery.', topicCount: 15 },
                { _id: 'mock-quant', name: 'Quantitative Aptitude', description: 'Data Interpretation, Arithmetic, and Speed Math.', topicCount: 24 },
                { _id: 'mock-reasoning', name: 'Reasoning Ability', description: 'Logical Puzzles, Seating Arrangements, and Syllogism.', topicCount: 18 },
                { _id: 'mock-ga', name: 'General Awareness', description: 'Banking Awareness, Current Affairs, and Economy.', topicCount: 30 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="subjects-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="subjects-page">
            <div className="subjects-container">
                <div className="subjects-header-minimal">
                    <h1>Your Learning Path</h1>
                    <p>Focus on the core pillars of banking excellence.</p>
                </div>

                {subjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                        <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No subjects available yet. Please check back later.</p>
                    </div>
                ) : (
                    <motion.div
                        className="premium-subject-grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {subjects.map((subject) => {
                            const Icon = getIcon(subject.name);
                            const theme = getTheme(subject.name);
                            return (
                                <motion.div key={subject._id} variants={item}>
                                    <Link to={`/subjects/${subject._id}/topics`} className="subject-card-link">
                                        <div className={`premium-card ${theme}`}>
                                            <div className="card-bg-decoration"></div>

                                            <div className="card-top">
                                                <div className="icon-box">
                                                    <Icon size={32} strokeWidth={1.5} />
                                                </div>
                                                <button className="btn-options" onClick={(e) => e.preventDefault()}>
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>

                                            <div className="card-content">
                                                <h2>{subject.name}</h2>
                                                <p>{subject.description || `Explore ${subject.name} topics and quizzes`}</p>
                                            </div>

                                            <div className="card-footer-premium">
                                                <div className="progress-minimal">
                                                    <div className="stats-row">
                                                        <span>{subject.topicCount || 0} Topics</span>
                                                    </div>
                                                </div>
                                                <div className="action-circle">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default SubjectsPage;
