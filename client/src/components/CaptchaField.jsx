import React, { useEffect, useState } from 'react';
import { api } from '../api/http';
import { usePreferences } from '../context/PreferencesContext';

export default function CaptchaField({ onChange, refreshKey = 0 }) {
  const { tr } = usePreferences();
  const [captcha, setCaptcha] = useState({ question: '', captchaToken: '' });
  const [answer, setAnswer] = useState('');

  async function loadCaptcha() {
    const { data } = await api.get('/auth/captcha');
    setCaptcha(data);
    setAnswer('');
    onChange({ captchaToken: data.captchaToken, captchaAnswer: '' });
  }

  useEffect(() => {
    loadCaptcha();
  }, [refreshKey]);

  function updateAnswer(value) {
    const cleanValue = value.replace(/\D/g, '');
    setAnswer(cleanValue);
    onChange({ captchaToken: captcha.captchaToken, captchaAnswer: cleanValue });
  }

  return (
    <div className="captcha-field">
      <div>
        <span className="captcha-label">{tr('securityCheck')}</span>
        <strong className="captcha-question">{captcha.question || tr('loading')}</strong>
      </div>
      <input
        className="form-control captcha-answer"
        inputMode="numeric"
        value={answer}
        onChange={(event) => updateAnswer(event.target.value)}
        placeholder={tr('captchaAnswer')}
        required
      />
      <button className="captcha-refresh" type="button" onClick={loadCaptcha}>
        {tr('newQuestion')}
      </button>
    </div>
  );
}
