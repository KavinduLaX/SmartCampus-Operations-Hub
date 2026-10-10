import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LogoutButton from '../components/LogoutButton';

// Using standard project-relative paths for images in the public folder.
const HERO_IMAGE = '/hero-bg.png';
const STUDENT_IMAGE = '/student-success.png';

export default function Home() {
    const { user } = useAuth();
    return (
        <div className="home-page">
            {/* Custom Header */}
            <header className="home-header">
                <div className="header-top">
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <span>Library</span>
                        <span>Jobs</span>
                        <span>Alumni</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', textTransform: 'none' }}>Staff 🔒</span>
                        <span style={{ cursor: 'pointer' }}>Current Student ▾</span>
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="Search here..." style={{ border: 'none', background: '#f1f5f9', padding: '6px 12px 6px 32px', borderRadius: '4px', fontSize: '12px' }} />
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                        </div>
                        {user ? (
                            <Link to="/dashboard">
                                <button className="btn btn-primary" style={{ borderRadius: '4px', background: '#4338ca', padding: '8px 24px' }}>Dashboard ↗</button>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <button className="btn btn-primary" style={{ borderRadius: '4px', background: '#4338ca', padding: '8px 24px' }}>Log in ↗</button>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="header-bottom">
                    <div className="sidebar-brand" style={{ padding: 0 }}>
                        <div className="brand-mark" style={{ background: '#f97316' }}>SC</div>
                        <span className="brand-name" style={{ color: '#0f172a' }}>SmartCampus</span>
                    </div>
                    <ul className="home-nav-list">
                        <li className="home-nav-item">About ▾</li>
                        <li className="home-nav-item">Faculties ▾</li>
                        <li className="home-nav-item">Academic ▾</li>
                        <li className="home-nav-item">Admission ▾</li>
                        <li className="home-nav-item">Research & Publication ▾</li>
                        <li className="home-nav-item">IQAC ▾</li>
                    </ul>
                </div>
            </header>

            {/* Hero Section */}
            <section className="home-hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
                <div className="hero-content">
                    <span className="hero-tagline">Combine Quality with Morality</span>
                    <h1 className="hero-title">
                        International<br />
                        Information Technology University<br />
                        Sri Lanka.
                    </h1>
                    <div className="hero-actions">
                        <Link to={user ? "/dashboard" : "/login"} className="hero-btn primary">
                            <span>{user ? "Go to Dashboard" : "Admission"}</span>
                            <span>↗</span>
                        </Link>
                        <div className="hero-btn">
                            <span>Research</span>
                            <span>📄</span>
                        </div>
                        <div className="hero-btn">
                            <span>Faculty</span>
                            <span>👥</span>
                        </div>
                        <div className="hero-btn">
                            <span>Events</span>
                            <span>📅</span>
                        </div>
                    </div>
                    <div style={{ marginTop: '64px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📍</span> Colombo, Sri Lanka
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <h2 className="stats-title">Our Success 🎓 stories</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div>
                            <h2>10K+</h2>
                            <p>Regular students</p>
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '32px', opacity: 0.2 }}>🏫</div>
                    </div>
                    <div className="story-card" style={{ backgroundImage: `url(${STUDENT_IMAGE})` }}>
                        <div className="story-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#000' }}>▶</div>
                                <span style={{ fontWeight: '700' }}>Information Technology Education</span>
                            </div>
                            <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>Charuni Lasanthi</p>
                        </div>
                    </div>
                    <div className="stat-card blue">
                        <div>
                            <h2>48K+</h2>
                            <p>Graduate students</p>
                        </div>
                        <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '32px', opacity: 0.2 }}>📜</div>
                    </div>
                    <div className="stat-card green">
                        <div>
                            <h3 style={{ fontSize: '24px', margin: '0 0 8px' }}>Explore IIUD.</h3>
                            <p>View all Articles</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Update Banner */}
            <section className="update-banner">
                <div className="marquee-text">
                    STAY TOUCH WITH UPDATES • STAY TOUCH WITH UPDATES • STAY TOUCH WITH UPDATES • STAY TOUCH WITH UPDATES • STAY TOUCH WITH UPDATES
                </div>
                <div className="banner-overlay">
                    <div className="banner-title">
                        Stay touch with updates <span className="dot"></span>
                    </div>
                </div>
            </section>
        </div>
    );
}
