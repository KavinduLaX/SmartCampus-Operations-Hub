import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { user: authUser, profile: authProfile, loading, reload } = useAuth() || {}
  const [updatingRole, setUpdatingRole] = useState(false)
  const navigate = useNavigate()

  const loggedIn = authUser && (authUser.sub || authUser.id)

  useEffect(() => {
    const syncRole = async () => {
      if (loading || !loggedIn || updatingRole) return

      const storedRole = localStorage.getItem('smartCampusRole')
      if (!storedRole || (authProfile && storedRole === authProfile.role)) return

      try {
        setUpdatingRole(true)
        const res = await fetch('/api/user/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ role: storedRole })
        })

        if (res.ok) {
          // refresh profile from auth provider
          if (reload) await reload()
        }
      } finally {
        setUpdatingRole(false)
      }
    }

    syncRole()
  }, [loading, loggedIn, authProfile, updatingRole, reload])

  useEffect(() => {
    if (!loading && loggedIn) {
      const role = (authProfile && authProfile.role) || localStorage.getItem('smartCampusRole') || 'USER'
      navigate(`/dashboard/${role.toLowerCase()}`, { replace: true })
    }
  }, [loading, loggedIn, authProfile, navigate])

  const displayRole = (authProfile && authProfile.role) || localStorage.getItem('smartCampusRole') || 'USER'

  if (loading) {
    return (
      <main className="page">
        <div className="login-card">
          <h1 style={{ marginTop: 0 }}>Dashboard</h1>
          <p className="helper">Loading your profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        {!loggedIn && (
          <div>
            <p className="status-warn">You are not signed in.</p>
            <Link to="/login"><button className="btn btn-primary">Go to Login</button></Link>
          </div>
        )}

        {loggedIn && (
          <div>
            <p className="status-ok">Signed in as {authUser.name || authUser.email}</p>
            <div className="role-row" style={{ marginTop: 12 }}>
              <span className="helper">Role: {displayRole.replace('_', ' ')}</span>
              <LogoutButton className="btn btn-outline">Logout</LogoutButton>
            </div>
            {authProfile && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ marginTop: 0 }}>MongoDB Profile</h4>
                <p className="helper">Name: {authProfile.name || '-'}</p>
                <p className="helper">Email: {authProfile.email || '-'}</p>
                <p className="helper">Role: {authProfile.role || '-'}</p>
                <p className="helper">Provider: {authProfile.provider || '-'}</p>
                <p className="helper">Updated: {authProfile.updatedAt || '-'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
