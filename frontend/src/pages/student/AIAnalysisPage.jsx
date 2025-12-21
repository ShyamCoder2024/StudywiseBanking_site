import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AIAnalysis } from '../../components/ai/AIAnalysis';

export default function AIAnalysisPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
                padding: 'clamp(16px, 4vw, 24px)',
                paddingBottom: '120px',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                minHeight: '100vh'
            }}
        >
            {/* Back Button - Premium Styled */}
            <motion.button
                onClick={() => navigate('/dashboard')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ x: -4, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 24,
                    padding: '12px 20px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    color: 'var(--color-text-secondary)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-text)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(138, 117, 186, 0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </motion.button>

            <AIAnalysis />
        </motion.div>
    );
}
