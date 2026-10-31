import { WORK_TYPES } from '../lib/db.js';
import { average } from '../lib/criteria.js';

function updatedLabel(timestamp) {
  if (!timestamp) return '';
  const elapsed = Math.max(0, Date.now() - timestamp);
  if (elapsed < 60_000) return '剛剛更新';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} 分鐘前更新`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} 小時前更新`;
  return `${new Date(timestamp).toLocaleDateString('zh-TW')} 更新`;
}

export default function WorkCard({ submission, teacher, stat }) {
  const workType = WORK_TYPES[submission.type];
  const peerScore = average(stat);

  return (
    <article className={`work-card work-card-${submission.type}`}>
      <div className="work-card-topline">
        <span className="work-type">
          <span aria-hidden="true">{workType?.icon}</span>
          {workType?.label}
        </span>
        <span className="work-updated">{updatedLabel(submission.updatedAt)}</span>
      </div>
      <div className="work-card-body">
        <p className="work-author">{submission.name}</p>
        <h3><a href={submission.url} target="_blank" rel="noopener noreferrer">{submission.title}</a></h3>
        {submission.description && <p className="work-description">{submission.description}</p>}
      </div>
      <div className="work-card-footer">
        <div className="score-list" aria-label="作品評分">
          <span><span aria-hidden="true">✦</span> 講師 <strong>{teacher ? teacher.total : '—'}</strong></span>
          <span><span aria-hidden="true">◎</span> 同儕 <strong>{peerScore !== null ? peerScore : '—'}</strong></span>
          {peerScore !== null && <small>{stat.count} 人評分</small>}
        </div>
      </div>
      {teacher?.comment && (
        <p className="teacher-comment"><strong>講師回饋</strong>{teacher.comment}</p>
      )}
    </article>
  );
}
