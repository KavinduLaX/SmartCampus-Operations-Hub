import React, { useEffect, useState } from 'react';

const formatDateTime = (iso) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString();
    } catch (e) {
        return iso;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString();
    } catch (e) {
        return dateStr;
    }
};

export default function UserBookingsPanel() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadMyBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/bookings/my', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load your bookings');
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const res = await fetch(`/api/bookings/${id}/cancel`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Failed to cancel booking');
            }
            loadMyBookings();
        } catch (err) {
            alert(err.message);
        }
    };

    const isFuture = (date, time) => {
        const bookingTime = new Date(`${date}T${time}`);
        return bookingTime > new Date();
    };

    useEffect(() => {
        loadMyBookings();
    }, []);

    return (
        <section className="file-table-section" style={{ marginTop: '24px' }}>
            <div className="section-header">
                <div>
                    <h3 style={{ margin: 0 }}>My Bookings</h3>
                    <p className="helper">Track the status of your resource requests.</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={loadMyBookings} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && <p className="status-warn">{error}</p>}
            {loading && !bookings.length && <p className="helper">Loading your bookings...</p>}
            {!loading && !bookings.length && !error && (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', marginTop: '16px' }}>
                    <p style={{ color: '#64748b' }}>You haven't made any bookings yet.</p>
                </div>
            )}

            {!!bookings.length && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {bookings.map(b => (
                        <div key={b.id} className="hub-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span className={`hub-badge ${
                                    b.status === 'APPROVED' ? 'hub-badge-active' : 
                                    b.status === 'PENDING' ? 'hub-badge-pending' : 
                                    'hub-badge-oos'
                                }`}>
                                    {b.status}
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDateTime(b.createdAt)}</span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', color: '#0f4c81' }}>{b.resourceName}</h4>
                            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{b.purpose}</p>
                            
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#94a3b8' }}>Date:</span>
                                    <span style={{ fontWeight: '600' }}>{formatDate(b.date)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#94a3b8' }}>Time:</span>
                                    <span style={{ fontWeight: '600' }}>{b.startTime} - {b.endTime}</span>
                                </div>
                                {b.attendeeCount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#94a3b8' }}>Attendees:</span>
                                        <span style={{ fontWeight: '600' }}>{b.attendeeCount}</span>
                                    </div>
                                )}
                            </div>

                            {b.status === 'REJECTED' && b.rejectionReason && (
                                <div style={{ marginTop: '12px', padding: '10px', background: '#fff1f2', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
                                    <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase' }}>Reason for rejection</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#991b1b' }}>{b.rejectionReason}</p>
                                </div>
                            )}

                            {(b.status === 'APPROVED' || b.status === 'PENDING') && isFuture(b.date, b.startTime) && (
                                <button 
                                    className="btn btn-outline" 
                                    style={{ width: '100%', marginTop: '16px', color: '#f43f5e', borderColor: '#f43f5e' }}
                                    onClick={() => handleCancel(b.id)}
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
