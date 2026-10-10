import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const [status, setStatus] = useState({ oauthEnabled: false })
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState('USER')
  const [view, setView] = useState('login') // 'login' or 'signup'
  const [signupForm, setSignupForm] = useState({
    email: 'IT@smart.iitus',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    faculty: 'Computing Faculty'
  })

  const roleOptions = ['USER', 'ADMIN', 'STUDENT', 'TECHNICIAN', 'MANAGER']

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' })
        const json = await res.json()
        setStatus(json)
      } catch (error) {
        setStatus({ oauthEnabled: false, error: 'Backend not reachable' })
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  useEffect(() => {
    if (!loading && auth?.user) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, auth, navigate])

  const handleGoogleLogin = () => {
    localStorage.setItem('smartCampusRole', selectedRole)
    window.location.href = status.authorizationUrl || '/oauth2/authorization/google'
  }

  const handleLocalLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!username) {
      setError('Username cannot be blank')
      return
    }
    if (!password) {
      setError('Password cannot be blank')
      return
    }
    
    const res = await auth.loginLocal(username, password, selectedRole)
    if (res?.ok) {
      const trueRole = res.role || selectedRole;
      localStorage.setItem('smartCampusRole', trueRole)
      navigate(`/dashboard/${trueRole.toLowerCase()}`, { replace: true })
    } else {
      setError(res?.message || 'Invalid credentials')
    }
  }

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    const { email, password, confirmPassword, contactNumber, faculty } = signupForm

    if (!email) {
      setError('Email cannot be blank')
      return
    }
    if (!password) {
      setError('Password cannot be blank')
      return
    }
    if (!contactNumber) {
      setError('Contact number cannot be blank')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&./#()]).{8,}$/;
    if (!passwordRegex.test(password)) {
        setError('Password must contain letters, numbers, and special characters, and be at least 8 characters long');
        return
    }

    if (faculty === 'Computing Faculty' && !email.startsWith('IT')) {
        setError('Computing Faculty email must start with IT')
        return
    }
    if (faculty === 'Engineering Faculty' && !email.startsWith('EN')) {
        setError('Engineering Faculty email must start with EN')
        return
    }
    if (faculty === 'Medical Faculty' && !email.startsWith('ME')) {
        setError('Medical Faculty email must start with ME')
        return
    }

    const emailRegex = /^[A-Z]{2}\d{8}@smart\.iitus$/;
    if (!emailRegex.test(email)) {
        setError('Email must have exactly 8 digits after the prefix and end with @smart.iitus');
        return
    }

    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contactNumber)) {
        setError('Contact number must be exactly 10 digits');
        return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, faculty, contactNumber })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Signup successful! Please log in.')
        setView('login')
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (err) {
      setError('Server error during signup')
    }
  }

  if (loading) {
    return <div className="auth-page"><p className="helper">Establishing secure connection...</p></div>
  }

  return (
    <div className="auth-page">
      <div className="login-container">
        <div className="auth-header">
            <div className="sidebar-brand" style={{ padding: 0, justifyContent: 'center', marginBottom: '16px' }}>
                <div className="brand-mark" style={{ background: 'var(--primary-gradient)' }}>SC</div>
                <span className="brand-name" style={{ color: '#0f172a', fontSize: '24px' }}>SmartCampus</span>
            </div>
          <h1>{view === 'login' ? 'Welcome back' : 'Create Account'}</h1>
          <p>{view === 'login' ? 'Please enter your details to sign in' : 'Register with your campus credentials'}</p>
        </div>

        {view === 'login' ? (
          <>
            <form onSubmit={handleLocalLogin}>
              <div className="input-group">
                <label className="input-label">USERNAME / CAMPUS MAIL</label>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="e.g. IT2024001@smart.iitus"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">PASSWORD</label>
                <input 
                  type="password" 
                  className="modern-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">LOGIN AS</label>
                <select 
                    className="modern-input" 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ appearance: 'none', background: '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center', backgroundSize: '16px' }}
                >
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {error && <p className="status-warn" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px' }}>
                Sign in
              </button>
            </form>

            <div className="auth-divider">or</div>

            <button className="google-btn" onClick={handleGoogleLogin}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Log in with Google
            </button>

            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '12px', border: '1px dashed var(--primary)', color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.02)' }}
              onClick={() => setView('signup')}
            >
              Signup with campus mail
            </button>

            <p className="helper" style={{ textAlign: 'center', marginTop: '32px' }}>
              Don't have an account? <span onClick={() => setView('signup')} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Sign up now</span>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleSignup}>
              <div className="input-group">
                <label className="input-label">FACULTY</label>
                <select 
                    name="faculty"
                    className="modern-input" 
                    value={signupForm.faculty} 
                    onChange={(e) => {
                        const fac = e.target.value;
                        let prefix = 'IT';
                        if (fac === 'Engineering Faculty') prefix = 'EN';
                        if (fac === 'Medical Faculty') prefix = 'ME';
                        setSignupForm({ 
                            ...signupForm, 
                            faculty: fac,
                            email: `${prefix}@smart.iitus`
                        });
                    }}
                    style={{ appearance: 'none', background: '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center', backgroundSize: '16px' }}
                >
                  <option value="Computing Faculty">Computing Faculty (IT...)</option>
                  <option value="Engineering Faculty">Engineering Faculty (EN...)</option>
                  <option value="Medical Faculty">Medical Faculty (ME...)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">CAMPUS MAIL</label>
                <input 
                  type="text" 
                  name="email"
                  className="modern-input" 
                  placeholder="e.g. IT20241234@smart.iitus"
                  value={signupForm.email}
                  onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      const prefix = val.substring(0, 2);
                      const suffix = "@smart.iitus";
                      
                      // If the user tries to delete everything or type over, we need to be careful
                      // We expect [XX][digits][@smart.iitus]
                      // Let's extract the middle part
                      let middle = "";
                      if (val.includes("@")) {
                          middle = val.substring(2, val.indexOf("@"));
                      } else {
                          middle = val.substring(2);
                      }

                      // Clean middle to only allow 8 digits
                      const cleanMiddle = middle.replace(/\D/g, '').substring(0, 8);
                      
                      setSignupForm({ 
                          ...signupForm, 
                          email: `${prefix}${cleanMiddle}${suffix}`
                      });
                  }}
                />
                <p className="helper-text" style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Tip: Enter your ID between the prefix and @smart.iitus
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">CONTACT NUMBER</label>
                <input 
                  type="text" 
                  name="contactNumber"
                  className="modern-input" 
                  placeholder="e.g. 0771234567"
                  value={signupForm.contactNumber}
                  onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                      setSignupForm({ ...signupForm, contactNumber: val });
                  }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">PASSWORD</label>
                <input 
                  type="password" 
                  name="password"
                  className="modern-input" 
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">CONFIRM PASSWORD</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  className="modern-input" 
                  placeholder="••••••••"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange}
                />
              </div>

              {error && <p className="status-warn" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
                Create Account
              </button>
            </form>

            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => setView('login')}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
