import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart2, Calendar } from 'lucide-react';

export default function PerformancePage() {
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
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-text)' }}>Performance Analytics</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Accuracy Rate</p>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>78%</h3>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> +5% vs last week</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Mock Tests</p>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#3b82f6' }}>12</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total Attempted</span>
                </div>
                <div className="stat-card" style={{ background: 'var(--color-card)', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Study Hours</p>
                    <h3 style={{ fontSize: '2rem', margin: 0, color: '#f59e0b' }}>42h</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>This Month</span>
                </div>
            </div>

            {/* Placeholder for Large Graph */}
            <div style={{ background: 'var(--color-card)', padding: '30px', borderRadius: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)', border: '1px solid var(--color-border)' }}>
                <BarChart2 size={64} style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }} />
                <p style={{ color: 'var(--color-text-secondary)' }}>Performance Graph Component Would Go Here</p>
            </div>
        </motion.div>
    );
}
