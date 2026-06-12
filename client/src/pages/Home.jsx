import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { api } from '../api/http';

export default function Home() {
  const { user } = useAuth();
  const { tr, translateText } = usePreferences();
  const [announcements, setAnnouncements] = useState([]);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    api.get('/portal/announcements').then(({ data }) => setAnnouncements(data)).catch(() => setAnnouncements([]));
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  async function trackComplaint(event) {
    event.preventDefault();
    setTrackError('');
    setTrackResult(null);
    try {
      const { data } = await api.get(`/complaints/track/${trackId.trim().toUpperCase()}`);
      setTrackResult(data);
    } catch (error) {
      setTrackError(error.response?.data?.message || tr('complaintNotFound'));
    }
  }

  return (
    <div className="home-page">
      <section className="portal-banner">
        <div className="portal-brand">
          <div className="portal-logo">RX</div>
          <div>
            <span className="portal-kicker">{tr('portalOpen')}</span>
            <h1>{tr('portalTitle')}</h1>
            <p>{tr('portalCopy')}</p>
          </div>
        </div>
        <div className="portal-access">
          <Link className="btn btn-primary" to="/register">{tr('registerComplaint')}</Link>
          <div className="portal-logins">
            <Link to="/login/user">{tr('userLogin')}</Link>
            <Link to="/login/agent">{tr('officerLogin')}</Link>
            <Link to="/login/admin">{tr('adminLogin')}</Link>
          </div>
        </div>
      </section>

      <div className="portal-grid">
        <section className="track-panel">
          <span className="eyebrow">{tr('trackComplaint')}</span>
          <h2>{tr('portalNote')}</h2>
          <form className="track-form" onSubmit={trackComplaint}>
            <input className="input" placeholder={tr('trackingPlaceholder')} value={trackId} onChange={(event) => setTrackId(event.target.value)} required />
            <button className="btn btn-secondary">{tr('trackComplaint')}</button>
          </form>
          {trackResult && (
            <div className="track-result">
              <div><strong>{trackResult.trackingId}</strong><p>{trackResult.title}</p></div>
              <span className={`status-pill status-${trackResult.status.toLowerCase()}`}>{trackResult.status}</span>
            </div>
          )}
          {trackError && <p className="track-error">{trackError}</p>}
        </section>

        <section className="announcement-panel">
          <div className="section-heading"><span className="announcement-dot" /><h2>{tr('announcements')}</h2></div>
          {announcements.length ? announcements.map((item) => (
            <article className="announcement-item" key={item._id}>
              <strong>{translateText(item.title)}</strong>
              <p>{translateText(item.message)}</p>
              <small>{new Date(item.createdAt).toLocaleDateString()}</small>
            </article>
          )) : <p className="muted-text">{tr('noAnnouncements')}</p>}
        </section>
      </div>
    </div>
  );
}
