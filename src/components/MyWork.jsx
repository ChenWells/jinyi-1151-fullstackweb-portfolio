import { useState } from 'react';
import { WORK_TYPES, saveSubmission } from '../lib/db.js';
import Login from './Login.jsx';

export default function MyWork({ members, subs, me, onLogin }) {
  if (!me) return <Login members={members} onLogin={onLogin} title="登入修改作業" />;
  return (
    <div className="grid2">
      {Object.keys(WORK_TYPES).map((type) => (
        <WorkForm key={type} type={type} member={me} existing={subs.find((s) => s.id === `${me.id}_${type}`)} />
      ))}
    </div>
  );
}

function WorkForm({ type, member, existing }) {
  const [f, setF] = useState({
    title: existing?.title || '', url: existing?.url || '', description: existing?.description || '',
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await saveSubmission({ member, type, ...f });
      setMsg({ ok: true, text: '已儲存，動態牆即時更新' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const isWeb = type === 'webapp';
  return (
    <form className="card" onSubmit={submit}>
      <h2>{WORK_TYPES[type].icon} {WORK_TYPES[type].label}</h2>
      <label>作品名稱<input value={f.title} onChange={set('title')} maxLength={100} required /></label>
      <label>網址（GitHub Pages 等，需 http/https）
        <input type="url" value={f.url} onChange={set('url')} required />
      </label>
      <label>{isWeb ? '要解決的問題與使用對象' : '簡介'}
        <textarea rows={4} value={f.description} onChange={set('description')} maxLength={1000} required={isWeb} />
      </label>
      {msg && <p className={msg.ok ? 'ok' : 'err'}>{msg.text}</p>}
      <button disabled={busy}>{existing ? '更新' : '送出'}</button>
    </form>
  );
}
