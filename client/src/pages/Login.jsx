import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CaptchaField from '../components/CaptchaField';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Login({ expectedRole = 'USER' }) {
  const { login, logout, loading } = useAuth();
  const { tr } = usePreferences();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', captchaToken: '', captchaAnswer: '' });
  const [captchaKey, setCaptchaKey] = useState(0);
  const titles = { USER: tr('userLogin'), AGENT: tr('officerLogin'), ADMIN: tr('adminLogin') };

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const result = await login({ ...form, expectedRole });
      const validRole = expectedRole === 'ADMIN'
        ? ['ADMIN', 'SUPER_ADMIN'].includes(result?.role)
        : expectedRole === 'AGENT'
          ? ['AGENT', 'SENIOR_AGENT'].includes(result?.role)
          : result?.role === expectedRole;
      if (!validRole) {
        logout();
        throw new Error('Use the correct login portal for your role.');
      }
      toast.success(tr('loginSuccess'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || tr('loginFailed'));
      setCaptchaKey((value) => value + 1);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="login-layout">
        <section className="login-info">
          <div className="brand-mark">RX</div>
          <span className="eyebrow">{tr('secureAccess')}</span>
          <h1>{titles[expectedRole]}</h1>
          <p>{tr('loginCopy')}</p>
          <div className="role-links">
            <Link className="btn btn-light" to="/login/user">{tr('user')}</Link>
            <Link className="btn btn-light" to="/login/agent">{tr('officer')}</Link>
            <Link className="btn btn-light" to="/login/admin">{tr('admin')}</Link>
          </div>
        </section>
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="auth-header">
            <h2>{titles[expectedRole]}</h2>
            <p className="helper-text">{tr('loginCopy')}</p>
          </div>
          <label className="form-label">{tr('email')}</label>
          <input className="form-control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <label className="form-label">{tr('password')}</label>
          <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <CaptchaField refreshKey={captchaKey} onChange={(captcha) => setForm((current) => ({ ...current, ...captcha }))} />
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? tr('pleaseWait') : tr('signIn')}
          </button>
          {expectedRole === 'USER' && (
            <p className="auth-link">{tr('newHere')} <Link to="/register">{tr('createAccount')}</Link></p>
          )}
        </form>
      </div>
    </div>
  );
}
