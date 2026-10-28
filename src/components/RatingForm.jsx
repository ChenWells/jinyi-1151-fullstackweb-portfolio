import { useState } from 'react';
import { calcTotal } from '../lib/criteria.js';

// 共用評分表單：每項 1~5 分，即時顯示加權總分
export default function RatingForm({ criteria, initial, onSave, commentLabel = '評語（選填）', saveLabel = '送出評分' }) {
  const [scores, setScores] = useState(() => Object.fromEntries(criteria.map((c) => [c.id, initial?.[c.id] || 0])));
  const [comment, setComment] = useState(initial?.comment || '');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const complete = criteria.every((c) => scores[c.id] >= 1);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await onSave({ scores, comment });
      setMsg({ ok: true, text: '已儲存' });
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rating">
      {criteria.map((c) => (
        <label key={c.id} className="row">
          <span>{c.label}（{c.weight}%）</span>
          <select value={scores[c.id]} onChange={(e) => setScores({ ...scores, [c.id]: Number(e.target.value) })}>
            <option value={0}>—</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      ))}
      <label>{commentLabel}
        <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      </label>
      <div className="row">
        <b>總分：{complete ? calcTotal(criteria, scores) : '—'}</b>
        <button disabled={busy || !complete}>{busy ? '儲存中…' : saveLabel}</button>
      </div>
      {msg && <p className={msg.ok ? 'ok' : 'err'}>{msg.text}</p>}
    </form>
  );
}
