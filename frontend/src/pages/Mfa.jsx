import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Mfa() {
    const { user, login } = useAuth() || {}
    const [code, setCode] = useState('')
    const [status, setStatus] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        // If user is already fully logged in (no mfaRequired flag), redirect to dashboard
        if (user && !user.mfaRequired) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const handleVerify = async (e) => {
        e.preventDefault()
        setStatus({ loading: true })
        try {
            const res = await fetch('/api/auth/mfa/verify', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            if (res.ok) {
                // MFA verified, now refresh user state to clear mfaRequired flag
                await login() // This should re-fetch user info
                navigate('/dashboard', { replace: true })
            } else {
                const data = await res.json()
                setStatus({ error: data.message || 'Invalid MFA code' })
            }
        } catch (err) {
            setStatus({ error: 'Verification failed' })
        } finally {
            setStatus({ loading: false })
        }
    }

    return (
        <div className="page fade-in">
            <div className="login-card glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <div className="brand-mark" style={{ margin: '0 auto 24px', background: 'var(--primary-gradient)', width: '64px', height: '64px', fontSize: '24px' }}>SC</div>
                <h1 className="title">Two-Step Verification</h1>
                <p className="helper">Enter the 6-digit code from your Microsoft Authenticator app to continue.</p>

                <form onSubmit={handleVerify} style={{ marginTop: '32px' }}>
                    <input 
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="000000"
                        className="modern-input"
                        style={{ width: '100%', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}
                        maxLength={6}
                        autoFocus
                    />

                    {status.error && <p className="status-warn" style={{ marginBottom: '24px' }}>⚠ {status.error}</p>}

                    <button className="btn btn-primary" type="submit" disabled={status.loading} style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>
                        {status.loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>

                <button 
                    className="btn btn-outline" 
                    style={{ marginTop: '16px', width: '100%', border: 'none' }}
                    onClick={() => window.location.href = '/api/auth/logout'}
                >
                    Cancel and Sign Out
                </button>
            </div>
        </div>
    )
}
