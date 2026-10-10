import React, { useState, useEffect } from 'react';

export default function ResourceWiseHeatmap() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');

    const slots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];

    useEffect(() => {
        fetch('/api/resources/resource-heatmap')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error('Heatmap fetch failed:', err);
                setLoading(false);
            });
    }, []);

    const getColor = (count) => {
        if (count === 0) return '#f8fafc';
        if (count <= 15) return '#dcfce7'; // Light
        if (count <= 30) return '#bbf7d0'; // Light-Medium
        if (count <= 45) return '#86efac'; // Medium
        if (count <= 60) return '#4ade80'; // Medium-Dark
        return '#22c55e'; // Dark
    };

    // Group data by resource
    const filteredData = filterType === 'ALL' ? data : data.filter(d => d.type === filterType);
    const resources = [...new Set(filteredData.map(d => d.resource))];
    
    // Find top usage for highlighting
    const maxCount = Math.max(...data.map(d => d.count), 0);

    if (loading) return <div className="card glass">Loading heatmap data...</div>;

    return (
        <div className="card glass fade-in" style={{ padding: '32px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Resource-wise Usage Heatmap
                    </h2>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Visual analytics for campus facility utilization.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Filter by Type:</span>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px' }}
                    >
                        <option value="ALL">ALL</option>
                        <option value="LAB">LAB</option>
                        <option value="LECTURE_HALL">LECTURE HALL</option>
                        <option value="MEETING_ROOM">MEETING ROOM</option>
                    </select>
                </div>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border)', width: '200px' }}>Resource</th>
                            {slots.map(slot => (
                                <th key={slot} style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>{slot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map(resName => (
                            <tr key={resName} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontWeight: '600', fontSize: '14px' }}>{resName}</td>
                                {slots.map(slot => {
                                    const entry = filteredData.find(d => d.resource === resName && d.timeSlot === slot);
                                    const count = entry ? entry.count : 0;
                                    const isTop = count === maxCount && count > 0;
                                    
                                    return (
                                        <td key={slot} style={{ padding: '4px', textAlign: 'center' }}>
                                            <div 
                                                title={`${resName}\n${slot}\nUsage: ${count} times`}
                                                style={{ 
                                                    height: '60px', 
                                                    background: getColor(count),
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: '700',
                                                    fontSize: '15px',
                                                    color: count > 45 ? 'white' : '#1e293b',
                                                    position: 'relative',
                                                    transition: 'transform 0.2s',
                                                    cursor: 'default',
                                                    border: isTop ? '2px solid #eab308' : 'none'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                {count}
                                                {isTop && (
                                                    <span style={{ 
                                                        position: 'absolute', 
                                                        top: '4px', 
                                                        right: '4px', 
                                                        fontSize: '8px', 
                                                        background: '#eab308', 
                                                        color: 'white', 
                                                        padding: '1px 4px', 
                                                        borderRadius: '4px',
                                                        textTransform: 'uppercase'
                                                    }}>TOP</span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Usage Intensity:</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[0, 15, 30, 45, 60, 70].map((v, idx) => (
                            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '12px', height: '12px', background: getColor(v), borderRadius: '3px' }}></div>
                                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                    {idx === 0 ? '0' : idx === 5 ? '60+' : `${v-14}-${v}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Showing {resources.length} resources
                </div>
            </div>
        </div>
    );
}
