const API_BASE = '/api/notifications'

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

export const getMyNotifications = () => request('')

export const getUnreadCount = () => request('/unread-count')

export const markAsRead = (id) =>
  request(`/${id}/read`, {
    method: 'PATCH'
  })

export const markAllAsRead = () =>
  request('/read-all', {
    method: 'PATCH'
  })
