import { useState } from 'react';
import { WORK_TYPES, teacherLogin, saveTeacherRating } from '../lib/db.js';
import { TEACHER_CRITERIA } from '../lib/criteria.js';
import RatingForm from './RatingForm.jsx';

export default function Teacher({ subs, teacherRatings, isTeacher }) {
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
