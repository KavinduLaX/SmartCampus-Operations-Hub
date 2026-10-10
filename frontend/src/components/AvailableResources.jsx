import React, { useState, useEffect, useMemo } from 'react';
import BookingModal from './BookingModal';

const API_BASE_URL = '/api/resources';

export default function AvailableResources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [resourceToBook, setResourceToBook] = useState(null);
    
    // Search Filters
    const [searchType, setSearchType] = useState('');
    const [searchCapacity, setSearchCapacity] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('System link offline');
            const data = await response.json();
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesType = (res.type || '').toLowerCase().includes(searchType.toLowerCase());
            const matchesCapacity = !searchCapacity || res.capacity >= parseInt(searchCapacity);
            const matchesLocation = (res.location || '').toLowerCase().includes(searchLocation.toLowerCase());
            const isActive = (res.status || 'ACTIVE') === 'ACTIVE';
            return matchesType && matchesCapacity && matchesLocation && isActive;
        });
    }, [resources, searchType, searchCapacity, searchLocation]);

    if (loading) return <p className="helper">Searching for available assets...</p>;
    if (error) return <p className="status-warn">{error}</p>;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '24px' }}>Available Resources</h2>
                    <p className="helper">Explore and book campus assets for your needs.</p>
                </div>
                <span className="badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>{filteredResources.length} found</span>
            </div>

            {/* Search Bar */}
            <div className="hub-search-bar" style={{ 
                marginBottom: '32px', 
                background: 'var(--card)', 
                padding: '16px', 
                borderRadius: '20px',
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <select 
                    className="modern-input" 
                    style={{ flex: 1, minWidth: '150px' }}
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>
                <input 
                    className="modern-input" 
                    placeholder="Min Capacity" 
                    style={{ maxWidth: '140px' }}
                    value={searchCapacity}
                    onChange={(e) => setSearchCapacity(e.target.value)}
                />
                <input 
                    className="modern-input" 
                    placeholder="Location" 
                    style={{ flex: 1, minWidth: '150px' }}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                />
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredResources.length === 0 ? (
                    <p className="helper" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No active resources match your search.</p>
                ) : (
                    filteredResources.map(res => (
                        <div key={res.id} className="quick-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div className="brand-mark" style={{ width: '48px', height: '48px', borderRadius: '16px', fontSize: '20px' }}>
                                    {res.type === 'LAB' ? '🧪' : res.type === 'LECTURE_HALL' ? '🎭' : '🏢'}
                                </div>
                                <span className="badge" style={{ fontSize: '10px' }}>
                                    ● {res.type.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '20px', color: 'var(--primary)', margin: '0 0 4px' }}>{res.name}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>{res.description || 'Modern campus facility'}</p>
                            
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ flex: 1, background: 'var(--bg)', padding: '12px', borderRadius: '14px' }}>
                                    <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '4px' }}>CAPACITY</div>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{res.capacity} Seats</div>
                                </div>
                                <div style={{ flex: 1, background: 'var(--bg)', padding: '12px', borderRadius: '14px' }}>
                                    <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '4px' }}>LOCATION</div>
                                    <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.location}</div>
                                </div>
                            </div>
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '12px' }}
                                onClick={() => { setResourceToBook(res); setIsBookingModalOpen(true); }}
                            >
                                Book Now
                            </button>
                        </div>
                    ))
                )}
            </div>

            {isBookingModalOpen && resourceToBook && (
                <BookingModal 
                    resource={resourceToBook} 
                    onClose={() => setIsBookingModalOpen(false)} 
                    onSuccess={() => {
                        setIsBookingModalOpen(false);
                        // Refresh logic if needed, but booking doesn't change status immediately
                    }}
                />
            )}
        </div>
    );
}
