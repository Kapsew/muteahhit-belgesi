-- ═══════════════════════════════════════════════════════════
-- MULTI-CLASS: Bir parselde birden fazla yapı sınıfı desteği
-- Kaynak: Bakanlık Excel "İş Deneyim" — R4 satırında 6 sınıf yan yana
--
-- Mevcut yapı: experiences.yapi_sinifi (tek string) + insaat_alani_m2 (tek sayı)
-- Yeni: yapi_sinifi_dagilimi (JSONB array) — [{sinif: "III.B", alan: 1814}, ...]
--
-- Geriye uyumlu: NULL ise eski tek-sınıf yapı kullanılır.
-- Doluysa motor multi-class mantığını uygular (alanı en büyük sınıfın katsayısı).
-- ═══════════════════════════════════════════════════════════

alter table experiences
  add column if not exists yapi_sinifi_dagilimi jsonb;

-- Geçerlilik notu (foreign data validation):
-- Beklenen format: [{"sinif": "III.B", "alan": 1814.5}, ...]
-- alan toplamı genelde insaat_alani_m2 ile eşitlenir ama enforce edilmez.
