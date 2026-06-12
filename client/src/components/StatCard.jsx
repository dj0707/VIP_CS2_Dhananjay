import React from 'react';
export default function StatCard({ label, value, tone = 'blue' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
