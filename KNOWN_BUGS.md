# Bilinen Buglar

## BUG-001: Wizard Özet — Şifre alanları footer altında kalıyor
- **Sayfa:** Wizard 4. adım (Özet / Hesap oluşturma)
- **Önem:** 🔴 Yüksek
- **Açıklama:** "Başvuruyu Tamamla" butonuna basıldığında hesap oluşturma formu (e-posta, şifre, şifre tekrar) gösteriliyor ancak bu alanlar ve "Kaydol & Devam Et" butonu sticky footer barının altında kalıyor. Kullanıcı scroll yapamıyor ve şifre alanlarına / hata mesajına ulaşamıyor.
- **Adımlar:** Wizard → 4 adımı tamamla → "Başvuruyu Tamamla" tıkla → Şifre alanları ve buton görünmüyor
- **Beklenen:** Sayfa otomatik scroll ile şifre alanlarını göstermeli, tüm form footer üzerinde görünür olmalı
- **Dosya:** `src/app/components/wizard-page.tsx`

## BUG-002: Geçersiz URL — Özel 404 sayfası yok
- **Sayfa:** Tüm site
- **Önem:** 🟡 Orta
- **Açıklama:** Var olmayan bir URL'ye gidildiğinde (ör: `/gecersiz-sayfa`) React Router'ın default error boundary'si görünüyor: "Unexpected Application Error! 404 Not Found". Özel bir 404 sayfası tasarlanmalı.
- **Dosya:** `src/app/routes.ts` — catch-all route eklenecek

## BUG-003: Wizard — Vergi no alanı harfleri kabul ediyor
- **Sayfa:** Wizard 1. adım (Şirket bilgileri)
- **Önem:** 🟡 Orta
- **Açıklama:** Vergi no input'u `type="text"` olduğu için "ABCDEFGHIJ" gibi harf girişi kabul ediliyor. Input'un sadece rakam kabul etmesi gerekir (`type="number"` veya regex mask).
- **Adımlar:** Wizard → Vergi no alanına "ABCDEF" yaz → kabul ediliyor
- **Beklenen:** Sadece rakam girişine izin verilmeli, harfler engellemeli veya uyarı gösterilmeli
- **Dosya:** `src/app/components/wizard-page.tsx`

## BUG-004: Wizard — Footer referans şeridi eski firmalarla dolu
- **Sayfa:** Wizard — alt kısımdaki referans şeridi
- **Önem:** 🟢 Düşük
- **Açıklama:** Landing page'deki referans listesi gerçek firmalara güncellendi (Acoda, Alka, SRS vb.) ancak wizard'ın alt kısmındaki kayan referans şeridinde hâlâ eski sahte firmalar (Meş Gayrimenkul, Doğu Yapı vb.) görünüyor.
- **Beklenen:** Wizard referansları landing page ile aynı gerçek firma listesini kullanmalı
- **Dosya:** `src/app/components/wizard-page.tsx` — referanslar dizisi

---

# Test Raporu — Detaylı Monkey Testing

**Tarih:** 2026-04-09
**Senaryolar:** Sıfırdan belge alan, yükseltme yapan, tekrar başvuru yapan kullanıcı
**Test Türleri:** Error Guessing, Foolproof/Idiot-proof, Negative Testing, Stress Testing

## ANASAYFA

| # | Test | Tür | Sonuç | Not |
|---|------|-----|-------|-----|
| 1 | XSS injection email alanında (`<script>alert('xss')</script>`) | Error Guessing | ✅ Güvenli | React escape yapıyor, Supabase hata dönüyor |
| 2 | SQL injection email (`' OR 1=1 --`) | Negative | ✅ Güvenli | Supabase parametrize sorgu |
| 3 | 500+ karakter email gönderimi | Negative | ✅ Güvenli | Crash yok, hata mesajı düzgün |
| 4 | Emoji+Türkçe karakter şifre | Negative | ✅ Güvenli | Hata mesajı düzgün |
| 5 | Boş form gönderim engeli | Foolproof | ✅ Çalışıyor | Buton disabled |
| 6 | Giriş butonuna 10x hızlı tıklama | Stress | ✅ Crash yok | |
| 7 | İstanbul/İstanbul Dışı tab geçişi | Foolproof | ✅ Çalışıyor | |
| 8 | Mevzuat accordion hızlı aç/kapa | Stress | ✅ Crash yok | |
| 9 | Mobil responsive (375px) | Foolproof | ✅ Düzgün | Hamburger menü yok (bilinen) |

## WIZARD

| # | Test | Tür | Sonuç | Not |
|---|------|-----|-------|-----|
| 10 | Boş form "Devam et" — tüm zorunlu alanlar listelenir | Foolproof | ✅ Çalışıyor | 7 eksik alan listeleniyor |
| 11 | Vergi no'ya harf girişi (ABCDEFGHIJ) | Negative | 🐛 BUG-003 | Kabul ediliyor, engellenmeli |
| 12 | H grubu → Yapım İşi geçiş (isHGrubu reset) | Error Guessing | ✅ Düzgün reset | |
| 13 | Yapım işi seçili — iş deneyimi boş bırakıp devam | Foolproof | ✅ Engelleniyor | Sözleşme/iskan/alan/sınıf zorunlu |
| 14 | "Yenileme" seçimi — mevcut grup alanları gösterimi | Error Guessing | ✅ Çalışıyor | |
| 15 | İstanbul + H grubu = tek paket 12.000₺ | Foolproof | ✅ Doğru | |
| 16 | Özet → "Başvuruyu Tamamla" → şifre alanları | Error Guessing | 🐛 BUG-001 | Footer altında kalıyor |
| 17 | Geri butonu adım geçişi | Foolproof | ✅ Doğru adıma dönüyor | |
| 18 | Wizard referans şeridi | Error Guessing | 🐛 BUG-004 | Eski firmalar görünüyor |

## DASHBOARD

| # | Test | Tür | Sonuç | Not |
|---|------|-----|-------|-----|
| 19 | Giriş yapılmamış — boş durum | Foolproof | ✅ Doğru mesaj | "Başvuru Formunu Doldurun" |
| 20 | Konsol hataları | Error Guessing | ✅ Yok | |

## REHBERLER

| # | Test | Tür | Sonuç | Not |
|---|------|-----|-------|-----|
| 21 | Negatif m² (-500) ile hesaplama | Negative | ✅ Engelleniyor | Sonuç gösterilmiyor |
| 22 | Aşırı büyük m² (999.999.999) | Stress | ✅ Crash yok | |
| 23 | Boş soru formu gönderimi | Foolproof | ✅ Hata mesajı | "Ad soyad zorunludur" |
| 24 | Geçersiz URL (/gecersiz-sayfa) | Error Guessing | 🐛 BUG-002 | Default error boundary |

## YÜKSELTME AKIŞI TESTLERİ (Senaryo: H→G, G→F vb.)

| # | Test | Tür | Sonuç | Not |
|---|------|-----|-------|-----|
| 25 | Wizard yükseltme — eski iş deneyimleri siliniyor | Error Guessing | 🐛 BUG-005 | `upsertExperiences` delete all + insert |
| 26 | Dashboard "Hesaplama Yaptır" — tekrar hesaplamada 0₺ fark | Negative | 🐛 BUG-006 | Aynı paket → fark=0, ücret alınmıyor |
| 27 | Wizard yükseltme — hesaplanan_grup null'a dönüyor | Error Guessing | 🐛 BUG-007 | Eski grup bilgisi kayboluyor |
| 28 | certificate_received → wizard yükseltme → status pending_payment'a düşüyor | Foolproof | ⚠️ Tasarım kararı | Eski belge status'u korunmuyor |
| 29 | Dashboard locked state (payment_received) — iş düzenleme engeli | Foolproof | ✅ Çalışıyor | |
| 30 | TabBelge "Yeni İş Ekle" butonu — sadece certificate_received'da görünür | Foolproof | ✅ Doğru | |
| 31 | Admin rapor yayınlama → status report_published | Foolproof | ✅ Doğru | adminSendReport akışı düzgün |
| 32 | canRequestCalc — report_published ve certificate_received'da aktif | Error Guessing | ✅ Doğru | |

## ÖZET

- **Toplam test:** 32
- **Başarılı:** 25 (✅)
- **Bug bulunan:** 7 (🐛)

### Kritik Buglar (Yükseltme Akışı)
  - BUG-005: 🔴 Kritik — Wizard yükseltmede eski iş deneyimleri tamamen siliniyor
  - BUG-006: 🟡 Orta — Tekrar hesaplamada fark ücreti alınmıyor
  - BUG-007: 🟡 Orta — Yükseltmede hesaplanan_grup null'a dönüyor

### Genel Buglar
  - BUG-001: 🔴 Yüksek — Wizard şifre alanı footer altında
  - BUG-002: 🟡 Orta — 404 sayfası yok
  - BUG-003: 🟡 Orta — Vergi no harfleri kabul ediyor
  - BUG-004: 🟢 Düşük — Wizard referanslar eski

---

# Detaylı Bug Açıklamaları (Yükseltme)

## BUG-005: Wizard yükseltme — Eski iş deneyimleri siliniyor 🔴 Kritik
- **Sayfa:** Wizard (yükseltme modu) + `supabase-client.ts`
- **Önem:** 🔴 Kritik
- **Açıklama:** `upsertExperiences()` fonksiyonu (supabase-client.ts satır 199-200) yeni deneyim kaydetmeden önce `delete().eq("company_id", companyId)` ile **tüm mevcut deneyimleri siliyor**. Yükseltme senaryosunda (H→G gibi) kullanıcının eski sertifikası için kullanılmış olan iş deneyimleri de silinir. Bu, raporlama ve geçmiş takibi açısından veri kaybına yol açar.
- **Senaryo:** H grubu almış kullanıcı → "Yeni İş Ekle" tıklar → wizard'da sadece yeni işini girer → eski işleri silinir
- **Beklenen:** Eski deneyimler korunmalı, yeniler eklenmeli (INSERT only, DELETE yapılmamalı yükseltmede)
- **Dosya:** `src/app/components/supabase-client.ts` satır 199-200

## BUG-006: Tekrar hesaplamada fark ücreti 0₺ çıkıyor 🟡
- **Sayfa:** Dashboard → TabFirma → "Hesaplama Yaptır"
- **Önem:** 🟡 Orta
- **Açıklama:** `handleHesaplamaYaptir` fark hesabı `mevcutPaket` ve `yeniPaket` fiyatlarını karşılaştırıyor. Kullanıcı daha önce `sadece_hesaplama` (11K) almışsa ve tekrar hesaplama isterse, `yeniPaket` yine `sadece_hesaplama` → fark=0₺ → fatura kesilmiyor. Ancak her yeni hesaplama için ücret alınması gerekir.
- **Senaryo:** G grubu almış, yeni iş ekledi, "Hesaplama Yaptır" tıkladı → 0₺ fatura → ücretsiz hesaplama
- **Beklenen:** Her yeni hesaplama talebi için sabit bir ücret (ör: 11.000₺) veya "tekrar hesaplama ücreti" alınmalı
- **Dosya:** `src/app/components/dashboard-page.tsx` satır 504-508

## BUG-007: Yükseltmede hesaplanan_grup null'a sıfırlanıyor 🟡
- **Sayfa:** Wizard (yükseltme modu)
- **Önem:** 🟡 Orta
- **Açıklama:** Wizard `saveCompany()` fonksiyonu (satır 308) her zaman `hesaplanan_grup: null` set ediyor. Yükseltme senaryosunda kullanıcının mevcut grubu (ör: G) silinir ve dashboard'da "Analiz bekleniyor" görünür. Admin yeni rapor yayınlayana kadar eski grup bilgisi kayıp.
- **Senaryo:** G grubu sertifikası var → yükseltme wizard → `hesaplanan_grup` null olur → dashboard'da grup bilgisi kaybolur
- **Beklenen:** Yükseltmede `hesaplanan_grup` mevcut değeri korumalı veya `mevcut_grup`'a düşmeli, null olmamalı
- **Dosya:** `src/app/components/wizard-page.tsx` satır 308

---

# Güvenlik, Uyumluluk ve UAT Testleri (2. Tur)

**Tarih:** 2026-04-09
**Test Türleri:** Usability, Security/Penetration, Compatibility, Responsive, Regression, UAT

## GÜVENLİK / PENETRASYON TESTLERİ

## BUG-008: Tablet navbar taşması
- **Sayfa:** Anasayfa (768px tablet)
- **Önem:** 🟡 Orta
- **Açıklama:** Tablet genişliğinde (768px) navbar'daki linkler (Nasıl Çalışır, Hizmetlerimiz, Referanslar, Mevzuat, Rehberler, Blog) + butonlar (Giriş Yap, Hemen Başla) sığmıyor, satır taşması oluyor.
- **Dosya:** `src/app/components/landing-page.tsx` — navbar

## BUG-009: Admin paneline localStorage bypass ile şifresiz giriş 🔴 Kritik
- **Sayfa:** Admin paneli
- **Önem:** 🔴 Kritik (Güvenlik)
- **Açıklama:** Admin girişi sadece localStorage'da `{email: "admin@..."}` kontrolü yapıyor. Herhangi biri tarayıcı konsoluna `localStorage.setItem('admin_auth_session', JSON.stringify({email:'admin@muteahhitlikbelgesi.com'}))` yazarak admin paneline erişebilir. Ayrıca admin şifresi (`Admin123!`) kaynak kodda açık yazıyor (admin-page.tsx satır 19-20).
- **Kanıt:** Test sırasında başarıyla bypass edildi — 22 firma, 24 fatura verisi görüntülendi.
- **Dosya:** `src/app/components/admin-page.tsx` satır 19-20, 142

## BUG-010: Admin fonksiyonları auth kontrolü olmadan çağrılabilir 🔴 Kritik
- **Sayfa:** Tüm site (supabase-client.ts)
- **Önem:** 🔴 Kritik (Güvenlik)
- **Açıklama:** `adminGetAllCompanies()`, `adminGetAllBilling()`, `adminUpdateStatus()`, `adminAddBilling()`, `adminSendReport()` gibi fonksiyonlar herhangi bir kullanıcı tarafından browser konsolundan çağrılabilir. Supabase RLS (Row Level Security) aktif olmadığı için tüm veriler erişilebilir.
- **Kanıt:** Test sırasında 22 firma ve 24 fatura kaydı auth kontrolü olmadan döndü.
- **Dosya:** `src/app/components/supabase-client.ts` — tüm admin* fonksiyonları

## BUG-011: Supabase RLS (Row Level Security) aktif değil 🔴 Kritik
- **Sayfa:** Veritabanı
- **Önem:** 🔴 Kritik (Güvenlik)
- **Açıklama:** companies, billing, documents, reports, experiences, diplomas tablolarında RLS politikaları tanımlı değil. Herhangi bir authenticated kullanıcı başka kullanıcıların verilerini okuyabilir/değiştirebilir.
- **Beklenen:** Her tablo için `auth.uid() = user_id` kontrolü olan RLS politikaları oluşturulmalı.

## BUG-012: .env dosyası .gitignore'da yok 🟠 Yüksek
- **Sayfa:** Proje konfigürasyonu
- **Önem:** 🟠 Yüksek (Güvenlik)
- **Açıklama:** `.env` dosyası (Supabase URL ve anon key içerir) `.gitignore`'a eklenmemiş. Git'e commit edilmiş olabilir.
- **Beklenen:** `.gitignore`'a `.env` eklenmeli, mevcut key'ler Supabase dashboard'dan yenilenmeli.

## BUG-013: Dosya yükleme validasyonu yok 🟠 Yüksek
- **Sayfa:** Wizard (iskan belgesi) + Dashboard (evrak yükleme)
- **Önem:** 🟠 Yüksek
- **Açıklama:** Dosya yükleme `accept=".pdf,.jpg,.jpeg,.png"` ile client tarafında filtreleniyor ama sunucu tarafında MIME type, dosya boyutu (UI'da "Maks 10 MB" yazıyor ama kontrol yok) ve dosya uzantısı doğrulaması yapılmıyor. DevTools ile accept attribute kaldırılarak .exe/.zip yüklenebilir.
- **Dosya:** `src/app/components/supabase-client.ts` — uploadIskan(), uploadEvrak()

## BUG-014: Fiyatlar client-side hardcoded 🟠 Yüksek
- **Sayfa:** Wizard + Dashboard
- **Önem:** 🟠 Yüksek
- **Açıklama:** Paket fiyatları (7K, 11K, 12K, 20K) hem wizard-page.tsx hem dashboard-page.tsx'te client tarafında hardcoded. DevTools ile değiştirilebilir. Sunucu tarafında fiyat doğrulaması yok.
- **Dosya:** `wizard-page.tsx` satır 364-366, `dashboard-page.tsx` satır 504

## BUG-015: Admin panelinde race condition — çoklu tıklama koruması yok 🟡 Orta
- **Sayfa:** Admin paneli (fatura, şirket silme, ödeme işaretleme)
- **Önem:** 🟡 Orta
- **Açıklama:** `markPaid()`, `deleteCompany()` gibi admin fonksiyonlarında buton disabled state yok. Hızlı çoklu tıklama ile mükerrer işlem yapılabilir.
- **Dosya:** `admin-billing.tsx`, `admin-companies.tsx`

## UYUMLULUK & RESPONSIVE TEST SONUÇLARI

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 33 | Tablet navbar (768px) | 🐛 BUG-008 | Linkler sığmıyor |
| 34 | Mobil hizmet kartları (375px) | ✅ Düzgün | Dikey sıralama çalışıyor |
| 35 | Admin login mobil | ✅ Düzgün | |
| 36 | CSS uyumluluk (gap, grid, rounded) | ✅ Modern tarayıcılar uyumlu | |
| 37 | Hardcoded px genişlik | ✅ Yok | Tailwind responsive sınıfları |
| 38 | F5 refresh tüm rotalar | ✅ 200 OK | vite historyApiFallback |

## REGRESSION TEST SONUÇLARI

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 39 | V.B/V.C/V.D birim fiyat güncellemesi | ✅ Doğru | 43850, 48750, 53500 |
| 40 | İş merkezi sınıf düzeltmesi (≤21.5m→III.C) | ✅ Doğru | Eski: III.B → Yeni: III.C |
| 41 | Konut sınıflandırma (değişmedi) | ✅ Doğru | III.B, III.C, IV.A, IV.B |
| 42 | Wizard referanslar (BUG-004) | 🐛 Hâlâ eski | Landing güncel, wizard eski |

## UAT TEST SONUÇLARI

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 43 | Sıfırdan belge — wizard form doldurma akışı | ✅ Sorunsuz | 4 adım düzgün |
| 44 | H grubu → İstanbul seçimi → tek paket | ✅ Doğru | 12.000₺ |
| 45 | Yükseltme — "Yeni İş Ekle" butonu (TabBelge) | ✅ Çalışıyor | certificate_received'da görünür |
| 46 | localStorage admin bypass | 🐛 BUG-009 | Şifresiz giriş başarılı |
| 47 | adminGetAllCompanies() çağrısı | 🐛 BUG-010 | 22 firma döndü |

---

# GENEL ÖZET — TÜM TESTLER

- **Toplam test:** 47
- **Başarılı:** 33 (✅)
- **Bug bulunan:** 14 (🐛)

## Öncelik Sıralaması

### 🔴 Kritik (Hemen düzeltilmeli)
| Bug | Açıklama |
|-----|----------|
| BUG-009 | Admin paneline localStorage bypass ile şifresiz giriş |
| BUG-010 | Admin fonksiyonları auth kontrolü olmadan çağrılabilir |
| BUG-011 | Supabase RLS aktif değil |
| BUG-005 | Wizard yükseltmede eski iş deneyimleri siliniyor |
| BUG-001 | Wizard şifre alanları footer altında |

### 🟠 Yüksek
| Bug | Açıklama |
|-----|----------|
| BUG-012 | .env dosyası .gitignore'da yok |
| BUG-013 | Dosya yükleme validasyonu yok |
| BUG-014 | Fiyatlar client-side hardcoded |

### 🟡 Orta
| Bug | Açıklama |
|-----|----------|
| BUG-006 | Tekrar hesaplamada fark ücreti 0₺ |
| BUG-007 | Yükseltmede hesaplanan_grup null'a dönüyor |
| BUG-002 | 404 sayfası yok |
| BUG-003 | Vergi no harfleri kabul ediyor |
| BUG-008 | Tablet navbar taşması |
| BUG-015 | Admin çoklu tıklama koruması yok |

### 🟢 Düşük
| Bug | Açıklama |
|-----|----------|
| BUG-004 | Wizard referanslar eski |

---

# A/B Test, Navigation ve UI/UX Testleri (3. Tur)

**Tarih:** 2026-04-09
**Kapsam:** Anasayfa — A/B Test Analizi, Navigation Testing, UI/UX Testing

## NAVİGASYON TESTLERİ

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 48 | Navbar anchor linkleri (#nasil, #fiyat, #referanslar, #mevzuat) | ✅ Hepsi mevcut, scroll çalışıyor | |
| 49 | Navbar sticky davranışı | ✅ Scroll sonrası sabit kalıyor | z-index:50 |
| 50 | "Hemen Başla" → /wizard navigasyonu | ✅ Doğru | |
| 51 | "Rehberler" → /rehberler navigasyonu | ✅ Doğru | |
| 52 | "Blog" → /blog navigasyonu | ✅ Doğru | |
| 53 | Footer linkleri (#referanslar, #mevzuat, #fiyat) | ✅ Çalışıyor | |
| 54 | Footer "Admin" butonu görünürlüğü | 🐛 BUG-017 | Herkese görünür — kaldırılmalı |
| 55 | Tablet (768px) navbar | ✅ Linkler gizli, butonlar sığıyor | lg: breakpoint düzeltmesi çalıştı |
| 56 | Mobil (375px) navbar taşması | 🐛 BUG-016 | scrollWidth 436 > navWidth 375 |

## A/B TEST ANALİZİ

| # | Bulgu | Tür | Önem |
|---|-------|-----|------|
| 57 | **CTA metin tutarsızlığı:** "Hemen Başla" (navbar) vs "Analize Başla" (hero+alt CTA) vs "Başvur" (hizmet kartları) — 3 farklı metin aynı hedefe (/wizard) | A/B | 🟡 Orta |
| 58 | Hizmet kartlarındaki "Başvur" butonları paket bilgisi iletmiyor — kullanıcı wizard'da yeniden seçmek zorunda | A/B | 🟡 Orta |
| 59 | İstanbul Dışı kart "Başla" yazıyor, diğerleri "Başvur" — tutarsız | A/B | 🟢 Düşük |

## UI/UX TESTLERİ

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 60 | H1 tipografi (desktop 48px, mobil 30px) | ✅ Responsive | text-3xl/4xl/5xl |
| 61 | H2 tutarlılığı (hepsi 30px) | ✅ Tutarlı | |
| 62 | H3 tutarlılığı (kart başlıkları 18px/16px) | ✅ Kabul edilebilir | |
| 63 | CTA buton renk tutarlılığı | ✅ Hepsi #C9952B gold | |
| 64 | Hover state — referans kartları | ✅ hover:border-gold + transition | |
| 65 | Hover state — "Neden Uzman" kartları | ✅ hover:shadow-lg + transition | |
| 66 | Performans — FCP 112ms, DOM 443 node | ✅ Çok iyi | |
| 67 | Mevzuat accordion aria-expanded | 🐛 BUG-018 | Accessibility attribute eksik |
| 68 | Sayfa bölüm akışı sırası | ✅ Mantıklı | Hero→Trust→Neden→Nasıl→Uyarı→Hizmet→Ref→Mevzuat→CTA |

## YENİ BUGLAR

## BUG-016: Mobil navbar taşması (375px)
- **Sayfa:** Anasayfa — mobil
- **Önem:** 🟡 Orta
- **Açıklama:** 375px genişlikte navbar'daki logo + "Giriş Yap" + "Hemen Başla" butonları sığmıyor (scrollWidth 436px > 375px). Yatay scroll oluşuyor.
- **Beklenen:** Mobilde butonlar küçültülmeli veya tek buton (ör: sadece ikon) gösterilmeli.
- **Dosya:** `src/app/components/landing-page.tsx` — navbar buton boyutları

## BUG-017: Footer'da "Admin" butonu herkese görünür
- **Sayfa:** Anasayfa footer
- **Önem:** 🟢 Düşük (güvenlik notu)
- **Açıklama:** Footer'da opacity %20 ile "Admin" butonu var. Düşük opaklıkla gizlenmiş ama tıklanabilir. `/admin` rotasına yönlendiriyor.
- **Beklenen:** Production'da kaldırılmalı veya tamamen gizlenmeli.
- **Dosya:** `src/app/components/landing-page.tsx` — footer

## BUG-018: Mevzuat accordion — accessibility attribute eksik
- **Sayfa:** Anasayfa — Mevzuat bölümü
- **Önem:** 🟢 Düşük
- **Açıklama:** Accordion butonlarında `aria-expanded`, `aria-controls` ve `role="button"` attribute'ları yok. Ekran okuyucular accordion durumunu algılayamaz.
- **Dosya:** `src/app/components/landing-page.tsx` — mevzuat accordion

## A/B TEST ÖNERİLERİ (Kod değişikliği gerektirmez — tasarım kararı)

1. **CTA metin birleştirme:** Tüm CTA butonlarında tek metin kullanılması (ör: hepsi "Analize Başla") dönüşüm oranını artırabilir
2. **Hizmet kartı deep-link:** "Başvur" butonları wizard'a paket bilgisiyle yönlendirmeli (ör: `/wizard?paket=hesaplama_basvuru`)
3. **Hero'ya sosyal kanıt:** Trust badge'leri hero bölümünün içine taşımak ilk izlenimi güçlendirebilir

---

# İçerik ve Renk Testleri (4. Tur)

**Tarih:** 2026-04-09
**Test Türleri:** Color Conversion, Consistency, Tone of Voice, Proofreading, Fact-Checking, CTA Testing, Readability

## RENK PALETİ & KONTRAST

| # | Renk Çifti | Oran | WCAG AA | Not |
|---|-----------|------|---------|-----|
| 69 | Gold on Navy (#C9952B / #0B1D3A) | 6.2:1 | ✅ PASS | |
| 70 | Navy on White (#0B1D3A / #FFF) | 16.8:1 | ✅ PASS | Mükemmel |
| 71 | Grey on White (#5A6478 / #FFF) | 6.0:1 | ✅ PASS | |
| 72 | Grey on Cream (#5A6478 / #F8F7F4) | 5.6:1 | ✅ PASS | |
| 73 | Navy on Gold btn (#0B1D3A / #C9952B) | 6.2:1 | ✅ PASS | |
| 74 | Gold on White (#C9952B / #FFF) | 2.7:1 | 🐛 BUG-023 | AA FAIL |
| 75 | White on Gold btn (#FFF / #C9952B) | 2.7:1 | ⚠️ | Büyük metinde sınırda |
| 76 | Renk paleti tutarlılığı — tüm sayfada 4 ana renk | ✅ Tutarlı | | #0B1D3A, #C9952B, #5A6478, #F8F7F4 |

## PROOFREADING (İmla / Yazım)

| # | Bulgu | Sonuç | Not |
|---|-------|-------|-----|
| 77 | "Uzman **analizimle**" — birinci tekil kişi | 🐛 BUG-020 | "analizimizle" olmalı (kurumsal ton) |
| 78 | Tüm Türkçe karakterler (ç, ğ, ı, ö, ş, ü) doğru | ✅ | |
| 79 | Noktalama tutarlılığı — cümle sonları nokta ile bitiyor | ✅ | |
| 80 | Büyük/küçük harf tutarlılığı — başlıklar büyük harfle başlıyor | ✅ | |

## TONE OF VOICE (Ses Tonu)

| # | Bulgu | Sonuç | Not |
|---|-------|-------|-----|
| 81 | Hero: "boğuşmayın" — biraz agresif ama etkili | ✅ | Aciliyet duygusu yaratıyor |
| 82 | "analizimle" — tekil kişi, kurumsal değil | 🐛 BUG-020 | |
| 83 | "Neden Uzman Desteği?" — profesyonel ve soru formatı | ✅ | |
| 84 | "Para ve Zaman Kaybetmeyin" — uyarı tonu, uygun | ✅ | |
| 85 | Genel ton: formal-profesyonel, müşteriye "siz" ile hitap | ✅ Tutarlı | |

## FACT-CHECKING (Doğruluk)

| # | Bulgu | Sonuç | Not |
|---|-------|-------|-----|
| 86 | Trust badge: "300+ Müteahhit Firma" — referans listesinde 32 firma | 🐛 BUG-021 | Rakam tutarsız |
| 87 | Trust badge: "400+ Başarılı Başvuru" — doğrulanamaz | 🐛 BUG-021 | |
| 88 | Referanslar bölümü: "300'den fazla...400'den fazla" — aynı tutarsızlık | 🐛 BUG-021 | |
| 89 | "2026 Güncel Mevzuat Uyumluluğu" badge | ✅ Doğru | |
| 90 | Mevzuat yönetmelik tarihi "02.03.2019" Resmi Gazete 30702 | ✅ Doğru | |

## CONSISTENCY (Tutarlılık)

| # | Bulgu | Sonuç | Not |
|---|-------|-------|-----|
| 91 | Adım 3 "net fiyat bilgisini görün" — fiyatlar kaldırıldı | 🐛 BUG-022 | Metin güncel değil |
| 92 | İstanbul kartları "Başvur", İstanbul Dışı "Başla" | 🐛 BUG-019 | Tutarsız CTA |
| 93 | Navbar "Hemen Başla" vs Hero "Analize Başla" | ⚠️ Kasıtlı fark | A/B test önerisi |

## CTA TESTİ

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 94 | Navbar "Hemen Başla" → /wizard | ✅ Doğru | |
| 95 | Hero "Analize Başla" → /wizard (login ise /dashboard) | ✅ Doğru | |
| 96 | Hizmet kartları "Başvur" × 3 → /wizard | ✅ Doğru | Paket bilgisi iletmiyor |
| 97 | Alt CTA "Analize Başla" → /wizard | ✅ Doğru | |
| 98 | CTA metin varyasyonu: 3 farklı metin aynı hedefe | ⚠️ Tasarım kararı | Tutarlılık önerisi |

## READABILITY (Okunabilirlik)

| # | Test | Sonuç | Not |
|---|------|-------|-----|
| 99 | H1 font-size: desktop 48px, mobil 30px | ✅ Okunabilir | |
| 100 | Body text: 18px hero, 14px kartlar, 12-13px açıklama | ✅ Uygun hiyerarşi | |
| 101 | Satır uzunluğu: max-w-lg (512px) hero desc — ~65 karakter/satır | ✅ Optimal | 45-75 karakter arası ideal |
| 102 | Satır yüksekliği: leading-tight (1.25) H1, relaxed (1.6) body | ✅ | |

## YENİ BUGLAR

## BUG-019: İstanbul Dışı kart butonu tutarsız
- **Önem:** 🟢 Düşük
- **Açıklama:** İstanbul kartları "Başvur", İstanbul Dışı kartı "Başla" yazıyor.
- **Dosya:** `landing-page.tsx` — İstanbul Dışı kart buton metni

## BUG-020: Hero "analizimle" — tekil kişi
- **Önem:** 🟡 Orta
- **Açıklama:** "Uzman analizimle" birinci tekil kişi, kurumsal ton için "analizimizle" olmalı.
- **Dosya:** `landing-page.tsx` satır 172

## BUG-021: Trust badge rakamları doğrulanamaz
- **Önem:** 🟡 Orta
- **Açıklama:** "300+ Müteahhit Firma" ve "400+ Başarılı Başvuru" — referans listesinde 32 firma var. Rakamlar gerçeği yansıtmıyorsa tüketici mevzuatı ihlali riski.
- **Dosya:** `landing-page.tsx` satır 47-48, 391

## BUG-022: "Nasıl Çalışır" fiyat referansı güncel değil
- **Önem:** 🟢 Düşük
- **Açıklama:** Adım 3 "Size uygun hizmet paketini seçin, net fiyat bilgisini görün" — fiyatlar kartlardan kaldırılmış, metin güncellenmeli.
- **Dosya:** `landing-page.tsx` satır 240

## BUG-023: Gold metin beyaz bg'de kontrast yetersiz
- **Önem:** 🟢 Düşük (accessibility)
- **Açıklama:** #C9952B (gold) metni beyaz arka plan üzerinde 2.7:1 kontrast — WCAG AA normal metin (4.5:1) ve büyük metin (3:1) eşiklerini geçmiyor. "Aynı gün başvuru imkânı" ve "Popüler" badge gibi elementleri etkiliyor.
- **Dosya:** `landing-page.tsx` — gold renkli metinler

## GÜNCEL TOPLAM

- **Toplam test:** 102
- **Başarılı:** 82 (✅)
- **Bug:** 23 (🐛)
- **Düzeltilmiş:** 13 ✅
- **Açık:** 10
