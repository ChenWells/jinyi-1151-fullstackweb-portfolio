import { useEffect, useState } from 'react';
import {
  configured, onAuth, isTeacherUser, restoreMember, logout,
  subscribeMembers, subscribeSubmissions, subscribeTeacherRatings, subscribeStats, subscribeMyPeerRatings,
} from './lib/db.js';
import Feed from './components/Feed.jsx';
import Portfolio from './components/Portfolio.jsx';
import Register from './components/Register.jsx';
import MyWork from './components/MyWork.jsx';
import Peer from './components/Peer.jsx';
import Teacher from './components/Teacher.jsx';

const NAV_ITEMS = [
  { id: 'feed', icon: '⌂', label: '課程總覽', group: '課程' },
  { id: 'showcase', icon: '▦', label: '學員作品', group: '課程' },
  { id: 'peer', icon: '◇', label: '同儕互評', group: '學習工具' },
  { id: 'mywork', icon: '↗', label: '我的作業', group: '學習工具' },
  { id: 'register', icon: '+', label: '學員註冊', group: '學習工具' },
  { id: 'teacher', icon: '◎', label: '講師工作台', group: '管理' },
];

export default function App() {
  const [tab, setTab] = useState('feed');
  const [members, setMembers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [teacherRatings, setTeacherRatings] = useState({});
  const [stats, setStats] = useState({});
  const [myPeer, setMyPeer] = useState({});
  const [meId, setMeId] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    if (!configured) return undefined;
    const unsubs = [
      subscribeMembers(setMembers), subscribeSubmissions(setSubs),
      subscribeTeacherRatings(setTeacherRatings), subscribeStats(setStats),
      onAuth(async (user) => {
        setIsTeacher(isTeacherUser(user));
        setMeId(await restoreMember(user).catch(() => null));
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    setMyPeer({});
    if (!meId) return undefined;
    return subscribeMyPeerRatings(meId, setMyPeer);
  }, [meId]);

  const me = members.find((m) => m.id === meId) || null;
  const common = { members, subs, teacherRatings, stats };
  const activeItem = NAV_ITEMS.find((item) => item.id === tab) || NAV_ITEMS[0];

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要內容</a>
      <aside className="sidebar">
        <a className="brand" href="#main-content" onClick={() => setTab('feed')}>
          <span className="brand-mark">W</span>
          <span className="brand-copy">
            <strong>作品集</strong>
            <small>COURSE STUDIO</small>
          </span>
        </a>
        <div className="course-label">
          <span className="eyebrow">115-1 課程空間</span>
          <strong>全端網站<br />開發實務</strong>
        </div>
        <nav className="primary-nav" aria-label="主要導覽">
          {['課程', '學習工具', '管理'].map((group) => (
            <div className="nav-group" key={group}>
              <span className="nav-heading">{group}</span>
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => (
                <button
                  key={item.id}
                  className={`nav-item${tab === item.id ? ' active' : ''}`}
                  aria-current={tab === item.id ? 'page' : undefined}
                  onClick={() => setTab(item.id)}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="live-dot" />
          <span><strong>即時同步</strong><small>作品與評分即時更新</small></span>
        </div>
      </aside>

      <div className="page">
        <header className="topbar">
          <div className="breadcrumb">課程空間 <span>/</span> {activeItem.label}</div>
          <div className="identity">
            {me || isTeacher ? (
              <>
                <span className="avatar">{isTeacher ? '師' : me.name.slice(0, 1)}</span>
                <span className="identity-copy">
                  <strong>{isTeacher ? '講師' : me.name}</strong>
                  <small>{isTeacher ? '課程管理者' : '學員'}</small>
                </span>
                <button className="logout-button" onClick={logout}>登出</button>
              </>
            ) : (
              <span className="guest-label">歡迎瀏覽課程作品</span>
            )}
          </div>
        </header>

        <main className="main-content" id="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">COURSE PORTFOLIO · 115-1</span>
              <h1>{activeItem.label}</h1>
              <p>全端網站開發實務 <span className="heading-divider">·</span> 學員作品與學習歷程</p>
            </div>
            <span className="sync-status"><span className="live-dot" /> 即時更新</span>
          </div>

          {!configured && (
            <div className="warn" role="status">尚未設定 Firebase，請依 README 建立 .env 後重新啟動。</div>
          )}
          {tab === 'feed' && <Feed {...common} onNavigate={setTab} />}
          {tab === 'showcase' && <Portfolio {...common} />}
          {tab === 'register' && <Register onDone={() => setTab('mywork')} />}
          {tab === 'mywork' && <MyWork {...common} me={me} onLogin={setMeId} />}
          {tab === 'peer' && <Peer {...common} me={me} myPeer={myPeer} onLogin={setMeId} />}
          {tab === 'teacher' && <Teacher members={members} subs={subs} teacherRatings={teacherRatings} isTeacher={isTeacher} />}
        </main>
        <footer className="page-footer">全端網站開發實務 <span>·</span> 學員作品與課程進度</footer>
      </div>
    </div>
  );
}
