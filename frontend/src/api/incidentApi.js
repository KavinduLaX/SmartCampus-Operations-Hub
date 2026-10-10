const API_BASE = '/api/incidents'

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Request failed with status ${res.status}`)
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}

export const getAllIncidents = () => request('')

export const getMyIncidents = () => request('/my')

export const getAssignedIncidents = () => request('/assigned')

export const getIncidentById = (id) => request(`/${id}`)

export const createIncident = (payload) =>
  request('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

export const updateIncidentStatus = (id, status, resolutionNotes = '') =>
  request(`/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, resolutionNotes })
  })

export const assignTechnician = (id, technicianId) =>
  request(`/${id}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ technicianId })
  })

export const addComment = (id, content) =>
  request(`/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  })

export const deleteComment = (ticketId, commentId) =>
  request(`/${ticketId}/comments/${commentId}`, {
    method: 'DELETE'
  })

export const getAllUsers = async () => {
  const res = await fetch(`/admin/api/users`, {
    credentials: 'include'
  })
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export const getAllTechnicians = async () => {
  const users = await getAllUsers()
  return users.filter(u => u.role === 'TECHNICIAN')
}


export const uploadAttachments = async (id, files) => {
  const formData = new FormData()
  Array.from(files || []).forEach((file) => formData.append('files', file))

  const res = await fetch(`${API_BASE}/${id}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Upload failed with status ${res.status}`)
  }

  return res.json()
}

export const deleteIncident = (id) =>
  request(`/${id}`, {
    method: 'DELETE'
  })
