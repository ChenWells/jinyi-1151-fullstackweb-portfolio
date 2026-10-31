import { WORK_TYPES } from '../lib/db.js';
import WorkCard from './WorkCard.jsx';

export default function Feed({ members, subs, teacherRatings, stats, onNavigate }) {
  const memberIds = new Set(members.map((member) => member.id));
  const classSubs = subs.filter((sub) => memberIds.has(sub.memberId));
  const submissionsById = new Map(classSubs.map((sub) => [sub.id, sub]));
  const cvCount = classSubs.filter((sub) => sub.type === 'cv').length;
  const appCount = classSubs.filter((sub) => sub.type === 'webapp').length;
  const expected = members.length * Object.keys(WORK_TYPES).length;
  const completion = expected ? Math.round((classSubs.length / expected) * 100) : 0;
  const pending = Math.max(0, expected - classSubs.length);

  return (
    <div className="dashboard">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow">一起學習，持續創作</span>
          <h2>每個作品，都是進步的證明。</h2>
          <p>瀏覽同學的作品，給彼此有建設性的回饋。</p>
          <button className="button button-light" onClick={() => onNavigate('showcase')}>
            探索學員作品 <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="art-shape art-shape-one" />
          <span className="art-shape art-shape-two" />
          <span className="art-shape art-shape-three" />
          <span className="art-label">IDEAS<br />IN ACTION</span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="班級概況">
        <article className="metric-card">
          <span className="metric-icon metric-icon-teal" aria-hidden="true">♙</span>
          <span className="metric-label">班級學員</span>
          <strong className="metric-value">{members.length}<small> 位</small></strong>
          <span className="metric-footnote">共同創作的學習社群</span>
        </article>
        <article className="metric-card">
          <span className="metric-icon metric-icon-blue" aria-hidden="true">▤</span>
          <span className="metric-label">個人線上 CV</span>
          <strong className="metric-value">{cvCount}<small> / {members.length}</small></strong>
          <span className="metric-footnote">已完成繳交</span>
        </article>
        <article className="metric-card">
          <span className="metric-icon metric-icon-amber" aria-hidden="true">✳</span>
          <span className="metric-label">Web App</span>
          <strong className="metric-value">{appCount}<small> / {members.length}</small></strong>
          <span className="metric-footnote">解決真實問題的作品</span>
        </article>
        <article className="metric-card metric-progress-card">
          <div className="metric-progress-heading">
            <span className="metric-label">整體繳交進度</span>
            <strong>{completion}%</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="整體繳交進度"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={completion}
          >
            <span style={{ width: `${completion}%` }} />
          </div>
          <span className="metric-footnote">尚有 {pending} 件作品待繳交</span>
        </article>
      </section>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LATEST WORK</span>
            <h2>最新作品</h2>
            <p>看看同學最近完成了什麼。</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('showcase')}>
            查看全部 <span aria-hidden="true">→</span>
          </button>
        </div>
        {classSubs.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">✳</span>
            <strong>作品即將登場</strong>
            <p>學員提交作品後，這裡就會開始展示。</p>
          </div>
        ) : (
          <div className="work-grid">
            {classSubs.slice(0, 4).map((sub) => (
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

      <section className="content-panel progress-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CLASS PROGRESS</span>
            <h2>個別繳交進度</h2>
            <p>逐位查看兩項作業的繳交狀態與講師評分。</p>
          </div>
        </div>
        {members.length === 0 ? (
          <div className="empty-state compact-empty">
            <strong>學員註冊後會顯示在這裡</strong>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="progress-table">
              <thead>
                <tr>
                  <th scope="col">學員</th>
                  {Object.entries(WORK_TYPES).map(([type, work]) => (
                    <th scope="col" key={type}>{work.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <th scope="row">{member.name}</th>
                    {Object.keys(WORK_TYPES).map((type) => {
                      const submission = submissionsById.get(`${member.id}_${type}`);
                      return (
                        <td key={type}>
                          {submission ? (
                            <a className="submission-status" href={submission.url} target="_blank" rel="noopener noreferrer">
                              <span><span aria-hidden="true">✓</span> 已繳交</span>
                              <small>
                                {teacherRatings[submission.id]
                                  ? `講師 ${teacherRatings[submission.id].total} 分`
                                  : '尚未評分'}
                              </small>
                            </a>
                          ) : (
                            <span className="submission-missing"><span aria-hidden="true">—</span> 未繳交</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
