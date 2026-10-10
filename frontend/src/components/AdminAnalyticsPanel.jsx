import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import ResourceWiseHeatmap from './ResourceWiseHeatmap';

const COLORS = ['#0f4c81', '#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

export default function AdminAnalyticsPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/admin/api/bookings/stats', { credentials: 'include' });
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="helper">Loading analytics data...</div>;
    if (error) return <div className="status-warn">{error}</div>;

    // Transform data for charts
    const resourceData = Object.entries(stats.byResource || {}).map(([name, value]) => ({ name, value }));
    const statusData = Object.entries(stats.byStatus || {}).map(([name, value]) => ({ name, value }));
    const dateData = Object.entries(stats.byDate || {}).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));

    return (
        <div style={{ marginTop: '32px' }}>
            <div className="section-header">
                <div>
                    <h2 style={{ margin: 0 }}>Campus Insights</h2>
                    <p className="helper">Data-driven overview of resource utilization and booking trends.</p>
                </div>
            </div>

            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="hub-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Total Bookings</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f4c81' }}>{stats.total}</div>
                </div>
                <div className="hub-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Active Resources</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f4c81' }}>{resourceData.length}</div>
                </div>
                <div className="hub-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>Pending Requests</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.byStatus['PENDING'] || 0}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Bookings by Resource */}
                <div className="hub-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>Popularity by Resource</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resourceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} />
                                <YAxis fontSize={12} tick={{fill: '#64748b'}} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#0f4c81" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="hub-card" style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>Booking Status Ratio</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trends over time */}
                <div className="hub-card" style={{ padding: '24px', gridColumn: 'span 2' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>Booking Trends (Daily)</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dateData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" fontSize={12} tick={{fill: '#64748b'}} />
                                <YAxis fontSize={12} tick={{fill: '#64748b'}} />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#0f4c81" strokeWidth={3} dot={{ r: 6, fill: '#0f4c81' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <ResourceWiseHeatmap />
            </div>
        </div>
    );
}
