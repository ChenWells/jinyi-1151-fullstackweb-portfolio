const LETTER_VALUE = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18, K: 19, L: 20, M: 21,
  N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

export function normalizeId(id) {
  return String(id || '').trim().toUpperCase();
}

// 驗證中華民國身分證字號格式與檢查碼
export function isValidNationalId(raw) {
  const id = normalizeId(raw);
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;
  const n = LETTER_VALUE[id[0]];
  let sum = Math.floor(n / 10) + (n % 10) * 9;
  for (let i = 1; i <= 8; i++) sum += Number(id[i]) * (9 - i);
  sum += Number(id[9]);
  return sum % 10 === 0;
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const hashNationalId = (id, salt) => sha256(`${salt}:${normalizeId(id)}`);
export const hashCode = (code) => sha256(`code:${String(code).trim().toUpperCase()}`);

// 排除易混淆字元 (0/O, 1/I)；8 碼約 40 bits
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateCode(length = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}
