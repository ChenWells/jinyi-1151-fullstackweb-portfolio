import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, writeBatch, setDoc, getDocs, query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { hashNationalId, hashCode, generateCode } from './identity.js';

const env = import.meta.env;
export const ID_SALT = env.VITE_ID_SALT || 'dev-salt';
export const configured = Boolean(env.VITE_FIREBASE_PROJECT_ID);

const db = configured
  ? getFirestore(initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    }))
  : null;

export const WORK_TYPES = {
  cv: { label: '個人線上 CV', icon: '📄' },
  webapp: { label: 'Web App（解決特定問題）', icon: '🛠️' },
};

// 註冊：身分證雜湊作為文件 ID，重複註冊時 create 會被規則拒絕
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
    if (e.code === 'permission-denied') throw new Error('此身分證字號已註冊過，若遺失隨機碼請洽講師');
    throw e;
  }
  return { memberId: memberRef.id, code };
}

// 儲存作業；是否正確由 Firestore 規則比對 codeHash
export async function saveSubmission({ member, code, type, title, url, description }) {
  const payload = {
    memberId: member.id, name: member.name, type,
    title: title.trim(), url: url.trim(), description: description.trim(),
    codeHash: await hashCode(code), updatedAt: Date.now(),
  };
  try {
    await setDoc(doc(db, 'submissions', `${member.id}_${type}`), payload);
  } catch (e) {
    if (e.code === 'permission-denied') throw new Error('隨機碼錯誤或資料格式不符');
    throw e;
  }
}

export const subscribeMembers = (cb) =>
  onSnapshot(query(collection(db, 'members'), orderBy('createdAt', 'desc')),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))));

export const subscribeSubmissions = (cb) =>
  onSnapshot(query(collection(db, 'submissions'), orderBy('updatedAt', 'desc'), limit(200)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))));

export const fetchMembers = async () =>
  (await getDocs(collection(db, 'members'))).docs.map((d) => ({ id: d.id, ...d.data() }));
