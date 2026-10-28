import { useState } from 'react';
import { WORK_TYPES, teacherLogin, saveTeacherRating, resetMemberCode } from '../lib/db.js';
import { TEACHER_CRITERIA } from '../lib/criteria.js';
import RatingForm from './RatingForm.jsx';

function CodeReset({ members }) {
  const [memberId, setMemberId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function reset() {
    const m = members.find((x) => x.id === memberId);
    if (!m || !window.confirm(`確定重設「${m.name}」的隨機碼？舊隨機碼會立即失效。`)) return;
    setError('');
    try {
      setResult({ name: m.name, code: await resetMemberCode(m.id) });
    } catch (e) {
      setResult(null);
      setError(e.message);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h2>🔑 重設學員隨機碼</h2>
      <p className="muted">隨機碼僅存雜湊，無法查詢舊碼；重設後請將新隨機碼轉達給學員。</p>
      <label>學員
        <select value={memberId} onChange={(e) => { setMemberId(e.target.value); setResult(null); }}>
          <option value="">請選擇</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <button onClick={reset} disabled={!memberId}>產生新隨機碼</button>
      {error && <p className="err">{error}</p>}
      {result && (
        <div>
          <p>{result.name} 的新隨機碼（僅顯示這一次）：</p>
          <div className="code">{result.code}</div>
        </div>
      )}
    </div>
  );
}

export default function Teacher({ members, subs, teacherRatings, isTeacher }) {
  const [error, setError] = useState('');

  if (!isTeacher) {
    return (
      <div className="card">
        <h2>講師評分</h2>
        <p className="muted">僅限講師的 Google 帳號登入。</p>
        {error && <p className="err">{error}</p>}
        <button onClick={() => teacherLogin().catch((e) => setError(e.message))}>以 Google 登入</button>
      </div>
    );
  }

  return (
    <div>
      <CodeReset members={members} />
      {subs.length === 0 && <p className="muted">還沒有作業可評。</p>}
      <div className="grid2">
        {subs.map((s) => (
          <div className="card" key={s.id}>
            <h3>{WORK_TYPES[s.type]?.icon} {s.name} · {WORK_TYPES[s.type]?.label}</h3>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            {s.description && <p className="muted">{s.description}</p>}
            <RatingForm
              key={`${s.id}-${teacherRatings[s.id]?.updatedAt || 0}`}
              criteria={TEACHER_CRITERIA}
              initial={teacherRatings[s.id]}
              commentLabel="綜合評語（公開顯示）"
              saveLabel={teacherRatings[s.id] ? '更新評分' : '送出評分'}
              onSave={({ scores, comment }) => saveTeacherRating({ sub: s, scores, comment })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
