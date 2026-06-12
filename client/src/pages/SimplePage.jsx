import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/http';
import { usePreferences } from '../context/PreferencesContext';

export default function SimplePage({ type }) {
  const { user } = useAuth();
  const { tr } = usePreferences();
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (type === 'notifications') {
      api.get('/portal/notifications').then(({ data }) => setNotifications(data)).catch(() => setNotifications([]));
    }
  }, [type]);
  const titles = {
    notifications: tr('notifications'),
    profile: tr('profile'),
    reports: tr('reports')
  };

  return (
    <div className="page">
      <div className="page-title">
        <h1>{titles[type]}</h1>
        <p>{user?.name} - {user?.role}</p>
      </div>
      <div className="panel">
        {type === 'notifications' && (
          <div className="list">
            {notifications.length ? notifications.map((item) => (
              <div className="list-row" key={item._id}>
                <span><strong>{item.title}</strong><br />{item.message}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            )) : <p>{tr('noNotifications')}</p>}
          </div>
        )}
        {type === 'profile' && (
          <div className="detail-list">
            <p><strong>{tr('name')}:</strong> {user?.name}</p>
            <p><strong>{tr('email')}:</strong> {user?.email}</p>
            <p><strong>{tr('phone')}:</strong> {user?.phone || tr('notAdded')}</p>
            <p><strong>{tr('role')}:</strong> {user?.role}</p>
          </div>
        )}
        {type === 'reports' && <p>{tr('reportsCopy')}</p>}
      </div>
    </div>
  );
}
