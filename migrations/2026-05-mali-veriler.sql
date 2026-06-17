-- ═══════════════════════════════════════════════════════════
-- MALİ YETERLİLİK — bilanço ve ciro verisi (yıl bazlı)
-- Kaynak: Bakanlık Excel "Bilanço" ve "Ciro" sayfaları
--
-- E grubu ve üzeri başvurular için zorunlu (Yapım İşleri İhaleleri Uygulama
-- Yönetmeliği). Bilanço son 3 yıl, ciro son 3-6 yıl için sunulur.
-- ═══════════════════════════════════════════════════════════

create table if not exists mali_veriler (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  yil          smallint not null,           -- 2023, 2024, 2025 vb.

  -- BİLANÇO (Bakanlık'ın 7 standart kalemi)
  donen_varliklar     bigint,
  kv_borclar          bigint,               -- Kısa Vadeli Borçlar
  oz_kaynaklar        bigint,
  toplam_aktif        bigint,
  yyi_maliyet         bigint,               -- Yıllara Yaygın İnşaat Maliyetleri (opsiyonel düzeltme)
  kv_banka_borclar    bigint,               -- Kısa Vadeli Banka Borçları
  yyi_hakedis         bigint,               -- Yıllara Yaygın İnşaat Hakediş Gelirleri (opsiyonel)

  -- CİRO (yıllık tek değer + yapım iş cirosu)
  toplam_ciro         bigint,               -- TL — son 6 yıl için ayrı satır
  yapim_cirosu        bigint,               -- TL — son 3 yıl için ayrı satır

  -- Ortaklık/Birleşme oranı (opsiyonel — ortak girişim/birleşme sonrası ciro/bilanço)
  -- Bakanlık formunda %50 örneği var. Pay 100 ise normal şirket; daha azsa pay × değer.
  ortaklik_pay_yuzde  numeric(5,2),         -- 0-100

  olusturulma timestamptz default now(),
  guncelleme  timestamptz default now(),
  unique (company_id, yil)
);

create index if not exists mali_veriler_company_idx on mali_veriler(company_id);
create index if not exists mali_veriler_yil_idx     on mali_veriler(yil);

-- ─── RLS ─────────────────────────────────────────────────
alter table mali_veriler enable row level security;

-- Müşteri sadece kendi firmasının verisini görür/yazar
create policy "mali_veriler_owner" on mali_veriler
  for all using (
    company_id in (select id from companies where user_id = auth.uid())
  );

-- Admin yorumdaki email listenizi düzenleyip aktif edin:
-- create policy "mali_veriler_admin" on mali_veriler
--   for all using (auth.jwt() ->> 'email' in ('admin@example.com'));
