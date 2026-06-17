// ====================================================================
// hesapla-adapter.ts
// Hızlı-hesap akışındaki Is[] (OCR çıktısı) verisini hesaplama-motor'un
// tamHesapla() fonksiyonuna bağlar. Tarih ve enum dönüşümlerini yapar.
// ====================================================================

import type { Is } from "./types";
import {
  tamHesapla,
  type TamHesaplama,
  type TamHesaplaGirdisi,
} from "../hesaplama-motor";

// "02.12.2021" (gg.aa.yyyy) → "2021-12-02" (ISO, DB date için)
export function trTariheIso(t: string): string {
  if (!t) return "";
  const s = t.trim();
  // zaten ISO ise olduğu gibi bırak
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (!m) return "";
  const [, g, a, y] = m;
  return `${y}-${a.padStart(2, "0")}-${g.padStart(2, "0")}`;
}

// frontend isTuru → DB/motor is_deneyimi_tipi
// "kamu" motorda yok → "taahhut" sayılır (kamu işi de bedel üzerinden)
export function isTuruToDeneyim(t: Is["isTuru"]): "kat_karsiligi" | "taahhut" {
  return t === "kat-karsiligi" ? "kat_karsiligi" : "taahhut";
}

// Is[] → tamHesapla girdisi
export function islerToGirdi(isler: Is[]): TamHesaplaGirdisi[] {
  return isler.map((is) => ({
    id: is.id,
    sozlesmeTarihi: trTariheIso(is.sozlesmeTarihi),
    iskanTarihi: is.iskanTarihi ? trTariheIso(is.iskanTarihi) : undefined,
    ruhsatSinifi: is.sinif || "III.B",
    insaatAlaniM2: typeof is.alanM2 === "number" ? is.alanM2 : 0,
    isDeneyimiTipi: isTuruToDeneyim(is.isTuru),
    taahhutBedeli: is.sozlesmeBedeli,
    yapiTipi: is.yapiTipi,
  }));
}

// Ana giriş: Is[] + opsiyonel diploma tarihi → tam hesaplama sonucu
export function hesaplaIsler(
  isler: Is[],
  mezuniyetTarihi?: string | null
): TamHesaplama {
  const girdi = islerToGirdi(isler);
  return tamHesapla(girdi, mezuniyetTarihi || null);
}
