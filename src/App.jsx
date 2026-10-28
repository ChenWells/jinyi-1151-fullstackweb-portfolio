import { useEffect, useState } from 'react';
import { configured, subscribeMembers, subscribeSubmissions } from './lib/db.js';
import Feed from './components/Feed.jsx';
import Register from './components/Register.jsx';
import MyWork from './components/MyWork.jsx';

const TABS = [['feed', '📡 即時動態'], ['register', '📝 註冊'], ['mywork', '🔑 我的作業']];

export default function App() {
  const [tab, setTab] = useState('feed');
  const [members, setMembers] = useState([]);
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (!configured) return undefined;
    const a = subscribeMembers(setMembers);
    const b = subscribeSubmissions(setSubs);
    return () => { a(); b(); };
  }, []);

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
      {tab === 'feed' && <Feed members={members} subs={subs} />}
      {tab === 'register' && <Register onDone={() => setTab('mywork')} />}
      {tab === 'mywork' && <MyWork members={members} subs={subs} />}
    </div>
  );
}
