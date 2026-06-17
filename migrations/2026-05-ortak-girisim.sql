-- ═══════════════════════════════════════════════════════════
-- ORTAK GİRİŞİM (JV) — Konsorsiyum başvuruları
-- Kaynak: Bakanlık Excel "Ortaklık" sayfası
--
-- Kural (R8 formülü): Pilot ortak, talep edilen grubun en az %60'ını sağlamalı.
-- Diğer ortakların grupları ve payları toplam yetkinliğe katkıda bulunur.
-- ═══════════════════════════════════════════════════════════

create table if not exists ortak_girisim (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade unique,
  talep_grup    text,                  -- "E1" vb. talep edilen grup
  guncelleme    timestamptz default now()
);

create table if not exists ortak_girisim_uyesi (
  id              uuid primary key default gen_random_uuid(),
  girisim_id      uuid not null references ortak_girisim(id) on delete cascade,
  sira            smallint not null,    -- 0=pilot, 1,2,3=diğer ortaklar
  ad              text not null,        -- ortak firma adı
  grup            text not null,        -- ortağın grubu (A-H)
  pay_yuzde       numeric(5,2) not null check (pay_yuzde > 0 and pay_yuzde <= 100),
  guncelleme      timestamptz default now()
);

create index if not exists ogu_girisim_idx on ortak_girisim_uyesi(girisim_id);

-- RLS
alter table ortak_girisim       enable row level security;
alter table ortak_girisim_uyesi enable row level security;

create policy "og_owner" on ortak_girisim
  for all using (
    company_id in (select id from companies where user_id = auth.uid())
  );
create policy "ogu_owner" on ortak_girisim_uyesi
  for all using (
    girisim_id in (
      select og.id from ortak_girisim og
      join companies c on c.id = og.company_id
      where c.user_id = auth.uid()
    )
  );
