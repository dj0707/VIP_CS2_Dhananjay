import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CaptchaField from '../components/CaptchaField';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Register() {
  const { register, loading } = useAuth();
  const { tr } = usePreferences();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', captchaToken: '', captchaAnswer: '' });
  const [captchaKey, setCaptchaKey] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || tr('registrationFailed'));
      setCaptchaKey((value) => value + 1);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="surface auth-card" onSubmit={handleSubmit}>
        <div className="brand-mark">RX</div>
        <div className="auth-header">
          <span className="eyebrow">{tr('createYourAccount')}</span>
          <h2>{tr('registerTitle')}</h2>
          <p className="helper-text">{tr('registerCopy')}</p>
        </div>
        <div className="form-grid">
          <div>
            <label className="form-label">{tr('fullName')}</label>
            <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </div>
          <div>
            <label className="form-label">{tr('email')}</label>
            <input className="form-control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </div>
          <div>
            <label className="form-label">{tr('phone')}</label>
            <input className="form-control" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
          </div>
          <div>
            <label className="form-label">{tr('password')}</label>
            <input className="form-control" type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </div>
        </div>
        <CaptchaField refreshKey={captchaKey} onChange={(captcha) => setForm((current) => ({ ...current, ...captcha }))} />
        <button className="btn btn-primary mt-6 w-full" disabled={loading}>
          {loading ? tr('pleaseWait') : tr('createAccount')}
        </button>
        <p className="auth-link">{tr('alreadyRegistered')} <Link to="/login/user">{tr('signIn')}</Link></p>
      </form>
    </div>
  );
}
