import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth() || {}
  const location = useLocation()

  if (loading) {
    return (
      <main className="page">
        <div className="login-card">
          <h1 style={{ marginTop: 0 }}>Checking authentication...</h1>
        </div>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.mfaRequired && location.pathname !== '/mfa') {
    return <Navigate to="/mfa" replace />
  }

  return children
}
