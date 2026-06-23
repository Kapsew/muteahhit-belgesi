// ====================================================================
// kayit.ts
// Hızlı-hesap akışının "Ödemeye geç" anında yaptığı tüm kayıt işlemleri:
//   1) Supabase signup (otomatik giriş — email onayı kapalı varsayılır)
//   2) companies kaydı
//   3) experiences kaydı (OCR'dan gelen işler)
//   4) reports kaydı (hesaplama sonucu)
//   5) status_timeline ilk kayıt ("pending_payment")
//   6) mali beyanname dosyası → storage (varsa)
// ====================================================================

import { supabase } from "../supabase-client";
import type { Is } from "./types";
import type { TamHesaplama } from "../hesaplama-motor";
import { trTariheIso, isTuruToDeneyim } from "./hesapla-adapter";
import type { OturumDurumu } from "./types";

export interface KayitSonucu {
  companyId: string;
  userId: string;
  reportId: string;
}

type Iletisim = OturumDurumu["iletisim"];

export async function kayitYap(
  iletisim: Iletisim,
  isler: Is[],
  hesap: TamHesaplama,
  maliBeyanname: File | null
): Promise<KayitSonucu> {
  // ── 1) Signup ──
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: iletisim.eposta,
    password: iletisim.sifre,
    options: { data: { full_name: iletisim.yetkili } },
  });
  if (authError) throw new Error(`Kayıt hatası: ${authError.message}`);

  const userId = authData.user?.id;
  if (!userId) throw new Error("Kullanıcı oluşturulamadı (oturum açılmadı). Email onayı kapalı mı?");

  // Oturum gerçekten açıldı mı? RLS için şart.
  if (!authData.session) {
    // Email onayı açık kalmışsa session gelmez → giriş deneyelim
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: iletisim.eposta,
      password: iletisim.sifre,
    });
    if (signInErr) {
      throw new Error(
        "Hesap oluşturuldu ancak otomatik giriş yapılamadı. Supabase'de email onayı kapalı olmalı."
      );
    }
  }

  // ── 2) companies ──
  const { data: company, error: compErr } = await supabase
    .from("companies")
    .insert({
      user_id: userId,
      user_email: iletisim.eposta,
      company_name: iletisim.firmaUnvani,
      tax_id: iletisim.vergiNo,
      phone: iletisim.telefon,
      email: iletisim.eposta,
      hesaplanan_grup: hesap.tercihEdilenGrup,
      app_status: "pending_payment",
      partners: [],
    })
    .select()
    .single();
  if (compErr) throw new Error(`Firma kaydı hatası: ${compErr.message}`);
  const companyId = company.id as string;

  // ── 3) experiences ──
  if (isler.length > 0) {
    const expRows = isler.map((is) => ({
      company_id: companyId,
      is_deneyimi_tipi: isTuruToDeneyim(is.isTuru),
      ada_parsel: is.isAdi || null,
      sozlesme_tarihi: trTariheIso(is.sozlesmeTarihi) || null,
      iskan_tarihi: is.iskanTarihi ? trTariheIso(is.iskanTarihi) : null,
      insaat_alani_m2: typeof is.alanM2 === "number" ? is.alanM2 : null,
      yapi_sinifi: is.sinif || null,
      yapi_tipi: is.yapiTipi || null,
      taahhut_bedeli: is.sozlesmeBedeli ?? null,
    }));
    const { error: expErr } = await supabase.from("experiences").insert(expRows);
    if (expErr) throw new Error(`İş deneyimi kaydı hatası: ${expErr.message}`);
  }

  // ── 4) reports ──
  const { data: report, error: repErr } = await supabase
    .from("reports")
    .insert({
      company_id: companyId,
      company_name: iletisim.firmaUnvani,
      hesaplanan_grup: hesap.tercihEdilenGrup,
      tercih_yontem: hesap.tercihEdilenYontem,
      toplam_guncel_tutar: hesap.tercihEdilenToplam,
      y1: hesap.y1 as any,
      y2: hesap.y2 as any,
      diploma: hesap.diploma as any,
      is_detaylari: hesap.isler as any,
      banka_ref_tutari: hesap.bankaRefTutari,
      is_hacmi: hesap.isHacmi as any,
      durum: "yayinda",
    })
    .select()
    .single();
  if (repErr) throw new Error(`Rapor kaydı hatası: ${repErr.message}`);

  // ── 5) status_timeline ──
  await supabase.from("status_timeline").insert({
    company_id: companyId,
    status: "pending_payment",
    status_label: "Ödeme bekleniyor",
    note: "Hızlı analiz tamamlandı, ödeme bekleniyor.",
  });

  // ── 6) mali beyanname → storage (opsiyonel) ──
  if (maliBeyanname) {
    try {
      const ext = maliBeyanname.name.split(".").pop() || "pdf";
      const path = `${companyId}/mali_beyanname_${Date.now()}.${ext}`;
      await supabase.storage.from("evraklar").upload(path, maliBeyanname, { upsert: true });
    } catch {
      // dosya yüklenemese de kayıt akışı bozulmasın
    }
  }

  return { companyId, userId, reportId: report.id as string };
}

// Test ödeme — gerçek ödeme entegrasyonu yerine durumu ilerletir
export async function testOdemeTamamla(companyId: string): Promise<void> {
  const { error } = await supabase
    .from("companies")
    .update({ app_status: "payment_received", guncelleme: new Date().toISOString() })
    .eq("id", companyId);
  if (error) throw new Error(`Ödeme güncelleme hatası: ${error.message}`);

  await supabase.from("status_timeline").insert({
    company_id: companyId,
    status: "payment_received",
    status_label: "Ödeme alındı",
    note: "Test ödemesi tamamlandı.",
  });
}
