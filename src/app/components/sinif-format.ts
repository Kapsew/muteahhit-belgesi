// ====================================================================
// sinif-format.ts — Yapı sınıfı GÖSTERİM dönüşümü
//
// Motor içi temsil Roma rakamlıdır ("III.C") ve BM tablolarında ANAHTAR
// olarak kullanılır — bu yüzden iç temsili ASLA değiştirmiyoruz.
// Kullanıcıya numerik ("3C") gösteririz; girişi tekrar Roma'ya çeviririz.
// ====================================================================

const NUM: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6" };
const ROM: Record<string, string> = { "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V", "6": "VI" };

// "III.C" -> "3C"  (tanınmayan değer olduğu gibi döner)
export function sinifNumerik(s?: string | null): string {
  if (!s) return s ?? "";
  const m = s.trim().match(/^(III|IV|VI|II|V|I)\.?\s*([A-Ea-e])$/);
  if (!m) return s;
  const n = NUM[m[1].toUpperCase()];
  return n ? n + m[2].toUpperCase() : s;
}

// "3C" -> "III.C"  (motor içi biçim; tanınmayan değer olduğu gibi döner)
export function sinifRoman(s?: string | null): string {
  if (!s) return s ?? "";
  const t = s.trim();
  if (t.includes(".")) return t.toUpperCase();       // zaten Roma
  const m = t.match(/^([1-6])\s*([A-Ea-e])$/);
  if (!m) return t;
  const r = ROM[m[1]];
  return r ? `${r}.${m[2].toUpperCase()}` : t;
}
