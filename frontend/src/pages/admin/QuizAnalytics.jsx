import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ArrowLeft, Award, Users, AlertCircle, CheckCircle, Clock, Trophy } from 'lucide-react';

// DRD Brand Colors
const BRAND = {
    primary: '#8A75BA',
    primaryLight: '#EDE9F6',
    success: '#6EBCC3',
    successLight: '#E6F5F7',
    warning: '#ED6771',
    warningLight: '#FCE6E8',
    amber: '#F59E0B',
    amberLight: '#FEF3C7',
    text: '#131313',
    textSecondary: '#6B6B6B',
    textMuted: '#9AA0A6',
    bg: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E7EB',
    shadowCard: '0 4px 12px rgba(0, 0, 0, 0.04)',
    radius: '12px'
};

export function QuizAnalytics() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('toppers');

    useEffect(() => {
        fetchStats();
    }, [id]);

    const fetchStats = async () => {
        try {
            const res = await api.get(`/admin/quizzes/${id}/stats`);
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
            // Fallback mock data for demo
            setStats({
                quizTitle: 'Quiz Analytics',
                totalAttempts: 0,
                avgScore: 0,
                toppers: [],
                allResults: [],
                notAttempted: []
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <div style={{ width: 40, height: 40, border: `3px solid ${BRAND.border}`, borderTopColor: BRAND.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </AdminLayout>
        );
    }

    const tabs = [
        { id: 'toppers', label: 'Top Performers', icon: Trophy },
        { id: 'all', label: `All Results (${stats?.allResults?.length || 0})`, icon: Users },
        { id: 'missing', label: 'Not Attempted', icon: AlertCircle }
    ];

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: BRAND.textSecondary,
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: '-8px'
                    }}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                {/* Header */}
                <div style={{
                    backgroundColor: BRAND.card,
                    padding: '24px',
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '700', color: BRAND.text, margin: 0 }}>
                        {stats?.quizTitle} Analytics
                    </h1>
                    <p style={{ fontSize: '14px', color: BRAND.textSecondary, marginTop: '8px' }}>
                        Detailed performance report
                    </p>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="admin-grid-3">
                    {/* Total Attempts */}
                    <div style={{
                        backgroundColor: BRAND.card,
                        padding: '20px',
                        borderRadius: BRAND.radius,
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: BRAND.shadowCard,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: BRAND.primaryLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Users size={24} color={BRAND.primary} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: BRAND.textSecondary, margin: 0, fontWeight: '500' }}>Total Attempts</p>
                            <h3 style={{ fontSize: '28px', fontWeight: '700', color: BRAND.text, margin: '4px 0 0' }}>{stats?.totalAttempts || 0}</h3>
                        </div>
                    </div>

                    {/* Average Score */}
                    <div style={{
                        backgroundColor: BRAND.card,
                        padding: '20px',
                        borderRadius: BRAND.radius,
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: BRAND.shadowCard,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: BRAND.successLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={24} color={BRAND.success} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: BRAND.textSecondary, margin: 0, fontWeight: '500' }}>Average Score</p>
                            <h3 style={{ fontSize: '28px', fontWeight: '700', color: BRAND.text, margin: '4px 0 0' }}>{stats?.avgScore || 0}</h3>
                        </div>
                    </div>

                    {/* Not Attempted */}
                    <div style={{
                        backgroundColor: BRAND.card,
                        padding: '20px',
                        borderRadius: BRAND.radius,
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: BRAND.shadowCard,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: BRAND.amberLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertCircle size={24} color={BRAND.amber} />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: BRAND.textSecondary, margin: 0, fontWeight: '500' }}>Not Attempted</p>
                            <h3 style={{ fontSize: '28px', fontWeight: '700', color: BRAND.text, margin: '4px 0 0' }}>{stats?.notAttempted?.length || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Tabs & Table Container */}
                <div style={{
                    backgroundColor: BRAND.card,
                    borderRadius: BRAND.radius,
                    border: `1px solid ${BRAND.border}`,
                    boxShadow: BRAND.shadowCard,
                    overflow: 'hidden'
                }}>
                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `1px solid ${BRAND.border}`,
                        padding: '0 20px',
                        overflowX: 'auto'
                    }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '16px 20px',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: isActive ? `2px solid ${BRAND.primary}` : '2px solid transparent',
                                        color: isActive ? BRAND.primary : BRAND.textSecondary,
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        marginBottom: '-1px'
                                    }}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div style={{ padding: '0' }}>
                        {/* Top Performers Table */}
                        {activeTab === 'toppers' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: BRAND.bg }}>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Rank</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Student</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Score</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Time Taken</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.toppers?.length > 0 ? (
                                            stats.toppers.map((attempt, index) => (
                                                <tr key={attempt._id} style={{ borderTop: `1px solid ${BRAND.border}` }}>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#E5E7EB' : index === 2 ? '#FED7AA' : BRAND.bg,
                                                            color: index === 0 ? '#92400E' : index === 1 ? '#374151' : index === 2 ? '#C2410C' : BRAND.textSecondary,
                                                            fontSize: '12px',
                                                            fontWeight: '700'
                                                        }}>
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '50%',
                                                                backgroundColor: BRAND.primaryLight,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: BRAND.primary,
                                                                fontWeight: '700',
                                                                fontSize: '14px'
                                                            }}>
                                                                {attempt.user?.firstName?.[0]}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{attempt.user?.firstName} {attempt.user?.lastName}</div>
                                                                <div style={{ fontSize: '12px', color: BRAND.textMuted }}>{attempt.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '16px', color: BRAND.text }}>{attempt.score}</td>
                                                    <td style={{ padding: '16px 20px', color: BRAND.textSecondary, fontSize: '14px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Clock size={14} />
                                                            {Math.round(attempt.timeTaken / 60)} min
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '60px 20px', textAlign: 'center', color: BRAND.textMuted }}>
                                                    No attempts yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* All Results Table */}
                        {activeTab === 'all' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: BRAND.bg }}>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Student</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Score</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: BRAND.textSecondary, textTransform: 'uppercase' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats?.allResults?.length > 0 ? (
                                            stats.allResults.map(attempt => (
                                                <tr key={attempt._id} style={{ borderTop: `1px solid ${BRAND.border}` }}>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text }}>{attempt.user?.firstName} {attempt.user?.lastName}</div>
                                                        <div style={{ fontSize: '12px', color: BRAND.textMuted }}>{attempt.user?.email}</div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontWeight: '700', color: BRAND.text }}>{attempt.score}</td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            backgroundColor: attempt.score >= 50 ? BRAND.successLight : BRAND.warningLight,
                                                            color: attempt.score >= 50 ? BRAND.success : BRAND.warning
                                                        }}>
                                                            {attempt.score >= 50 ? 'Passed' : 'Failed'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: BRAND.textSecondary, fontSize: '14px' }}>
                                                        {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '60px 20px', textAlign: 'center', color: BRAND.textMuted }}>
                                                    No results yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Not Attempted Grid */}
                        {activeTab === 'missing' && (
                            <div style={{ padding: '20px' }}>
                                {stats?.notAttempted?.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="admin-grid-3">
                                        {stats.notAttempted.map(student => (
                                            <div key={student._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px',
                                                borderRadius: '10px',
                                                backgroundColor: BRAND.bg,
                                                border: `1px solid ${BRAND.border}`
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    backgroundColor: BRAND.warningLight,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: BRAND.warning,
                                                    fontWeight: '700',
                                                    fontSize: '14px'
                                                }}>
                                                    {student.firstName?.[0]}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: BRAND.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: BRAND.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: BRAND.success }}>
                                        <CheckCircle size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                                        <p style={{ margin: 0, fontWeight: '600' }}>Everyone has attempted!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default QuizAnalytics;
