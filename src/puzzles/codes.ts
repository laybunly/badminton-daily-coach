// 5-character task codes (FNV-1a over id + salt). Codes are shared by users and must never change.
import { PUZ_DE } from './catalog';

const CODE_AB = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ID2CODE: Record<string, string> = {};
/** code → index into PUZ_DE / PUZZLES */
export const CODE2IDX: Record<string, number> = {};
PUZ_DE.forEach((p, i) => {
  let salt = 0, code: string;
  do {
    let h = 2166136261;
    for (const ch of p.id + '#' + salt) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    code = ''; for (let k = 0; k < 5; k++) { code += CODE_AB[h % 32]; h = Math.floor(h / 32) ^ (k * 7919); }
    salt++;
  } while (CODE2IDX[code] != null);
  ID2CODE[p.id] = code; CODE2IDX[code] = i;
});
