import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../api/http';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { tr, translateText } = usePreferences();
  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '', resolution: '', resolutionImages: [] });
  const [rating, setRating] = useState({ rating: 5, comment: '' });

  useEffect(() => { loadComplaint(); }, [id]);

  async function loadComplaint() {
    const { data } = await api.get(`/complaints/${id}`);
    setComplaint(data);
    setStatusForm((current) => ({ ...current, status: data.status }));
  }

  async function addComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/complaints/${id}/messages`, { message: comment });
    setComplaint(data);
    setComment('');
  }

  async function updateStatus(event) {
    event.preventDefault();
    try {
      const payload = new FormData();
      payload.append('status', statusForm.status);
      payload.append('note', statusForm.note);
      payload.append('resolution', statusForm.resolution);
      Array.from(statusForm.resolutionImages || []).forEach((file) => payload.append('resolutionImages', file));
      const { data } = await api.patch(`/complaints/${id}/status`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setComplaint(data);
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update failed');
    }
  }

  async function submitRating(event) {
    event.preventDefault();
    try {
      await api.post('/feedback', { complaintId: id, ...rating });
      toast.success('Officer rated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rating failed');
    }
  }

  async function changeUserState(action) {
    try {
      const { data } = await api.patch(`/complaints/${id}/${action}`);
      setComplaint(data);
      toast.success(action === 'cancel' ? 'Complaint cancelled' : 'Complaint reopened');
    } catch (error) {
      toast.error(error.response?.data?.message || `Could not ${action} complaint`);
    }
  }

  async function archiveComplaint() {
    try {
      await api.patch(`/complaints/${id}/archive`);
      toast.success('Complaint archived');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not archive complaint');
    }
  }

  if (!complaint) return <div className="page"><div className="panel">{tr('loadingComplaints')}</div></div>;

  const canUpdate = ['AGENT', 'SENIOR_AGENT', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const canRate = user.role === 'USER' && complaint.status === 'RESOLVED';
  const baseUrl = api.defaults.baseURL.replace('/api', '');

  return (
    <div className="page">
      <Link className="link" to="/dashboard">{tr('backDashboard')}</Link>
      <div className="page-title">
        <h1>{complaint.title}</h1>
        <p>{translateText(complaint.department)} / {translateText(complaint.category)} / {complaint.location}</p>
        {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && complaint.trackingId && (
          <p><strong>{tr('trackingNo')}:</strong> {complaint.trackingId}</p>
        )}
        <span className={`badge status-${complaint.status.toLowerCase()}`}>{translateText(complaint.status)}</span>
      </div>

      <div className="two-column">
        <div className="panel">
          <h2>{tr('complaintDetails')}</h2>
          <p>{complaint.description}</p>
          <p><strong>{tr('priority')}:</strong> {translateText(complaint.priority)}</p>
          <p><strong>{tr('user')}:</strong> {complaint.createdBy?.name}</p>
          <p><strong>{tr('agent')}:</strong> {complaint.assignedTo?.name || tr('notAssigned')}</p>
          <div className="image-grid">
            {(complaint.evidenceImages || []).map((image) => <img key={image} src={`${baseUrl}${image}`} alt="Evidence" />)}
          </div>
        </div>

        <div className="panel">
          <h2>{tr('statusTimeline')}</h2>
          <div className="timeline">
            {(complaint.history?.length ? complaint.history : complaint.statusHistory || []).map((item) => (
              <div className="timeline-item" key={item._id}>
                <strong>{translateText(item.status)}</strong>
                <span>{item.note}</span>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {user.role === 'USER' && (
        <div className="panel action-bar">
          {!['RESOLVED', 'NOT_RESOLVED', 'CANCELLED'].includes(complaint.status) ? (
            <button className="btn btn-danger" onClick={() => changeUserState('cancel')}>{tr('cancelComplaint')}</button>
          ) : (
            <button className="btn btn-secondary" onClick={() => changeUserState('reopen')}>{tr('reopenComplaint')}</button>
          )}
        </div>
      )}
      {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && !complaint.archived && (
        <div className="panel action-bar">
          <button className="btn btn-light" onClick={archiveComplaint}>{tr('archiveComplaint')}</button>
        </div>
      )}

      {canUpdate && (
        <form className="panel" onSubmit={updateStatus}>
          <h2>{tr('statusUpdate')}</h2>
          <select className="input" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
            {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'NOT_RESOLVED'].map((status) => <option key={status}>{translateText(status)}</option>)}
          </select>
          <input className="input" placeholder={tr('note')} value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} />
          <textarea className="input" rows="3" placeholder={tr('resolutionDetails')} value={statusForm.resolution} onChange={(e) => setStatusForm({ ...statusForm, resolution: e.target.value })} />
          <label className="label">{tr('resolutionImages')}</label>
          <input className="input" type="file" accept="image/*" multiple onChange={(e) => setStatusForm({ ...statusForm, resolutionImages: e.target.files })} />
          <button className="btn btn-primary">{tr('updateStatus')}</button>
        </form>
      )}

      <div className="two-column">
        <div className="panel">
          <h2>{tr('comments')}</h2>
          <div className="list">
            {(complaint.comments?.length ? complaint.comments : complaint.messages || []).map((item) => (
              <div className="list-row" key={item._id}>
                <span>{item.sender?.name || 'User'}: {item.message}</span>
              </div>
            ))}
          </div>
          <form onSubmit={addComment}>
            <input className="input" placeholder={tr('addComment')} value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn btn-secondary">{tr('comment')}</button>
          </form>
        </div>

        <div className="panel">
          <h2>{tr('officerRating')}</h2>
          {canRate ? (
            <form onSubmit={submitRating}>
              <select className="input" value={rating.rating} onChange={(e) => setRating({ ...rating, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} Stars</option>)}
              </select>
              <textarea className="input" placeholder={tr('feedback')} value={rating.comment} onChange={(e) => setRating({ ...rating, comment: e.target.value })} />
              <button className="btn btn-primary">{tr('submitRating')}</button>
            </form>
          ) : (
            <p>{tr('ratingAfterResolution')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
