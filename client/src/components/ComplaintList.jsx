import React from 'react';
import { Link } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';

export default function ComplaintList({ complaints, showUser = false, showAgent = false, showTracking = false }) {
  const { tr, translateText } = usePreferences();
  if (!complaints.length) {
    return <div className="empty-state">{tr('noComplaints')}</div>;
  }

  return (
    <div className="table-responsive surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="p-3">{tr('complaint')}</th>
            {showTracking && <th className="p-3">{tr('trackingNo')}</th>}
            <th className="p-3">{tr('department')}</th>
            <th className="p-3">{tr('type')}</th>
            <th className="p-3">{tr('status')}</th>
            <th className="p-3">{tr('priority')}</th>
            {showUser && <th className="p-3">{tr('user')}</th>}
            {showAgent && <th className="p-3">{tr('agent')}</th>}
            <th className="p-3">{tr('created')}</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr className="border-t border-slate-200 dark:border-slate-800" key={complaint._id}>
              <td className="p-3">
                <Link className="font-bold text-civic no-underline" to={`/complaints/${complaint._id}`}>
                  {complaint.title}
                </Link>
                <div className="text-xs text-slate-500">{complaint.location}</div>
              </td>
              {showTracking && <td className="p-3 font-semibold text-slate-700">{complaint.trackingId || '-'}</td>}
              <td className="p-3">{translateText(complaint.department || '-')}</td>
              <td className="p-3">{translateText(complaint.category)}</td>
              <td className="p-3">
                <span className={`status-pill status-${complaint.status.toLowerCase()}`}>{translateText(complaint.status)}</span>
              </td>
              <td className="p-3">{translateText(complaint.priority)}</td>
              {showUser && <td className="p-3">{complaint.createdBy?.name || '-'}</td>}
              {showAgent && <td className="p-3">{complaint.assignedTo?.name || tr('unassigned')}</td>}
              <td className="p-3">{new Date(complaint.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
