import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/http';
import ComplaintList from '../components/ComplaintList';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tr } = usePreferences();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [assignment, setAssignment] = useState({ complaintId: '', agentId: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', department: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', password: '', role: 'AGENT', department: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [complaintRes, userRes, agentRes, categoryRes, announcementRes] = await Promise.all([
      api.get('/complaints'),
      api.get('/users'),
      api.get('/users/agents'),
      api.get('/portal/categories'),
      api.get('/portal/announcements')
    ]);
    setComplaints(complaintRes.data);
    setUsers(userRes.data);
    setAgents(agentRes.data);
    setCategories(categoryRes.data);
    setAnnouncements(announcementRes.data);
  }

  async function createCategory(event) {
    event.preventDefault();
    try {
      await api.post('/portal/categories', categoryForm);
      setCategoryForm({ name: '', department: '' });
      loadData();
      toast.success('Category created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Category could not be created');
    }
  }

  async function createAnnouncement(event) {
    event.preventDefault();
    try {
      await api.post('/portal/announcements', announcementForm);
      setAnnouncementForm({ title: '', message: '' });
      loadData();
      toast.success('Announcement published');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Announcement could not be published');
    }
  }

  async function removePortalItem(type, id) {
    try {
      await api.delete(`/portal/${type}/${id}`);
      loadData();
      toast.success('Record removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Record could not be removed');
    }
  }

  async function deactivateUser(id) {
    try {
      await api.delete(`/admin/users/${id}`);
      loadData();
      toast.success('Account deactivated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Account could not be deactivated');
    }
  }

  async function createAccount(event) {
    event.preventDefault();
    try {
      await api.post('/admin/users', accountForm);
      setAccountForm({ name: '', email: '', phone: '', password: '', role: 'AGENT', department: '' });
      loadData();
      toast.success('Account created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Account could not be created');
    }
  }

  async function assignComplaint(event) {
    event.preventDefault();
    try {
      await api.patch(`/complaints/${assignment.complaintId}/assign`, { agentId: assignment.agentId });
      toast.success('Complaint assigned');
      setAssignment({ complaintId: '', agentId: '' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  }

  const userCount = useMemo(() => users.filter((u) => u.role === 'USER').length, [users]);

  return (
    <div className="page dashboard-page">
      <div className="page-title">
        <h1>{tr('welcomeBack')}, {tr('admin')} {user?.name}</h1>
        <p>{tr('adminCopy')}</p>
      </div>

      <div className="stats">
        <StatCard label={tr('complaints')} value={complaints.length} />
        <StatCard label={tr('users')} value={userCount} />
        <StatCard label={tr('agents')} value={agents.length} />
        <StatCard label={tr('resolved')} value={complaints.filter((c) => c.status === 'RESOLVED').length} />
      </div>

      <div className="two-column">
        <form className="panel" onSubmit={assignComplaint}>
          <h2>{tr('assignComplaint')}</h2>
          <select className="input" value={assignment.complaintId} onChange={(e) => setAssignment({ ...assignment, complaintId: e.target.value })} required>
            <option value="">{tr('selectComplaint')}</option>
            {complaints.map((complaint) => <option key={complaint._id} value={complaint._id}>{complaint.title}</option>)}
          </select>
          <select className="input" value={assignment.agentId} onChange={(e) => setAssignment({ ...assignment, agentId: e.target.value })} required>
            <option value="">{tr('selectAgent')}</option>
            {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name} - {agent.department || 'Department not set'}</option>)}
          </select>
          <button className="btn btn-primary">{tr('assign')}</button>
        </form>

        <div className="panel">
          <h2>{tr('officerPerformance')}</h2>
          <div className="list">
            {agents.map((agent) => (
              <div className="list-row" key={agent._id}>
                <span>{agent.name}</span>
                <strong>{Number(agent.ratingAverage || 0).toFixed(1)} / 5 ({agent.ratingCount || 0})</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ComplaintList complaints={complaints} showUser showAgent />

      <div className="two-column">
        <section className="panel">
          <h2>{tr('complaintCategories')}</h2>
          <form onSubmit={createCategory}>
            <input className="input" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
            <input className="input" placeholder="Responsible department" value={categoryForm.department} onChange={(e) => setCategoryForm({ ...categoryForm, department: e.target.value })} required />
            <button className="btn btn-primary">{tr('addCategory')}</button>
          </form>
          <div className="list management-list">
            {categories.map((item) => (
              <div className="list-row" key={item._id}>
                <span><strong>{item.name}</strong><br /><small>{item.department}</small></span>
                <button className="btn btn-sm" onClick={() => removePortalItem('categories', item._id)}>{tr('delete')}</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>{tr('announcements')}</h2>
          <form onSubmit={createAnnouncement}>
            <input className="input" placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
            <textarea className="input" placeholder="Announcement" value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} required />
            <button className="btn btn-primary">{tr('publish')}</button>
          </form>
          <div className="list management-list">
            {announcements.map((item) => (
              <div className="list-row" key={item._id}>
                <span><strong>{item.title}</strong><br /><small>{item.message}</small></span>
                <button className="btn btn-sm" onClick={() => removePortalItem('announcements', item._id)}>{tr('delete')}</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel management-section">
        <h2>{tr('accounts')}</h2>
        <form className="form-grid" onSubmit={createAccount}>
          <input className="input" placeholder="Full name" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} required />
          <input className="input" placeholder="Phone" value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} />
          <input className="input" type="password" minLength="8" placeholder="Temporary password" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} required />
          <select className="input" value={accountForm.role} onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}>
            {['USER', 'AGENT', 'SENIOR_AGENT', 'ADMIN'].map((role) => <option key={role}>{role}</option>)}
          </select>
          <input className="input" placeholder="Department" value={accountForm.department} onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })} />
          <button className="btn btn-primary">{tr('createAccountButton')}</button>
        </form>
        <div className="list">
          {users.map((account) => (
            <div className="list-row" key={account._id}>
              <span><strong>{account.name}</strong><br /><small>{account.email} · {account.role}</small></span>
              {account.active && account._id !== user?._id && (
                <button className="btn btn-sm" onClick={() => deactivateUser(account._id)}>{tr('deactivate')}</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
