import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../api/http';
import ComplaintList from '../components/ComplaintList';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const initialForm = { title: '', description: '', department: '', category: '', location: '', priority: 'Medium', images: [] };

export default function UserDashboard() {
  const { user } = useAuth();
  const { tr, translateText } = usePreferences();
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    loadComplaints();
    api.get('/portal/categories').then(({ data }) => {
      setCategoryOptions(data);
      if (data.length) {
        setForm((current) => ({ ...current, category: data[0].name, department: data[0].department }));
      }
    });
  }, []);

  async function loadComplaints() {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data);
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint(event) {
    event.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'images') payload.append(key, value);
      });
      Array.from(form.images || []).forEach((file) => payload.append('images', file));
      const { data } = await api.post('/complaints', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${tr('complaintSubmitted')} ${data.trackingId}`);
      setForm({
        ...initialForm,
        category: categoryOptions[0]?.name || '',
        department: categoryOptions[0]?.department || ''
      });
      event.target.reset();
      loadComplaints();
    } catch (error) {
      const duplicateId = error.response?.data?.complaintId;
      toast.error(error.response?.data?.message || 'Complaint submission failed');
      if (duplicateId) window.location.href = `/complaints/${duplicateId}`;
    }
  }

  return (
    <div className="page dashboard-page">
      <div className="page-title">
        <h1>{tr('welcomeBack')}, {user?.name}</h1>
        <p>{tr('userDashboardCopy')}</p>
      </div>

      <div className="stats">
        <StatCard label={tr('myComplaints')} value={complaints.length} />
        <StatCard label={tr('active')} value={complaints.filter((c) => !['RESOLVED', 'NOT_RESOLVED'].includes(c.status)).length} />
        <StatCard label={tr('resolved')} value={complaints.filter((c) => c.status === 'RESOLVED').length} />
      </div>

      <div className="two-column">
        <form className="panel" onSubmit={submitComplaint}>
          <h2>{tr('createComplaint')}</h2>
          <input className="input" placeholder={tr('title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input" rows="4" placeholder={tr('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <select
            className="input"
            value={form.category}
            onChange={(e) => {
              const selected = categoryOptions.find((item) => item.name === e.target.value);
              setForm({ ...form, category: e.target.value, department: selected?.department || '' });
            }}
            required
          >
            {categoryOptions.map((item) => <option key={item._id} value={item.name}>{translateText(item.name)}</option>)}
          </select>
          <input className="input" value={form.department} readOnly placeholder={tr('department')} />
          <input className="input" placeholder={tr('location')} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['Critical', 'High', 'Medium', 'Low'].map((item) => <option key={item}>{translateText(item)}</option>)}
          </select>
          <label className="label">{tr('imageEvidence')}</label>
          <input className="input" type="file" accept="image/*" multiple onChange={(e) => setForm({ ...form, images: e.target.files })} />
          <button className="btn btn-primary">{tr('submitComplaint')}</button>
        </form>

        <div>
          {loading ? <div className="panel">{tr('loadingComplaints')}</div> : <ComplaintList complaints={complaints} showAgent showTracking />}
        </div>
      </div>
    </div>
  );
}
