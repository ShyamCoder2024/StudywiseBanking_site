import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AIAnalysis } from '../../components/ai/AIAnalysis';

export default function AIAnalysisPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-container"
            style={{
                padding: '20px',
                paddingBottom: '100px',
                maxWidth: '1280px',
                margin: '0 auto',
                width: '100%'
            }}
        >
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>

            <AIAnalysis />
        </motion.div>
    );
}
