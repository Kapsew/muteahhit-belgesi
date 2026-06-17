-- ═══════════════════════════════════════════════════════════
-- SANAYİ İŞ TİPİ + İHALE TÜRÜ + GERÇEKLEŞTİRME ORANI
--
-- Bakanlık Excel'inde 3 iş tipi var:
--   1. Kat/arsa karşılığı (mevcut "kat_karsiligi")
--   2. Kamu işleri / özel sektör bedel karşılığı (mevcut "taahhut")
--   3. SANAYİ — sözleşme bedeli üzerinden + 02.12.2019 mevzuat ayrımı (YENİ)
--
-- Bu migration:
--  - experiences.is_deneyimi_tipi enum'una "sanayi" eklenebilmesi için CHECK kısıtını gevşetir
--  - Sanayi için: ruhsat_tarihi + ruhsat_grubu sütunları
--  - İhale türü (4734/özel) + ihale_ilan_tarihi (taahhüt için)
--  - Gerçekleştirilme oranı (tüm tipler)
-- ═══════════════════════════════════════════════════════════

-- 1. Eski CHECK kısıtı varsa kaldır
do $$ begin
  if exists (select 1 from information_schema.check_constraints
             where constraint_name like '%is_deneyimi_tipi%' and constraint_schema = 'public') then
    -- check constraint adını bulup düşür (varsa)
    null;
  end if;
end $$;

-- 2. Yeni alanlar (geriye uyumlu, hepsi nullable)
alter table experiences
  add column if not exists ruhsat_tarihi date,                                    -- sanayi için ayrı tarih (kat'ta sözleşmeyle aynı varsayılır)
  add column if not exists ruhsat_grubu  text,                                    -- ruhsat tarihindeki grup (A/B/.../H) — sanayi'de azami iş lookup için
  add column if not exists ihale_turu    text check (ihale_turu in ('ozel', 'kamu_4734', 'kamu_4734_disi')),
  add column if not exists ihale_ilan_tarihi date,                                -- 4734 kamu işleri için endeks kaynağı
  add column if not exists gerceklesme_orani numeric(5,2) default 100             -- 0-100, default %100 tamamlanmış
    check (gerceklesme_orani >= 0 and gerceklesme_orani <= 100);

-- 3. is_deneyimi_tipi text — yeni "sanayi" değerine izin ver
-- (Varsayılan zaten text, CHECK constraint yoksa serbest)
-- Eski CHECK varsa düşürmek için (varsayılan adı tahmin et):
do $$
declare cn text;
begin
  for cn in
    select con.conname from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'experiences' and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%is_deneyimi_tipi%'
  loop
    execute format('alter table experiences drop constraint %I', cn);
  end loop;
end $$;

-- Yeni esnek check (kat_karsiligi | taahhut | sanayi)
alter table experiences
  add constraint experiences_is_deneyimi_tipi_check
    check (is_deneyimi_tipi in ('kat_karsiligi', 'taahhut', 'sanayi'));
