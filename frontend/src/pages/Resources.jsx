import React, { useState, useEffect, useMemo } from 'react';

const API_BASE_URL = '/api/resources';

import BookingModal from '../components/BookingModal';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [resourceToBook, setResourceToBook] = useState(null);
    
    // Search Filters
    const [searchType, setSearchType] = useState('');
    const [searchCapacity, setSearchCapacity] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 0,
        location: '',
        availabilityWindows: '08:00-17:00',
        status: 'ACTIVE',
        description: ''
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingResource ? 'PUT' : 'POST';
        const url = editingResource ? `${API_BASE_URL}/${editingResource.id}` : API_BASE_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Data sync failed');
            
            setIsModalOpen(false);
            setEditingResource(null);
            setFormData({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', availabilityWindows: '08:00-17:00', status: 'ACTIVE', description: '' });
            fetchResources();
        } catch (err) {
            alert(err.message);
        }
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/${resourceToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Decommission failed');
            setIsDeleteModalOpen(false);
            setResourceToDelete(null);
            fetchResources();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesType = (res.type || '').toLowerCase().includes(searchType.toLowerCase());
            const matchesCapacity = !searchCapacity || res.capacity >= parseInt(searchCapacity);
            const matchesLocation = (res.location || '').toLowerCase().includes(searchLocation.toLowerCase());
            return matchesType && matchesCapacity && matchesLocation;
        });
    }, [resources, searchType, searchCapacity, searchLocation]);

    return (
        <div className="dashboard">
            {/* 1. Header Replication */}
            <header className="hub-header">
                <div className="hub-logo-section">
                    <div className="hub-logo-icon">🌐</div>
                    <div className="hub-logo-text">
                        <h1>Smart Campus Portal</h1>
                    </div>
                </div>
                <div className="hub-user-section">
                    <span className="hub-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>STUDENT</span>
                    <button className="btn btn-outline" style={{ borderRadius: '999px', padding: '8px 20px' }}>Log Out</button>
                </div>
            </header>

            {/* 2. Navigation Replication */}
            <nav className="hub-nav">
                <div className="hub-nav-inner">
                    <div className="hub-nav-link">Home</div>
                    <div className="hub-nav-link active">Resources</div>
                    <div className="hub-nav-link">Bookings</div>
                    <div className="hub-nav-link">Tickets</div>
                    <div className="hub-nav-link">Notifications</div>
                </div>
            </nav>

            <main className="page" style={{ maxWidth: '1200px', padding: '40px 5%' }}>
                {/* 3. Hero Section Replication */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <span className="hub-badge" style={{ background: '#e0f2fe', color: '#0369a1', marginBottom: '12px', display: 'inline-block' }}>MODERN CAMPUS SERVICE EXPERIENCE</span>
                        <h1 style={{ fontSize: '48px', color: '#0f4c81', margin: '0 0 12px' }}>Manage Resources</h1>
                        <p style={{ color: '#64748b', maxWidth: '600px', fontSize: '16px' }}>
                            Explore and book campus assets. From study rooms to lab equipment, everything is now at your fingertips through our smart portal.
                        </p>
                    </div>
                </div>

                {/* 4. Search Bar Replication */}
                <div className="hub-search-bar" style={{ marginBottom: '48px' }}>
                    <select 
                        className="hub-search-input" 
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
                        className="hub-search-input" 
                        placeholder="Capacity" 
                        style={{ maxWidth: '120px' }}
                        value={searchCapacity}
                        onChange={(e) => setSearchCapacity(e.target.value)}
                    />
                    <input 
                        className="hub-search-input" 
                        placeholder="Location" 
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    <button className="hub-search-button">Search</button>
                </div>

                {/* 5. Inventory Table Section */}
                <div style={{ marginBottom: '64px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ color: '#0f4c81', margin: 0, fontSize: '24px' }}>Resource Management</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="hub-badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '10px' }}>ADMINISTRATOR</span>
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px' }}>CONTROL PANEL</span>
                            </div>
                        </div>
                        <button 
                            className="hub-search-button" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => { setEditingResource(null); setIsModalOpen(true); }}
                        >
                            <span>+</span> Add Resource
                        </button>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', color: '#0f4c81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource Inventory</h3>
                            <span className="hub-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>{filteredResources.length} RESOURCES</span>
                        </div>
                        <table className="hub-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>TYPE</th>
                                    <th>CATEGORY</th>
                                    <th>CAP.</th>
                                    <th>LOCATION</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResources.map(res => (
                                    <tr key={res.id}>
                                        <td style={{ fontWeight: '700' }}>{res.name}</td>
                                        <td style={{ color: '#64748b' }}>{res.type}</td>
                                        <td><span className="hub-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>{res.type === 'LAB' ? 'LABS' : res.type === 'LECTURE_HALL' ? 'LECTURE HALLS' : 'OTHER'}</span></td>
                                        <td style={{ fontWeight: '600' }}>{res.capacity}</td>
                                        <td style={{ color: '#64748b' }}>{res.location}</td>
                                        <td>
                                            <span className={`hub-badge ${(res.status || 'ACTIVE') === 'ACTIVE' ? 'hub-badge-active' : 'hub-badge-oos'}`}>
                                                ● {(res.status || 'ACTIVE').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px', marginRight: '8px' }} onClick={() => { setEditingResource(res); setFormData(res); setIsModalOpen(true); }}>EDIT</button>
                                            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px', color: '#f87171' }} onClick={() => { setResourceToDelete(res); setIsDeleteModalOpen(true); }}>DELETE</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. Grid Cards Section Replication */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <h2 style={{ color: '#0f4c81', margin: 0, fontSize: '24px' }}>Available Resources</h2>
                        <span className="hub-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>{filteredResources.filter(r => r.status === 'ACTIVE').length} found</span>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {filteredResources.map(res => (
                            <div key={res.id} className="hub-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div className="hub-card-icon">
                                        {res.type === 'LAB' ? '🧪' : res.type === 'LECTURE_HALL' ? '🎭' : '🏢'}
                                    </div>
                                    <span className={`hub-badge ${(res.status || 'ACTIVE') === 'ACTIVE' ? 'hub-badge-active' : 'hub-badge-oos'}`} style={{ fontSize: '10px' }}>
                                        ● {(res.status || 'ACTIVE').replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '20px', color: '#0f4c81', margin: '0 0 4px' }}>{res.name}</h3>
                                <p style={{ color: '#46c1ce', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '24px' }}>{res.type}</p>
                                
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>👤</div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{res.capacity} Seats</div>
                                    </div>
                                    <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                                        <div style={{ color: '#46c1ce', fontSize: '10px', marginBottom: '4px' }}>📍</div>
                                        <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.location}</div>
                                    </div>
                                </div>
                                <button 
                                    className="hub-search-button" 
                                    style={{ width: '100%', borderRadius: '12px' }}
                                    onClick={() => { setResourceToBook(res); setIsBookingModalOpen(true); }}
                                >
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* 7. Add/Edit Modal Replication */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" style={{ padding: '40px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#0f4c81' }}>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
                            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Fill in the details below to register a new resource.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>RESOURCE NAME</label>
                                <input type="text" name="name" className="modern-input" placeholder="e.g. Main Conference Room" value={formData.name} onChange={handleInputChange} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>TYPE</label>
                                    <select name="type" className="modern-input" value={formData.type} onChange={handleInputChange}>
                                        <option value="LECTURE_HALL">Lecture Hall</option>
                                        <option value="LAB">Lab</option>
                                        <option value="MEETING_ROOM">Meeting Room</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>CAPACITY</label>
                                    <input type="number" name="capacity" className="modern-input" min="0" value={formData.capacity} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>LOCATION</label>
                                    <input type="text" name="location" className="modern-input" placeholder="e.g. Floor 3, Block B" value={formData.location} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>CATEGORY</label>
                                    <select className="modern-input">
                                        <option>Select category</option>
                                        <option>Classrooms</option>
                                        <option>Labs</option>
                                        <option>Equipment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>OPERATIONAL STATUS</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <select name="status" className="modern-input" style={{ flex: 1 }} value={formData.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">Set as Active</option>
                                        <option value="OUT_OF_SERVICE">Out of Service</option>
                                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                    </select>
                                    <div className="hub-badge hub-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>● ACTIVE</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, border: 'none', background: '#f8fafc' }} onClick={() => setIsModalOpen(false)}>Discard</button>
                                <button type="submit" className="hub-search-button" style={{ flex: 2 }}>{editingResource ? 'Update Resource' : 'Register Resource'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 8. Delete Confirmation Modal Replication */}
            {isDeleteModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: '64px', height: '64px', background: '#fff1f2', borderRadius: '16px', display: 'grid', placeItems: 'center', margin: '0 auto 24px', color: '#f43f5e' }}>
                            🗑️
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f4c81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DELETE RESOURCE</h2>
                        <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: '800', margin: '0 0 24px' }}>WARNING: THIS ACTION IS PERMANENT.</p>
                        
                        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'left' }}>
                            <div style={{ fontWeight: '800', color: '#0f4c81', fontSize: '14px' }}>{resourceToDelete?.name}</div>
                            <div style={{ fontSize: '10px', color: '#46c1ce', fontWeight: '700' }}>{resourceToDelete?.type} • {resourceToDelete?.location}</div>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '32px' }}>
                            Are you sure you want to delete this resource? All data associated with <strong>{resourceToDelete?.name}</strong> will be permanently removed from the system.
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-outline" style={{ flex: 1, border: 'none', background: '#f8fafc' }} onClick={() => setIsDeleteModalOpen(false)}>KEEP IT</button>
                            <button className="hub-btn-danger" style={{ flex: 1.5 }} onClick={confirmDelete}>CONFIRM DELETE</button>
                        </div>
                    </div>
                </div>
            )}
            {/* 9. Booking Modal */}
            {isBookingModalOpen && resourceToBook && (
                <BookingModal 
                    resource={resourceToBook} 
                    onClose={() => setIsBookingModalOpen(false)} 
                    onSuccess={() => {
                        alert('Booking request submitted successfully! An admin will review it.');
                        fetchResources();
                    }}
                />
            )}
        </div>
    );
}
