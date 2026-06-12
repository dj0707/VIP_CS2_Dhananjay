import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintDetails from './pages/ComplaintDetails';
import SimplePage from './pages/SimplePage';
import { useAuth } from './context/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route path="/login/user" element={<Login expectedRole="USER" />} />
          <Route path="/login/agent" element={<Login expectedRole="AGENT" />} />
          <Route path="/login/admin" element={<Login expectedRole="ADMIN" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><SimplePage type="notifications" /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><SimplePage type="profile" /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><SimplePage type="reports" /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={2500} />
    </BrowserRouter>
  );
}

function RoleDashboard() {
  const { user } = useAuth();
  if (['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) return <AdminDashboard />;
  if (['AGENT', 'SENIOR_AGENT'].includes(user?.role)) return <AgentDashboard />;
  return <UserDashboard />;
}
