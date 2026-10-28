import { WORK_TYPES, savePeerRating } from '../lib/db.js';
import { PEER_CRITERIA } from '../lib/criteria.js';
import Login from './Login.jsx';
import RatingForm from './RatingForm.jsx';

export default function Peer({ members, subs, me, myPeer, onLogin }) {
  if (!me) return <Login members={members} onLogin={onLogin} title="登入後進行同儕互評" />;
  const targets = subs.filter((s) => s.memberId !== me.id);
  return (
    <div>
      <p className="muted">不能評自己的作品；評語僅講師看得到，同學只會看到平均分與人數。可重複修改自己的評分。</p>
      {targets.length === 0 && <p className="muted">目前沒有其他同學的作品可評。</p>}
      <div className="grid2">
        {targets.map((s) => (
          <div className="card" key={s.id}>
            <h3>{WORK_TYPES[s.type]?.icon} {s.name} · {WORK_TYPES[s.type]?.label}</h3>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
            <RatingForm
              key={`${s.id}-${myPeer[s.id]?.updatedAt || 0}`}
              criteria={PEER_CRITERIA}
              initial={myPeer[s.id]}
              commentLabel="建議與回饋（僅講師可見）"
              saveLabel={myPeer[s.id] ? '更新評分' : '送出評分'}
              onSave={({ scores, comment }) => savePeerRating({ me: me.id, sub: s, scores, comment })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
