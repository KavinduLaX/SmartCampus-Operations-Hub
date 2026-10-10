import React, { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = '/api/resources'

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: 0,
  location: '',
  availabilityWindows: '08:00-17:00',
  status: 'ACTIVE',
  description: ''
}

export default function AdminResourcesPanel() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [resourceToDelete, setResourceToDelete] = useState(null)

  const [searchType, setSearchType] = useState('')
  const [searchCapacity, setSearchCapacity] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(API_BASE_URL, { credentials: 'include' })
      if (!response.ok) throw new Error('System link offline')
      const data = await response.json()
      setResources(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => setFormData(emptyForm)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const startAdd = () => {
    setEditingResource(null)
    resetForm()
    setIsModalOpen(true)
  }

  const startEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name || '',
      type: resource.type || 'LECTURE_HALL',
      capacity: resource.capacity || 0,
      location: resource.location || '',
      availabilityWindows: resource.availabilityWindows || '08:00-17:00',
      status: resource.status || 'ACTIVE',
      description: resource.description || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const method = editingResource ? 'PUT' : 'POST'
    const url = editingResource ? `${API_BASE_URL}/${editingResource.id}` : API_BASE_URL

    try {
      setError('')
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Data sync failed')
      }

      setIsModalOpen(false)
      setEditingResource(null)
      resetForm()
      fetchResources()
    } catch (err) {
      setError(err.message || 'Failed to save resource')
    }
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return
    try {
      setError('')
      const response = await fetch(`${API_BASE_URL}/${resourceToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Decommission failed')
      setIsDeleteModalOpen(false)
      setResourceToDelete(null)
      fetchResources()
    } catch (err) {
      setError(err.message || 'Failed to delete resource')
    }
  }

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const typeValue = (res.type || '').toLowerCase()
      const locationValue = (res.location || '').toLowerCase()
      const matchesType = typeValue.includes(searchType.toLowerCase())
      const matchesCapacity = !searchCapacity || res.capacity >= Number.parseInt(searchCapacity, 10)
      const matchesLocation = locationValue.includes(searchLocation.toLowerCase())
      return matchesType && matchesCapacity && matchesLocation
    })
  }, [resources, searchType, searchCapacity, searchLocation])

  return (
    <>
      <section className="file-table-section" id="available-facilities">
        <div className="section-header">
          <div>
            <p className="breadcrumbs">Available facilities</p>
            <h2 style={{ margin: 0 }}>Resource Management</h2>
            <p className="helper">Admin-only control of campus resources and availability.</p>
          </div>
          <div className="table-actions">
            <span className="badge">{filteredResources.length} resources</span>
            <button type="button" className="btn btn-primary" onClick={startAdd}>Add Resource</button>
          </div>
        </div>

        {error && <p className="status-warn" style={{ marginTop: 0 }}>{error}</p>}
        {loading && <p className="helper">Loading resources...</p>}

        <div className="hub-search-bar" style={{ marginBottom: '28px' }}>
          <select
            className="hub-search-input"
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
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
            onChange={(event) => setSearchCapacity(event.target.value)}
          />
          <input
            className="hub-search-input"
            placeholder="Location"
            value={searchLocation}
            onChange={(event) => setSearchLocation(event.target.value)}
          />
          <button type="button" className="hub-search-button">Search</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#0f4c81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource Inventory</h3>
            <span className="hub-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>{filteredResources.length} resources</span>
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
              {filteredResources.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: '700' }}>{res.name}</td>
                  <td style={{ color: '#64748b' }}>{res.type}</td>
                  <td>
                    <span className="hub-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                      {res.type === 'LAB' ? 'LABS' : res.type === 'LECTURE_HALL' ? 'LECTURE HALLS' : 'OTHER'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{res.capacity}</td>
                  <td style={{ color: '#64748b' }}>{res.location}</td>
                  <td>
                    <span className={`hub-badge ${res.status === 'ACTIVE' ? 'hub-badge-active' : 'hub-badge-oos'}`}>
                      ● {res.status ? res.status.replace('_', ' ') : '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '11px', marginRight: '8px' }}
                      onClick={() => startEdit(res)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '11px', color: '#f87171' }}
                      onClick={() => { setResourceToDelete(res); setIsDeleteModalOpen(true) }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <h3 style={{ color: '#0f4c81', margin: 0, fontSize: '20px' }}>Available Resources</h3>
            <span className="hub-badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              {filteredResources.filter((resource) => resource.status === 'ACTIVE').length} found
            </span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredResources.map((res) => (
              <div key={res.id} className="hub-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div className="hub-card-icon">
                    {res.type === 'LAB' ? '🧪' : res.type === 'LECTURE_HALL' ? '🎭' : '🏢'}
                  </div>
                  <span
                    className={`hub-badge ${res.status === 'ACTIVE' ? 'hub-badge-active' : 'hub-badge-oos'}`}
                    style={{ fontSize: '10px' }}
                  >
                    ● {res.status ? res.status.replace('_', ' ') : '-'}
                  </span>
                </div>
                <h4 style={{ fontSize: '18px', color: '#0f4c81', margin: '0 0 4px' }}>{res.name}</h4>
                <p style={{ color: '#46c1ce', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '20px' }}>
                  {res.type}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>👤</div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{res.capacity} Seats</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', padding: '12px', borderRadius: '16px' }}>
                    <div style={{ color: '#46c1ce', fontSize: '10px', marginBottom: '4px' }}>📍</div>
                    <div style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {res.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ padding: '40px' }} onClick={(event) => event.stopPropagation()}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#0f4c81' }}>
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                Fill in the details below to register a new resource.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>RESOURCE NAME</label>
                <input
                  type="text"
                  name="name"
                  className="modern-input"
                  placeholder="e.g. Main Conference Room"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
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
                  <input
                    type="number"
                    name="capacity"
                    className="modern-input"
                    min="0"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0f4c81' }}>LOCATION</label>
                  <input
                    type="text"
                    name="location"
                    className="modern-input"
                    placeholder="e.g. Floor 3, Block B"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
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
                  <select
                    name="status"
                    className="modern-input"
                    style={{ flex: 1 }}
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ACTIVE">Set as Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  </select>
                  <div className="hub-badge hub-badge-active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>● ACTIVE</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, border: 'none', background: '#f8fafc' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Discard
                </button>
                <button type="submit" className="hub-search-button" style={{ flex: 2 }}>
                  {editingResource ? 'Update Resource' : 'Register Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#fff1f2',
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 24px',
                color: '#f43f5e'
              }}
            >
              🗑️
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f4c81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DELETE RESOURCE
            </h2>
            <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: '800', margin: '0 0 24px' }}>
              WARNING: THIS ACTION IS PERMANENT.
            </p>

            <div
              style={{
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: '800', color: '#0f4c81', fontSize: '14px' }}>{resourceToDelete?.name}</div>
              <div style={{ fontSize: '10px', color: '#46c1ce', fontWeight: '700' }}>
                {resourceToDelete?.type} • {resourceToDelete?.location}
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '32px' }}>
              Are you sure you want to delete this resource? All data associated with <strong>{resourceToDelete?.name}</strong>{' '}
              will be permanently removed from the system.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, border: 'none', background: '#f8fafc' }}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                KEEP IT
              </button>
              <button type="button" className="hub-btn-danger" style={{ flex: 1.5 }} onClick={confirmDelete}>
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
