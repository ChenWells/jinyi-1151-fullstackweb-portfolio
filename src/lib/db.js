import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, writeBatch, setDoc, getDoc, query, where, orderBy, limit,
  onSnapshot, runTransaction,
} from 'firebase/firestore';
import {
  getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut,
} from 'firebase/auth';
import { hashNationalId, hashCode, generateCode } from './identity.js';
import { TEACHER_CRITERIA, PEER_CRITERIA, calcTotal } from './criteria.js';

const env = import.meta.env;
export const ID_SALT = env.VITE_ID_SALT || 'dev-salt';
export const TEACHER_EMAIL = 'fgchen@gmail.com';
export const configured = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const app = configured
  ? initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    })
  : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export const WORK_TYPES = {
  cv: { label: '個人線上 CV', icon: '📄' },
  webapp: { label: 'Web App（解決特定問題）', icon: '🛠️' },
};

const withId = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
const permissionError = (e, msg) => (e.code === 'permission-denied' ? new Error(msg) : e);

// ---------- 註冊 ----------
// 身分證雜湊作為文件 ID，重複註冊時 create 會被規則拒絕
export async function register({ name, nationalId }) {
  const idHash = await hashNationalId(nationalId, ID_SALT);
  const code = generateCode();
  const memberRef = doc(collection(db, 'members'));
  const batch = writeBatch(db);
  batch.set(doc(db, 'ids', idHash), { at: Date.now() });
  batch.set(memberRef, { name: name.trim(), createdAt: Date.now() });
  batch.set(doc(db, 'secrets', memberRef.id), { codeHash: await hashCode(code) });
  try {
    await batch.commit();
  } catch (e) {
    throw permissionError(e, '此身分證字號已註冊過，若遺失隨機碼請洽講師');
  }
  return { memberId: memberRef.id, code };
}

// ---------- 身分 ----------
export const onAuth = (cb) => onAuthStateChanged(auth, cb);
export const isTeacherUser = (u) => Boolean(u && !u.isAnonymous && u.email === TEACHER_EMAIL);

// 以隨機碼換取身分：sessions 文件只有隨機碼正確時才寫得進去
export async function memberLogin(memberId, code) {
  if (!auth.currentUser || !auth.currentUser.isAnonymous) await signInAnonymously(auth);
  try {
    await setDoc(doc(db, 'sessions', auth.currentUser.uid), { memberId, codeHash: await hashCode(code) });
  } catch (e) {
    throw permissionError(e, '隨機碼錯誤');
  }
  return memberId;
}

export async function restoreMember(user) {
  if (!user || !user.isAnonymous) return null;
  const snap = await getDoc(doc(db, 'sessions', user.uid));
  return snap.exists() ? snap.data().memberId : null;
}

export async function teacherLogin() {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  if (!isTeacherUser(user)) {
    await signOut(auth);
    throw new Error('此 Google 帳號不是講師帳號');
  }
}

export const logout = () => signOut(auth);

// 講師重設：產生新隨機碼覆蓋雜湊（舊碼失效），明文只回傳給講師畫面
export async function resetMemberCode(memberId) {
  const code = generateCode();
  try {
    await setDoc(doc(db, 'secrets', memberId), { codeHash: await hashCode(code) });
  } catch (e) {
    throw permissionError(e, '只有講師帳號可以重設隨機碼');
  }
  return code;
}

// ---------- 作業 ----------
export async function saveSubmission({ member, type, title, url, description }) {
  try {
    await setDoc(doc(db, 'submissions', `${member.id}_${type}`), {
      memberId: member.id, name: member.name, type,
      title: title.trim(), url: url.trim(), description: description.trim(), updatedAt: Date.now(),
    });
  } catch (e) {
    throw permissionError(e, '尚未登入、隨機碼已失效或資料格式不符');
  }
}

// ---------- 講師評分 ----------
export async function saveTeacherRating({ sub, scores, comment }) {
  try {
    await setDoc(doc(db, 'teacherRatings', sub.id), {
      subId: sub.id, memberId: sub.memberId, ...scores,
      total: calcTotal(TEACHER_CRITERIA, scores), comment: comment.trim(), updatedAt: Date.now(),
    });
  } catch (e) {
    throw permissionError(e, '只有講師帳號可以評分');
  }
}

// ---------- 同儕互評 ----------
// 評分與公開統計在同一筆交易更新，規則會核對統計變動量必須等於這筆評分的差額
export async function savePeerRating({ me, sub, scores, comment }) {
  const ratingRef = doc(db, 'peerRatings', `${me}_${sub.id}`);
  const statsRef = doc(db, 'stats', sub.id);
  const total = calcTotal(PEER_CRITERIA, scores);
  try {
    await runTransaction(db, async (tx) => {
      const [r, s] = await Promise.all([tx.get(ratingRef), tx.get(statsRef)]);
      const stat = s.exists() ? s.data() : { sum: 0, count: 0 };
      tx.set(ratingRef, {
        raterId: me, subId: sub.id, targetMemberId: sub.memberId, ...scores,
        total, comment: comment.trim(), updatedAt: Date.now(),
      });
      tx.set(statsRef, {
        sum: stat.sum + total - (r.exists() ? r.data().total : 0),
        count: stat.count + (r.exists() ? 0 : 1),
        updatedAt: Date.now(),
      });
    });
  } catch (e) {
    throw permissionError(e, '無法送出：請確認已登入，且不是評自己的作品');
  }
}

// ---------- 即時訂閱 ----------
export const subscribeMembers = (cb) =>
  onSnapshot(query(collection(db, 'members'), orderBy('createdAt', 'desc')), (s) => cb(withId(s)));

export const subscribeSubmissions = (cb) =>
  onSnapshot(query(collection(db, 'submissions'), orderBy('updatedAt', 'desc'), limit(200)), (s) => cb(withId(s)));

const subscribeMap = (name) => (cb) =>
  onSnapshot(collection(db, name), (s) => cb(Object.fromEntries(withId(s).map((d) => [d.id, d]))));

export const subscribeTeacherRatings = subscribeMap('teacherRatings');
export const subscribeStats = subscribeMap('stats');

export const subscribeMyPeerRatings = (me, cb) =>
  onSnapshot(query(collection(db, 'peerRatings'), where('raterId', '==', me)),
    (s) => cb(Object.fromEntries(withId(s).map((d) => [d.subId, d]))));
