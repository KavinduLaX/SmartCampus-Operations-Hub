import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, profile, loading, updateProfile, deleteProfile, reload } = useAuth() || {}
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    picture: '',
    contactNumber: '',
    notificationsEnabled: true,
    mfaEnabled: false,
    newPassword: '',
    confirmNewPassword: ''
  })
  const [status, setStatus] = useState({})
  const [mfaSetup, setMfaSetup] = useState(null)
  const [mfaCode, setMfaCode] = useState('')

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        contactNumber: profile.contactNumber || '',
        notificationsEnabled: profile.notificationsEnabled !== false,
        mfaEnabled: !!profile.mfaEnabled
      }))
    }
  }, [profile])

  if (loading) {
    return (
      <div className="page">
        <div className="login-card glass fade-in" style={{ textAlign: 'center' }}>
          <h1 className="title">Loading Profile...</h1>
        </div>
      </div>
    )
  }

  const handleChange = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((s) => ({ ...s, [k]: val }))
  }

  const handleMfaToggle = async (e) => {
    const enabled = e.target.checked
    if (enabled) {
      // Start setup flow
      setStatus({ settingUpMfa: true })
      try {
        const res = await fetch('/api/user/mfa/setup', { credentials: 'include' })
        const data = await res.json()
        setMfaSetup(data)
      } catch (err) {
        setStatus({ error: 'Failed to start MFA setup' })
      } finally {
        setStatus({ settingUpMfa: false })
      }
    } else {
      // Disable MFA
      if (!window.confirm('Disable MFA? This will reduce your account security.')) return
      setStatus({ saving: true })
      try {
        await fetch('/api/user/mfa/disable', { method: 'POST', credentials: 'include' })
        await reload()
        setStatus({ saved: true })
        setTimeout(() => setStatus({}), 3000)
      } catch (err) {
        setStatus({ error: 'Failed to disable MFA' })
      } finally {
        setStatus({ saving: false })
      }
    }
  }

  const verifyMfaSetup = async () => {
    setStatus({ saving: true })
    try {
      const res = await fetch('/api/user/mfa/enable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode, secret: mfaSetup.secret })
      })
      if (res.ok) {
        await reload()
        setMfaSetup(null)
        setMfaCode('')
        setStatus({ saved: true })
        setTimeout(() => setStatus({}), 3000)
      } else {
        const data = await res.json()
        setStatus({ error: data.message || 'Invalid code' })
      }
    } catch (err) {
      setStatus({ error: 'Verification failed' })
    } finally {
      setStatus({ saving: false })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate password if user is trying to change it
    if (form.newPassword) {
        if (form.newPassword !== form.confirmNewPassword) {
            setStatus({ error: 'Passwords do not match' })
            return
        }
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&./#()]).{8,}$/;
        if (!passwordRegex.test(form.newPassword)) {
            setStatus({ error: 'New password must contain letters, numbers, and special characters, and be at least 8 characters long' });
            return
        }
    }

    // Validate contact number if present
    if (form.contactNumber && !/^\d{10}$/.test(form.contactNumber)) {
        setStatus({ error: 'Contact number must be exactly 10 digits' });
        return
    }

    setStatus({ saving: true })
    const { mfaEnabled, confirmNewPassword, ...rest } = form
    
    // If password is empty string, don't send it
    if (!rest.newPassword) delete rest.newPassword;

    const res = await updateProfile(rest)
    if (res && res.ok) {
      setStatus({ saved: true })
      // Clear password fields on success
      setForm(prev => ({ ...prev, newPassword: '', confirmNewPassword: '' }))
      setTimeout(() => setStatus({}), 3000)
    } else {
      setStatus({ error: (res && res.message) || 'Failed to save' })
    }
  }

  const handleDelete = async () => {
    const ok = window.confirm('Delete your account? This cannot be undone.')
    if (!ok) return
    setStatus({ deleting: true })
    const res = await deleteProfile()
    if (res && res.ok) {
      setStatus({ deleted: true })
      setTimeout(() => navigate('/', { replace: true }), 1000)
    } else {
      setStatus({ error: (res && res.message) || 'Failed to delete' })
    }
  }

  const isLocalUser = profile?.provider === 'local-campus';

  return (
    <main className="page fade-in">
      <div className="login-card glass" style={{ maxWidth: '600px', padding: '40px' }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <img 
                    src={profile?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'User')}&background=random&color=fff&size=100`} 
                    alt="Profile" 
                    style={{ width: '100px', height: '100px', borderRadius: '30px', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} 
                />
            </div>
            <h1 className="title" style={{ fontSize: '28px', marginBottom: '8px' }}>Account Settings</h1>
            <p className="helper">Manage your profile information and preferences</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '20px', marginTop: 0 }}>
            <div className="input-group">
                <label className="section-title" style={{ display: 'block', marginBottom: '8px' }}>Full Name</label>
                <input 
                    value={form.name} 
                    onChange={handleChange('name')} 
                    className="modern-input" 
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}
                />
            </div>

            <div className="input-group">
                <label className="section-title" style={{ display: 'block', marginBottom: '8px' }}>Email Address</label>
                <input 
                    value={form.email} 
                    onChange={handleChange('email')} 
                    className="modern-input" 
                    placeholder="Enter your email"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc', color: 'var(--muted)' }}
                    readOnly
                />
            </div>

            <div className="input-group">
                <label className="section-title" style={{ display: 'block', marginBottom: '8px' }}>Contact Number</label>
                <input 
                    value={form.contactNumber} 
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                        setForm(s => ({ ...s, contactNumber: val }));
                    }} 
                    className="modern-input" 
                    placeholder="e.g. 0771234567"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}
                />
            </div>

            {isLocalUser && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                    <p className="section-title" style={{ marginBottom: '16px', color: 'var(--primary)', fontWeight: '600' }}>Reset Password</p>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="section-title" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>New Password</label>
                        <input 
                            type="password"
                            value={form.newPassword} 
                            onChange={handleChange('newPassword')} 
                            className="modern-input" 
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}
                        />
                    </div>
                    <div className="input-group">
                        <label className="section-title" style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>Confirm New Password</label>
                        <input 
                            type="password"
                            value={form.confirmNewPassword} 
                            onChange={handleChange('confirmNewPassword')} 
                            className="modern-input" 
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: '#f8fafc' }}
                        />
                    </div>
                </div>
            )}

            <div style={{ 
                background: 'rgba(37, 99, 235, 0.05)', 
                padding: '16px', 
                borderRadius: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '12px'
            }}>
                <div>
                    <p style={{ fontWeight: '600', margin: 0 }}>Push Notifications</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Receive alerts for tickets and bookings</p>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                    <input 
                        type="checkbox" 
                        checked={form.notificationsEnabled} 
                        onChange={handleChange('notificationsEnabled')}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{ 
                        position: 'absolute', 
                        cursor: 'pointer', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        background: form.notificationsEnabled ? 'var(--primary)' : '#cbd5e1', 
                        transition: '.4s', 
                        borderRadius: '34px' 
                    }}>
                        <span style={{ 
                            position: 'absolute', 
                            content: '""', 
                            height: '20px', width: '20px', 
                            left: form.notificationsEnabled ? '26px' : '4px', 
                            bottom: '3px', 
                            background: 'white', 
                            transition: '.4s', 
                            borderRadius: '50%' 
                        }}></span>
                    </span>
                </label>
            </div>

            <div style={{ 
                background: 'rgba(16, 185, 129, 0.05)', 
                padding: '16px', 
                borderRadius: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '4px'
            }}>
                <div>
                    <p style={{ fontWeight: '600', margin: 0 }}>Multi-Factor Auth (MFA)</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>Secure your account with Microsoft Authenticator</p>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                    <input 
                        type="checkbox" 
                        checked={form.mfaEnabled} 
                        onChange={handleMfaToggle}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{ 
                        position: 'absolute', 
                        cursor: 'pointer', 
                        top: 0, left: 0, right: 0, bottom: 0, 
                        background: form.mfaEnabled ? '#10b981' : '#cbd5e1', 
                        transition: '.4s', 
                        borderRadius: '34px' 
                    }}>
                        <span style={{ 
                            position: 'absolute', 
                            content: '""', 
                            height: '20px', width: '20px', 
                            left: form.mfaEnabled ? '26px' : '4px', 
                            bottom: '3px', 
                            background: 'white', 
                            transition: '.4s', 
                            borderRadius: '50%' 
                        }}></span>
                    </span>
                </label>
            </div>

            {mfaSetup && (
              <div className="fade-in" style={{ background: '#fff', border: '1px solid #10b981', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontWeight: '600', marginBottom: '12px' }}>Setup Microsoft Authenticator</p>
                <img src={mfaSetup.qrCode} alt="QR Code" style={{ width: '180px', height: '180px', marginBottom: '12px' }} />
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Scan this code with your authenticator app and enter the 6-digit code below.</p>
                <input 
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  style={{ width: '100%', padding: '12px', textAlign: 'center', fontSize: '20px', letterSpacing: '4px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '12px' }}
                  maxLength={6}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }} onClick={verifyMfaSetup} disabled={status.saving}>
                    {status.saving ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMfaSetup(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary" type="submit" disabled={status.saving} style={{ width: '100%', padding: '14px', borderRadius: '14px' }}>
              {status.saving ? 'Saving Changes...' : 'Save Preferences'}
            </button>
            
            {status.saved && <p className="status-ok fade-in" style={{ textAlign: 'center', fontSize: '14px' }}>✓ Settings updated successfully!</p>}
            {status.error && <p className="status-warn fade-in" style={{ textAlign: 'center', fontSize: '14px' }}>⚠ {status.error}</p>}
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
            <h3 className="section-title" style={{ color: 'var(--danger)', marginBottom: '16px' }}>Danger Zone</h3>
            <button 
                type="button" 
                className="btn btn-outline hover-lift" 
                onClick={handleDelete} 
                style={{ width: '100%', borderColor: '#fee2e2', color: '#ef4444', background: '#fff' }}
            >
                {status.deleting ? 'Deleting Account...' : 'Delete My Account'}
            </button>
            <p className="helper" style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>Once deleted, your profile data will be permanently removed.</p>
          </div>
        </form>
      </div>
    </main>
  )
}
