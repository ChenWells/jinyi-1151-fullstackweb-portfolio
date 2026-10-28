import { useState } from 'react';
import { configured, register } from '../lib/db.js';
import { isValidNationalId } from '../lib/identity.js';
import { emailEnabled, sendCodeEmail } from '../lib/email.js';

export default function Register({ onDone }) {
  const [form, setForm] = useState({ name: '', nationalId: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('請輸入姓名');
    if (!isValidNationalId(form.nationalId)) return setError('身分證字號格式或檢查碼不正確');
    setBusy(true);
    try {
      const { code } = await register(form);
      let mailed = false;
      let mailError = '';
      if (form.email && emailEnabled) {
        try {
          await sendCodeEmail({ email: form.email, name: form.name, code });
          mailed = true;
        } catch (err) {
          // 寄信失敗仍會在畫面顯示隨機碼，並附上 EmailJS 回傳的原因
          mailError = `${err?.status || ''} ${err?.text || err?.message || ''}`.trim();
        }
      }
      setResult({ code, mailed, mailError });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="card center">
        <h2>註冊成功 🎉</h2>
        <p>你的登入隨機碼（僅顯示這一次，請截圖或抄下）：</p>
        <div className="code">{result.code}</div>
        {result.mailed && <p className="muted">同一組隨機碼也已寄至你的 Email（若沒收到請查看垃圾郵件匣）。</p>}
        {result.mailError && <p className="err">Email 寄送失敗：{result.mailError}。請先抄下上方隨機碼。</p>}
        <button onClick={onDone}>前往繳交作業</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>學員註冊</h2>
      <label>姓名<input value={form.name} onChange={set('name')} maxLength={30} required /></label>
      <label>身分證字號
        <input value={form.nationalId} onChange={set('nationalId')} maxLength={10} autoComplete="off" required />
      </label>
      <label>Email（選填，用於寄送隨機碼）
        <input type="email" value={form.email} onChange={set('email')} disabled={!emailEnabled} />
      </label>
      <p className="muted">身分證字號僅在瀏覽器內加鹽雜湊後用於防止重複註冊，不會儲存或公開明文。</p>
      {error && <p className="err">{error}</p>}
      <button disabled={busy || !configured}>{busy ? '處理中…' : '註冊並取得隨機碼'}</button>
    </form>
  );
}
