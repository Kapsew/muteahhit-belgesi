// ====================================================================
// claudeOcr.ts — İskan belgelerini Claude API ile okutma
//
// Supabase Edge Function endpoint'ini çağırır (anonim erişim, login yok).
// Çıkan ham veri Is tipi şemasına eşlenir.
// ====================================================================

import type { Is, IsTuru } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FN_BASE = `${SUPABASE_URL}/functions/v1/make-server-e2702d20`;

interface ClaudeIs {
  isAdi: string | null;
  sozlesmeTarihi: string | null;
  iskanTarihi: string | null;
  alanM2: number | null;
  sinif: string | null;
  yapiTipi: "konut" | "ticari" | "sanayi";
  muteahhit: string | null;
  yapiYuksekligi: number | null;
  katSayisiToplam?: number | null;
  katSayisiUst?: number | null;
  katSayisiAlt?: number | null;
  guvenDusukAlanlar: string[];
  _dosyaAdi?: string;
}

export interface ReddedilenBelge {
  ad: string;
  sebep: string;
}

export interface OcrSonucu {
  isler: Is[];
  reddedilen: ReddedilenBelge[];
}

function dosyaToBase64(f: File): Promise<{ ad: string; mimeType: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const url = fr.result as string;
      const base64 = url.split(",")[1] ?? "";
      resolve({ ad: f.name, mimeType: f.type || "application/pdf", base64 });
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(f);
  });
}

export async function claudeOcr(files: File[]): Promise<OcrSonucu> {
  const dosyalar = await Promise.all(files.map(dosyaToBase64));
  const r = await fetch(`${FN_BASE}/ocr-iskan`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ dosyalar }),
  });
  const data: { isler?: ClaudeIs[]; reddedilen?: ReddedilenBelge[]; error?: string } = await r.json().catch(() => ({}));
  if (!r.ok || data.error) {
    throw new Error(data.error || `OCR hata (${r.status})`);
  }
  const ciktilar = data.isler ?? [];

  const isler: Is[] = ciktilar.map((x, i): Is => ({
    id: `is-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    isAdi: x.isAdi ?? "—",
    sozlesmeTarihi: x.sozlesmeTarihi ?? "",
    iskanTarihi: x.iskanTarihi ?? "",
    alanM2: typeof x.alanM2 === "number" ? x.alanM2 : 0,
    sinif: x.sinif ?? "",
    yapiTipi: x.yapiTipi || "konut",
    isTuru: "kat-karsiligi" as IsTuru,
    muteahhit: x.muteahhit ?? "—",
    guvenDusukAlanlar: Array.isArray(x.guvenDusukAlanlar) ? x.guvenDusukAlanlar : [],
    yapiYuksekligiM: typeof x.yapiYuksekligi === "number" ? x.yapiYuksekligi : undefined,
    katSayisiToplam: typeof x.katSayisiToplam === "number" ? x.katSayisiToplam : undefined,
    katSayisiUst: typeof x.katSayisiUst === "number" ? x.katSayisiUst : undefined,
    katSayisiAlt: typeof x.katSayisiAlt === "number" ? x.katSayisiAlt : undefined,
  }));

  return { isler, reddedilen: data.reddedilen ?? [] };
}
