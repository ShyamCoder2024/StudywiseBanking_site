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
            style={{ padding: '20px', paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} style={{ color: 'var(--color-text)' }} />
                </button>
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-text)' }}>AI Performance Analysis</h1>
            </div>

            <AIAnalysis />
        </motion.div>
    );
}
