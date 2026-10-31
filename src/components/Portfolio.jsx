import { useMemo, useState } from 'react';
import { WORK_TYPES } from '../lib/db.js';
import WorkCard from './WorkCard.jsx';

export default function Portfolio({ members, subs, teacherRatings, stats }) {
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const memberIds = useMemo(() => new Set(members.map((member) => member.id)), [members]);
  const visibleSubs = subs.filter((sub) => {
    const matchesMember = memberIds.has(sub.memberId);
    const matchesType = type === 'all' || sub.type === type;
    const text = `${sub.name} ${sub.title} ${sub.description || ''}`.toLocaleLowerCase();
    return matchesMember && matchesType && text.includes(search.trim().toLocaleLowerCase());
  });

  return (
    <section className="content-panel portfolio-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">STUDENT SHOWCASE</span>
          <h2>把想法做成作品</h2>
          <p>瀏覽學員的個人 CV 與解決問題的 Web App。</p>
        </div>
        <span className="result-count">{visibleSubs.length} 件作品</span>
      </div>
      <div className="portfolio-controls">
        <label className="search-field">
          <span className="visually-hidden">搜尋學員或作品</span>
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜尋學員或作品"
          />
        </label>
        <label className="filter-field">
          <span className="visually-hidden">依作業類型篩選</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">全部作品</option>
            {Object.entries(WORK_TYPES).map(([key, workType]) => (
              <option key={key} value={key}>{workType.label}</option>
            ))}
          </select>
        </label>
      </div>
      {visibleSubs.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <strong>{subs.length === 0 ? '還沒有作品' : '找不到符合條件的作品'}</strong>
          <p>{subs.length === 0 ? '學員提交作品後，這裡就會開始展示。' : '試試其他關鍵字或篩選條件。'}</p>
        </div>
      ) : (
        <div className="work-grid">
          {visibleSubs.map((sub) => (
            <WorkCard
              key={sub.id}
              submission={sub}
              teacher={teacherRatings[sub.id]}
              stat={stats[sub.id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
