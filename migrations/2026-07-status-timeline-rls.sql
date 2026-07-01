-- ====================================================================
-- 2026-07-status-timeline-rls.sql
-- Sorun: "Hesaplama Yaptır" (müşteri panelinden) status_timeline'a insert
--        yapmaya çalışınca 403 "row-level security policy" hatası alıyordu.
-- Çözüm: Müşteri KENDİ firmasının süreç kayıtlarını ekleyip görebilsin.
--
-- Supabase panelinde: SQL Editor > bu dosyanın içeriğini yapıştır > Run.
-- Idempotent: tekrar çalıştırmak güvenli (drop policy if exists).
-- ====================================================================

alter table status_timeline enable row level security;

-- Okuma: müşteri kendi firmasının geçmişini görebilir
drop policy if exists "status_timeline_owner_read" on status_timeline;
create policy "status_timeline_owner_read" on status_timeline
  for select using (
    company_id in (select id from companies where user_id = auth.uid())
  );

-- Ekleme (403'ü çözen kısım): müşteri kendi firmasına süreç kaydı ekleyebilir
drop policy if exists "status_timeline_owner_insert" on status_timeline;
create policy "status_timeline_owner_insert" on status_timeline
  for insert with check (
    company_id in (select id from companies where user_id = auth.uid())
  );

-- Not: Admin erişimi için (varsa) mevcut admin politikanız korunur;
-- bu politikalar OR (permissive) olarak birleşir, mevcut erişimi kısıtlamaz.
