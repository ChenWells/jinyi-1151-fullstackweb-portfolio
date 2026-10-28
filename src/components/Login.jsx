import { useState } from 'react';
import { memberLogin } from '../lib/db.js';

export default function Login({ members, onLogin, title = '登入' }) {
  const [memberId, setMemberId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onLogin(await memberLogin(memberId, code));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>{title}</h2>
      <label>姓名
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          <option value="">請選擇</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <label>隨機碼
        <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" required />
      </label>
      {error && <p className="err">{error}</p>}
      <button disabled={busy}>{busy ? '驗證中…' : '登入'}</button>
    </form>
  );
}
