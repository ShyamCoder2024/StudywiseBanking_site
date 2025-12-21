import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AIAnalysis } from '../../components/ai/AIAnalysis';

export default function AIAnalysisPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
            style={{
                padding: '24px',
                paddingBottom: '120px',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%'
            }}
        >
            {/* Back Button */}
            <motion.button
                onClick={() => navigate('/dashboard')}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-primary)]/30 hover:text-[var(--color-text)] transition-all shadow-sm"
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </motion.button>

            <AIAnalysis />
        </motion.div>
    );
}
