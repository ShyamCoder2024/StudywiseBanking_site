import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Leaderboard } from '../../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="page-container"
            style={{ padding: '20px', paddingBottom: '100px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} style={{ color: 'var(--color-text)' }} />
                </button>
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-text)' }}>Leaderboard</h1>
            </div>

            {/* Reusing existing Leaderboard Component but in full page context */}
            <Leaderboard />
        </motion.div>
    );
}
