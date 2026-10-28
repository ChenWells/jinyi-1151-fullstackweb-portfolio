import { WORK_TYPES } from '../lib/db.js';
import { average } from '../lib/criteria.js';

const ago = (t) => {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return '剛剛';
  if (s < 3600) return `${Math.floor(s / 60)} 分鐘前`;
  if (s < 86400) return `${Math.floor(s / 3600)} 小時前`;
  return new Date(t).toLocaleDateString('zh-TW');
};

function Scores({ teacher, stat }) {
  const peer = average(stat);
  return (
    <div className="badges">
      <span>🎓 講師 {teacher ? teacher.total : '--'}</span>
      <span>🤝 同儕 {peer !== null ? `${peer}（${stat.count} 人）` : '-- (0)'}</span>
    </div>
  );
}

export default function Feed({ members, subs, teacherRatings, stats }) {
  const byKey = new Map(subs.map((s) => [s.id, s]));
  const done = (type) => subs.filter((s) => s.type === type).length;

  return (
    <div className="grid2">
      <section>
        <h2>最新動態</h2>
        {subs.length === 0 && <p className="muted">還沒有人繳交作業。</p>}
        <ul className="feed">
          {subs.map((s) => (
            <li key={s.id}>
              <span className="icon">{WORK_TYPES[s.type]?.icon}</span>
              <div>
                <b>{s.name}</b> 更新了 {WORK_TYPES[s.type]?.label}
                <div><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></div>
                {s.description && <div className="muted">{s.description}</div>}
                <Scores teacher={teacherRatings[s.id]} stat={stats[s.id]} />
                {teacherRatings[s.id]?.comment && <div className="muted">講師：{teacherRatings[s.id].comment}</div>}
                <small className="muted">{ago(s.updatedAt)}</small>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>繳交進度（已註冊 {members.length} 人）</h2>
        <p className="muted">CV：{done('cv')} 份　Web App：{done('webapp')} 份</p>
        <table>
          <thead><tr><th>學員</th><th>CV</th><th>Web App</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                {Object.keys(WORK_TYPES).map((t) => {
                  const s = byKey.get(`${m.id}_${t}`);
                  return (
                    <td key={t}>
                      {s ? <a href={s.url} target="_blank" rel="noopener noreferrer">✅ {teacherRatings[s.id]?.total ?? ''}</a> : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
