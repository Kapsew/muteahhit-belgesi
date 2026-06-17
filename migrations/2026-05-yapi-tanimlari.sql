-- ═══════════════════════════════════════════════════════════
-- YAPI TANIMLARI — kullanıcının "ne inşa ettin?" sorusunu yapı sınıfı koduna çevirir
-- Kaynak: Bakanlık Excel İş Deneyim sayfası B76:C217 (~140 tanım)
-- Kategorize edilmiş + zamanla farklı sınıfa düşebilecek tanımlar için tarih aralığı
-- ═══════════════════════════════════════════════════════════

create table if not exists yapi_tanimlari (
  id          uuid primary key default gen_random_uuid(),
  tanim       text not null,
  kategori    text not null,
  sinif_kodu  text not null,                -- "III.B" vb.
  baslangic   date,                         -- bu sınıf eşlemesinin geçerli olduğu başlangıç tarihi (null=her zaman)
  bitis       date,                         -- bitiş (null=hala geçerli)
  guncelleme  timestamptz default now()
);

create index if not exists yapi_tanim_kategori_idx on yapi_tanimlari(kategori);
create index if not exists yapi_tanim_tarih_idx on yapi_tanimlari(baslangic, bitis);
create index if not exists yapi_tanim_text_idx on yapi_tanimlari using gin(to_tsvector('turkish', tanim));

alter table yapi_tanimlari enable row level security;
create policy "yapi_tanim_read" on yapi_tanimlari for select using (true);
-- Admin write policy: kendi admin email'lerinizle düzenleyin
-- create policy "yapi_tanim_admin" on yapi_tanimlari for all using (auth.jwt() ->> 'email' in ('admin@example.com'));

-- ─── İş deneyim formuna yapı tanımı referansı ekle ───
alter table experiences
  add column if not exists yapi_tanim_id uuid references yapi_tanimlari(id),
  add column if not exists yapi_tanim_id_ruhsat uuid references yapi_tanimlari(id); -- ruhsat tarihindeki tanım

-- ═══════════════════════════════════════════════════════════
-- SEED (2026 tebliği — bugünkü sınıflar; tarih aralığı NULL=güncel)
-- ═══════════════════════════════════════════════════════════

insert into yapi_tanimlari (tanim, kategori, sinif_kodu) values
("Deniz iskeleleri", "Tarımsal / Depo / Ulaşım", "II.A"),
("Genel amaçlı depolar (betonarme, çelik ve benzeri)", "Tarımsal / Depo / Ulaşım", "II.A"),
("Hayvan bakımevi ve barınakları", "Tarımsal / Depo / Ulaşım", "II.A"),
("Hayvan satış pazar yerleri", "Tarımsal / Depo / Ulaşım", "II.A"),
("Tarımsal endüstri yapıları", "Tarımsal / Depo / Ulaşım", "II.A"),
("Botanik, jeopark ve tema park yapıları", "Spor / Kültür", "II.B"),
("Geçici kullanımı olan yapılar, konteyner kentler ve benzeri", "Diğer", "II.B"),
("Halı sahalar, semt sahaları ve benzeri", "Spor / Kültür", "II.B"),
("Hangar yapıları (helikopterler, küçük uçaklar, park ve bakım onarım yerleri ve benzeri)", "Tarımsal / Depo / Ulaşım", "II.B"),
("Kapalı pazar yerleri, semt pazarları ve benzeri", "Tarımsal / Depo / Ulaşım", "II.B"),
("Bağ/dağ/köy ve yayla evleri (kırsalda yer alan brüt inşaat alanı 200 m²'nin altındaki yapılar)", "Konut", "II.C"),
("Bungalov evleri", "Konut", "II.C"),
("Hal binaları", "Diğer", "II.C"),
("Mezbahalar", "Tarımsal / Depo / Ulaşım", "II.C"),
("Sanayi tesisleri (döşeme hareketli yükü 0-500 kg/m² olan yapılar)", "Sanayi / Endüstri", "II.C"),
("Taziye evleri", "Tarımsal / Depo / Ulaşım", "II.C"),
("Akaryakıt ve otogaz dolum istasyonları", "Sanayi / Endüstri", "III.A"),
("Aquaparklar", "Sanayi / Endüstri", "III.A"),
("Çocuk destek merkezleri, çocuk evleri koordinasyon merkezleri, çocuk evleri", "Sosyal", "III.A"),
("Garajlar, katlı ve/veya kapalı otoparklar ve benzeri", "Sanayi / Endüstri", "III.A"),
("Havalimanı destek binaları (garaj binası, itfaiye binası, nizamiye binası, ısı-güç merkez binası ve benzeri)", "Sanayi / Endüstri", "III.A"),
("İtfaiye binaları", "Güvenlik / Asayiş", "III.A"),
("Kayadan oyma konutlar", "Konut", "III.A"),
("Konutlar (apartman tipi, üç kata kadar-üç kat dâhil)", "Konut", "III.A"),
("Kreşler, okul öncesi eğitim merkezleri ve benzeri", "Sağlık ve Bakım", "III.A"),
("Köy ve mahalle konakları", "Kamu", "III.A"),
("Muhtarlık binaları", "Kamu", "III.A"),
("Özelliği olan depolar (kimyasal madde, radyoaktif atık, soğuk hava depoları ve benzeri)", "Güvenlik / Asayiş", "III.A"),
("Semt postaneleri", "Ticari / İş", "III.A"),
("Sığınma ve barınma evleri", "Kamu", "III.A"),
("Sosyal tesis yapıları (inşaat ortak alanında yapılan havuz, hamam, sauna ve benzeri)", "Sosyal", "III.A"),
("112 acil sağlık hizmetleri istasyonları", "Sağlık ve Bakım", "III.B"),
("Aile sağlığı merkezleri", "Sağlık ve Bakım", "III.B"),
("Apart oteller", "Konut", "III.B"),
("Gece kulübü ve eğlence yerleri", "Spor / Kültür", "III.B"),
("Hayvan hastaneleri", "Sağlık ve Bakım", "III.B"),
("İbadethaneler (kişi sayısı 500'ün altındaki yapılar)", "Diğer", "III.B"),
("İlçe tipi otobüs terminalleri", "Kamu", "III.B"),
("İlkokul ve ortaokul yapıları", "Eğitim", "III.B"),
("İş merkezleri (üç kata kadar-üç kat dâhil)", "Diğer", "III.B"),
("Kapalı spor salonları (seyirci sayısı 1.000'in altındaki yapılar)", "Spor / Kültür", "III.B"),
("Konukevleri, misafirhaneler ve benzeri", "Konaklama", "III.B"),
("Konutlar (yapı yüksekliği 21.50 m’nin altındaki yapılar-üç kat üzeri, yapı yüksekliği 21.50 m dâhil)", "Konut", "III.B"),
("Kütüphaneler (brüt inşaat alanı 1.000 m²'nin altındaki yapılar)", "Eğitim", "III.B"),
("Liman binaları ve marinalar", "Tarımsal / Depo / Ulaşım", "III.B"),
("Müstakil ve/veya ikiz konutlar (bağımsız bölüm brüt inşaat alanı 200 m²'nin altındaki yapılar)", "Konut", "III.B"),
("Sanayi tesisleri (döşeme hareketli yükü 501-3.000 kg/m² olan yapılar)", "Sanayi / Endüstri", "III.B"),
("Sanayi tesisleri idari binaları", "Sanayi / Endüstri", "III.B"),
("Ağız ve diş sağlığı merkezleri", "Sağlık ve Bakım", "III.C"),
("Emniyet ve jandarma karakol binaları", "Güvenlik / Asayiş", "III.C"),
("Halk eğitim merkezleri", "Eğitim", "III.C"),
("Huzurevi, rehabilitasyon ve yaşlı bakım merkezleri", "Sağlık ve Bakım", "III.C"),
("İl tipi otobüs terminalleri", "Kamu", "III.C"),
("İş merkezleri (yapı yüksekliği 21.50 m’nin altındaki yapılar-üç kat üzeri, yapı yüksekliği 21.50 m dâhil)", "Diğer", "III.C"),
("Kaplıcalar, şifa evleri, termal tesisler ve benzeri", "Konaklama", "III.C"),
("Konutlar (yapı yüksekliği 21.50 m’den fazla ve 30.50 m’den az olan yapılar-yapı yüksekliği 30.50 m dâhil)", "Konut", "III.C"),
("Lise ve dengi okul yapıları", "Eğitim", "III.C"),
("Müstakil ve/veya ikiz konutlar (bağımsız bölüm brüt inşaat alanı 200 m²'den fazla ve 500 m²'den az olan yapılar-brüt inşaat alanı 200 m² dâhil)", "Konut", "III.C"),
("Öğrenci yurtları", "Eğitim", "III.C"),
("Toplum sağlığı merkezleri", "Sağlık ve Bakım", "III.C"),
("Tren gar/istasyon binaları (brüt inşaat alanı 1.500 m²'den az olan yapılar)", "Tarımsal / Depo / Ulaşım", "III.C"),
("Açık cezaevleri", "Kamu", "IV.A"),
("Aile yaşam ve gençlik merkezleri", "Sosyal", "IV.A"),
("Alışveriş merkezleri (brüt inşaat alanı 25.000 m²'nin altındaki yapılar)", "Ticari / İş", "IV.A"),
("Araştırma ve geliştirme merkezleri, laboratuvarlar ve benzeri", "Sanayi / Endüstri", "IV.A"),
("Engelsiz yaşam merkezleri", "Sosyal", "IV.A"),
("Enstitüler, fakülteler ve yüksekokullar", "Eğitim", "IV.A"),
("Fuar merkezleri", "Ticari / İş", "IV.A"),
("İlçe tipi kamu binaları", "Kamu", "IV.A"),
("İş merkezleri (yapı yüksekliği 21.50 m’den fazla ve 30.50 m’den az olan yapılar-yapı yüksekliği 30.50 m dâhil)", "Diğer", "IV.A"),
("Kapalı spor salonları (seyirci sayısı 1.000'den fazla ve 5.000'den az olan yapılar-seyirci sayısı 1.000 dâhil)", "Spor / Kültür", "IV.A"),
("Kayadan oyma oteller", "Konaklama", "IV.A"),
("Konutlar (yapı yüksekliği 30.50 m’den fazla ve 51.50 m’den az olan yapılar-yapı yüksekliği 51.50 m dâhil)", "Konut", "IV.A"),
("Mesleki eğitim merkezleri", "Eğitim", "IV.A"),
("Oteller (1 ve 2 yıldızlı)", "Konaklama", "IV.A"),
("Özel eğitim okulları", "Eğitim", "IV.A"),
("Rehberlik ve araştırma merkezleri", "Diğer", "IV.A"),
("Sanayi tesisleri (döşeme hareketli yükü 3.001 kg/m² ve üzeri olan yapılar)", "Sanayi / Endüstri", "IV.A"),
("Tıp merkezleri", "Sağlık ve Bakım", "IV.A"),
("Yüzme havuzu tesisleri", "Spor / Kültür", "IV.A"),
("Arşiv binaları", "Ticari / İş", "IV.B"),
("Banka ve borsa binaları", "Ticari / İş", "IV.B"),
("Büyük (merkez) postaneler", "Ticari / İş", "IV.B"),
("Düğün salonları", "Spor / Kültür", "IV.B"),
("Fizik tedavi ve rehabilitasyon merkezleri", "Sağlık ve Bakım", "IV.B"),
("İbadethaneler (kişi sayısı 500'den fazla ve 1.500'den az olan yapılar - kişi sayısı 500 dâhil)", "Diğer", "IV.B"),
("İş merkezleri (yapı yüksekliği 30.50 m’den fazla ve 51.50 m’den az olan yapılar - yapı yüksekliği 51.50 m dâhil)", "Diğer", "IV.B"),
("Kapalı spor salonları (seyirci sayısı 5.000 ve üzeri yapılar)", "Spor / Kültür", "IV.B"),
("Konutlar (yapı yüksekliği 51,50 m üzeri yapılar)", "Konut", "IV.B"),
("Müstakil ve/veya ikiz konutlar (bağımsız bölüm brüt inşaat alanı 500 m² ve üzeri yapılar)", "Konut", "IV.B"),
("Özelliği olan büyük okul yapıları (spor salonu, konferans salonu ve ek tesisleri olan eğitim yapıları)", "Eğitim", "IV.B"),
("Özelliği olan genel sığınaklar", "Güvenlik / Asayiş", "IV.B"),
("Radyo ve televizyon istasyon binaları", "Güvenlik / Asayiş", "IV.B"),
("Üniversite idari binaları", "Eğitim", "IV.B"),
("Adalet sarayları", "Kamu", "IV.C"),
("Alışveriş merkezleri (brüt inşaat alanı 25.000 m² ve üzeri yapılar)", "Ticari / İş", "IV.C"),
("Bakanlık binaları", "Kamu", "IV.C"),
("Büyükşehir belediye hizmet binaları", "Kamu", "IV.C"),
("Geri gönderme merkezleri", "Kamu", "IV.C"),
("Hastaneler (yatak sayısı 200'ün altındaki yapılar)", "Sağlık ve Bakım", "IV.C"),
("İl tipi kamu binaları", "Kamu", "IV.C"),
("Kapalı cezaevleri", "Kamu", "IV.C"),
("Kaymakamlık ve vali konutları", "Konut", "IV.C"),
("Kütüphaneler (brüt inşaat alanı 1.000 m² ve üzeri yapılar)", "Eğitim", "IV.C"),
("Olimpik spor tesisleri", "Spor / Kültür", "IV.C"),
("Oteller (3 yıldızlı)", "Konaklama", "IV.C"),
("Tatil köyleri", "Konaklama", "IV.C"),
("Tren gar/istasyon binaları (brüt inşaat alanı 1.500 m²'den fazla olan yapılar)", "Tarımsal / Depo / Ulaşım", "IV.C"),
("Büyükelçilik, diplomatik temsilcilik ve konsolosluk binaları", "Kamu", "V.A"),
("Eğitim ve araştırma hastaneleri", "Sağlık ve Bakım", "V.A"),
("İş merkezleri (yapı yüksekliği 51,50 m üzeri yapılar)", "Diğer", "V.A"),
("Karma kullanımlı yapılar (avm, ofis ve/veya konutların birlikte bulunduğu yapılar)", "Konut", "V.A"),
("Stadyumlar ve hipodromlar", "Spor / Kültür", "V.A"),
("Üniversite kampüsleri", "Eğitim", "V.A"),
("Deniz, hava ve kara kuvvetleri komutanlığı tesisleri", "Güvenlik / Asayiş", "V.B"),
("Hastaneler (yatak sayısı 200'den fazla ve 400'den az olan yapılar-yatak sayısı 200 dâhil)", "Sağlık ve Bakım", "V.B"),
("İbadethaneler (kişi sayısı 1.500 ve üzeri yapılar)", "Diğer", "V.B"),
("Jandarma ve sahil güvenlik komutanlığı tesisleri", "Güvenlik / Asayiş", "V.B"),
("Oteller (4 yıldızlı)", "Konaklama", "V.B"),
("Bale, opera ve tiyatro yapıları", "Spor / Kültür", "V.C"),
("Hastaneler (yatak sayısı 400 ve üzeri yapılar-yatak sayısı 400 dâhil)", "Sağlık ve Bakım", "V.C"),
("Kongre ve kültür merkezleri", "Spor / Kültür", "V.C"),
("Müze yapıları", "Spor / Kültür", "V.C"),
("Tarihi eser niteliğinde olup restore edilerek veya yıkılarak aslına uygun olarak yapılan yapılar", "Sosyal", "V.C"),
("Havalimanı terminal binaları (idari binalar, yolcu terminal binası ve benzeri)", "Güvenlik / Asayiş", "V.D"),
("Metro istasyonları", "Tarımsal / Depo / Ulaşım", "V.D"),
("Oteller (5 yıldızlı)", "Konaklama", "V.D"),
("Şehir hastaneleri", "Sağlık ve Bakım", "V.D"),
("Yüksek güvenlikli cezaevleri", "Kamu", "V.D");
