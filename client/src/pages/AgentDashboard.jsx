import React, { useEffect, useState } from 'react';
import { api } from '../api/http';
import ComplaintList from '../components/ComplaintList';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { tr } = usePreferences();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get('/complaints').then(({ data }) => setComplaints(data));
  }, []);

  return (
    <div className="page dashboard-page">
      <div className="page-title">
        <h1>{tr('welcomeBack')}, {tr('officer')} {user?.name}</h1>
        <p>{tr('agentDashboardCopy')}</p>
      </div>
      <div className="stats">
        <StatCard label={tr('assigned')} value={complaints.length} />
        <StatCard label={tr('inProgress')} value={complaints.filter((c) => c.status === 'IN_PROGRESS').length} />
        <StatCard label={tr('resolved')} value={complaints.filter((c) => c.status === 'RESOLVED').length} />
      </div>
      <ComplaintList complaints={complaints} showUser showTracking />
    </div>
  );
}
