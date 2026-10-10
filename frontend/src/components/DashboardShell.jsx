import React from 'react'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'
import NotificationPanel from './NotificationPanel'
import { getUnreadCount } from '../api/notificationApi'
import { useEffect, useState } from 'react'

export default function DashboardShell({
  title = 'Dashboard',
  roleLabel = 'User',
  activeTab = 'OVERVIEW',
  onTabChange = () => { },
  children
}) {
  const { user, profile } = useAuth() || {}
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await getUnreadCount()
        setUnreadCount(count)
      } catch (err) {
        console.error('Failed to fetch unread count')
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])
  const displayName =
    (profile && profile.name) ||
    (user && (user.name || [user.given_name, user.family_name].filter(Boolean).join(' '))) ||
    ''
  const displayEmail = (profile && profile.email) || (user && user.email) || ''
  const displayRole = ((profile && profile.role) || roleLabel || '').replace('_', ' ')
  const displayProvider = (profile && profile.provider) || ''
  const displayPicture = (profile && profile.picture) || (user && user.picture) || ''
  const updatedAtRaw = profile && profile.updatedAt
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw).toLocaleString() : ''
  const headerTitle = displayName || displayEmail

  const roleValue = (profile && profile.role) || roleLabel || ''
  const roleUpper = roleValue && roleValue.toString().toUpperCase()
  const isAdmin = roleUpper === 'ADMIN'
  const isStudentOrUser = roleUpper === 'STUDENT' || roleUpper === 'USER'

  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">SC</div>
            <span className="brand-name">SmartCampus</span>
          </div>

          <div className="sidebar-section">
            <p className="section-title">Navigation</p>
            <ul className="nav-list">
              {!isAdmin && (
                <li
                  className={`nav-item ${activeTab === 'OVERVIEW' ? 'active' : ''}`}
                  onClick={() => onTabChange('OVERVIEW')}
                >
                  🏠 Overview
                </li>
              )}
              {isStudentOrUser && (
                <li
                  className={`nav-item ${activeTab === 'BOOKINGS' ? 'active' : ''}`}
                  onClick={() => onTabChange('BOOKINGS')}
                >
                  📅 Bookings
                </li>
              )}
              {isAdmin && (
                <>
                   <li
                    className={`nav-item ${activeTab === 'USERS' ? 'active' : ''}`}
                    onClick={() => onTabChange('USERS')}
                  >
                    👥 Users
                  </li>
                  <li
                    className={`nav-item ${activeTab === 'RESOURCES' ? 'active' : ''}`}
                    onClick={() => onTabChange('RESOURCES')}
                  >
                    🏢 Resources
                  </li>
                  <li
                    className={`nav-item ${activeTab === 'BOOKINGS_ADMIN' ? 'active' : ''}`}
                    onClick={() => onTabChange('BOOKINGS_ADMIN')}
                  >
                    🎫 Manage Bookings
                  </li>
                </>
              )}
              <li
                className={`nav-item ${activeTab === 'TICKETS' ? 'active' : ''}`}
                onClick={() => onTabChange('TICKETS')}
              >
                🛠️ Tickets
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <p className="section-title">Services</p>
            <ul className="nav-list">
              <li className="nav-item">
                ⚙️ <Link to="/profile">Settings</Link>
              </li>
            </ul>
          </div>




        </aside>

        <section className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="top-left">
              <h1 className="page-title">{activeTab === 'BOOKINGS' ? 'My Bookings' : title}</h1>

            </div>

            <nav className="top-nav">
              {!isAdmin && (
                <>
                  <button type="button" className={`tab ${activeTab === 'OVERVIEW' ? 'active' : ''}`} onClick={() => onTabChange('OVERVIEW')}>Overview</button>
                  <button type="button" className="tab">Calendar</button>
                </>
              )}
              {isAdmin && (
                <button type="button" className={`tab ${activeTab === 'INSIGHTS' ? 'active' : ''}`} onClick={() => onTabChange('INSIGHTS')}>📊 Campus Insights</button>
              )}
            </nav>

            <div className="top-actions">
              <input
                className="search-input"
                type="search"
                placeholder="Search resources..."
                aria-label="Search"
              />
              <button type="button" className="icon-button" style={{ position: 'relative' }}>
                Alerts
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    border: '2px solid white'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {headerTitle && <div className="user-chip">{headerTitle}</div>}
            </div>
          </header>

          <section className="dashboard-content">
            {children}
          </section>
        </section>

        <aside className="dashboard-panel">
          <div className="panel-header" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {headerTitle && <h2 style={{ fontSize: '18px', margin: 0 }}>{headerTitle}</h2>}
              {displayEmail && <p className="panel-subtitle" style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 12px' }}>{displayEmail}</p>}
              <LogoutButton 
                className="btn btn-outline" 
                style={{ 
                    padding: '6px 12px', 
                    fontSize: '11px', 
                    color: '#ef4444', 
                    borderColor: '#fee2e2',
                    background: '#fff1f2',
                    borderRadius: '8px'
                }}
              >
                Sign Out
              </LogoutButton>
            </div>
            {displayPicture && (
              <img className="profile-photo" src={displayPicture} alt={headerTitle || 'Profile'} style={{ width: '52px', height: '52px', borderRadius: '14px' }} />
            )}
          </div>



          <div className="panel-section">
            <NotificationPanel />
          </div>
        </aside>
      </div>
    </main>
  )
}
