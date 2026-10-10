import React, { useEffect, useState } from 'react'
import { getMyNotifications, markAsRead, markAllAsRead } from '../api/notificationApi'
import { Link } from 'react-router-dom'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && notifications.length === 0) return <p className="helper">Loading notifications...</p>

  return (
    <div className="notification-panel fade-in">
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <p className="section-title">Notifications</p>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllAsRead}
            style={{ 
              fontSize: '10px', 
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(37, 99, 235, 0.1)',
              background: 'rgba(37, 99, 235, 0.05)',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.1)';
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="helper" style={{ textAlign: 'center', padding: '20px 0' }}>No notifications yet.</p>
      ) : (
        <ul className="activity-list">
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`activity-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>
                  {notification.title}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                {notification.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-more)', fontWeight: '500' }}>
                  {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {notification.referenceId && (
                  <Link 
                    to={notification.type === 'BOOKING' ? '/bookings' : `/incidents/${notification.referenceId}`}
                    className="btn-link"
                    style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
