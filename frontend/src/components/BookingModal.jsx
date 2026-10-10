import React, { useState } from 'react';

export default function BookingModal({ resource, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendeeCount: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEquipment = resource.type === 'EQUIPMENT';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.endTime <= formData.startTime) {
            setError('End time must be after the start time.');
            setLoading(false);
            return;
        }

        const bookingPayload = {
            ...formData,
            resourceId: resource.id,
            resourceName: resource.name,
            attendeeCount: isEquipment ? null : parseInt(formData.attendeeCount)
        };

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Failed to create booking');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ color: '#0f4c81', margin: '0 0 4px' }}>Book {resource.name}</h2>
                    <p className="helper">Secure your slot at {resource.location}</p>
                </div>

                {error && <p className="status-warn" style={{ marginBottom: '16px' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">DATE</label>
                        <input 
                            type="date" 
                            name="date" 
                            className="modern-input" 
                            required 
                            min={new Date().toISOString().split('T')[0]}
                            onChange={handleChange} 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-group">
                            <label className="input-label">START TIME</label>
                            <input type="time" name="startTime" className="modern-input" required onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">END TIME</label>
                            <input type="time" name="endTime" className="modern-input" required onChange={handleChange} />
                        </div>
                    </div>

                    {!isEquipment && (
                        <div className="input-group">
                            <label className="input-label">EXPECTED ATTENDEES</label>
                            <input 
                                type="number" 
                                name="attendeeCount" 
                                className="modern-input" 
                                placeholder="Number of people" 
                                required 
                                onChange={handleChange} 
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">PURPOSE</label>
                        <textarea 
                            name="purpose" 
                            className="modern-input" 
                            style={{ minHeight: '80px', paddingTop: '12px' }}
                            placeholder="Briefly describe the purpose of your booking"
                            required
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="hub-search-button" style={{ flex: 2 }} disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
