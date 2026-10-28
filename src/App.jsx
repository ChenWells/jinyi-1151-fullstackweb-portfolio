import { useEffect, useState } from 'react';
import {
  configured, onAuth, isTeacherUser, restoreMember, logout,
  subscribeMembers, subscribeSubmissions, subscribeTeacherRatings, subscribeStats, subscribeMyPeerRatings,
} from './lib/db.js';
import Feed from './components/Feed.jsx';
import Register from './components/Register.jsx';
import MyWork from './components/MyWork.jsx';
import Peer from './components/Peer.jsx';
import Teacher from './components/Teacher.jsx';

const TABS = [
  ['feed', '📡 即時動態'], ['register', '📝 註冊'], ['mywork', '🔑 我的作業'],
  ['peer', '🤝 同儕互評'], ['teacher', '🎓 講師評分'],
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

  return (
    <div className="wrap">
      <header>
        <h1>全端網站開發實務 · 學員作品動態</h1>
        <p>作業一：個人線上 CV　作業二：Web App（解決特定問題）</p>
      </header>
      {!configured && (
        <div className="warn">尚未設定 Firebase，請依 README 建立 .env 後重新啟動。</div>
      )}
      <nav>
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </nav>
      {(me || isTeacher) && (
        <p className="muted">
          目前身分：{isTeacher ? '講師' : me.name}　
          <button className="link" onClick={logout}>登出</button>
        </p>
      )}
      {tab === 'feed' && <Feed {...common} />}
      {tab === 'register' && <Register onDone={() => setTab('mywork')} />}
      {tab === 'mywork' && <MyWork {...common} me={me} onLogin={setMeId} />}
      {tab === 'peer' && <Peer {...common} me={me} myPeer={myPeer} onLogin={setMeId} />}
      {tab === 'teacher' && <Teacher members={members} subs={subs} teacherRatings={teacherRatings} isTeacher={isTeacher} />}
    </div>
  );
}
