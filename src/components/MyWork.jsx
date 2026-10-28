import { useState } from 'react';
import { WORK_TYPES, saveSubmission } from '../lib/db.js';

export default function MyWork({ members, subs }) {
  const [memberId, setMemberId] = useState('');
  const [code, setCode] = useState('');
  const [auth, setAuth] = useState(null);

  if (!auth) {
    return (
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const member = members.find((m) => m.id === memberId);
          if (member && code.trim()) setAuth({ member, code: code.trim() });
        }}
      >
        <h2>登入修改作業</h2>
        <label>姓名
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
            <option value="">請選擇</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label>隨機碼
          <input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" required />
        </label>
        <button>登入</button>
        <p className="muted">隨機碼會在儲存作業時驗證。</p>
      </form>
    );
  }

  return (
    <div>
      <p>
        👋 {auth.member.name}　<button className="link" onClick={() => setAuth(null)}>登出</button>
      </p>
      <div className="grid2">
        {Object.keys(WORK_TYPES).map((type) => (
          <WorkForm key={type} type={type} auth={auth} existing={subs.find((s) => s.id === `${auth.member.id}_${type}`)} />
        ))}
      </div>
    </div>
  );
}

function WorkForm({ type, auth, existing }) {
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
      await saveSubmission({ member: auth.member, code: auth.code, type, ...f });
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
