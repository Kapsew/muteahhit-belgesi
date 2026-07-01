// ====================================================================
// AdimRapor.tsx
// Hesaplama sonucunu gösterir. Ödeme yapılmadıysa GÜVENLİ paywall:
// gerçek detay verisi DOM'a HİÇ render edilmez — yerine kilitli
// önizleme (placeholder) gösterilir. Ödeme sonrası gerçek rapor açılır.
// (Not: tam güvenlik için motor backend'e taşınmalı — sonraki aşama.)
// ====================================================================

import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, CheckCircle2, FileText, TrendingUp, AlertCircle, ShieldCheck, Eye, LayoutDashboard, Home, ArrowRight } from "lucide-react";
import type { TamHesaplama, HesaplananIs } from "../hesaplama-motor";
import { testOdemeTamamla } from "./kayit";
import { FIYAT, KDV_KISA } from "./fiyat";

interface Props {
  hesap: TamHesaplama;
  companyId: string;
  firmaUnvani: string;
}

function tl(n: number): string {
  return (n || 0).toLocaleString("tr-TR") + " ₺";
}

export function AdimRapor({ hesap, companyId, firmaUnvani }: Props) {
  const navigate = useNavigate();
  const [odendi, setOdendi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const odemeYap = async () => {
    setHata(null);
    setYukleniyor(true);
    try {
      await testOdemeTamamla(companyId);
      setOdendi(true);
    } catch (e: any) {
      setHata(e.message || "Ödeme sırasında hata oluştu");
    } finally {
      setYukleniyor(false);
    }
  };

  const isSayisi = hesap.isler?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Sonuç başlığı — her zaman görünür */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#C9952B]/10 text-[#C9952B] flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="text-[#C9952B] text-[11px] tracking-[0.1em] uppercase mb-1.5">Analiz sonucu</div>
        <h2 className="text-[#0B1D3A] text-2xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>Analiziniz hazır</h2>
        <p className="text-sm text-[#5A6478] mt-1">{firmaUnvani}</p>
        <div className="mt-4 inline-block px-8 py-4 rounded-xl bg-[#0B1D3A] text-white">
          <span className="text-xs opacity-70 block mb-0.5">Hesaplanan yetki grubu</span>
          {odendi ? (
            <span className="text-4xl font-bold text-[#C9952B]">{hesap.tercihEdilenGrup}</span>
          ) : (
            <span className="text-4xl font-bold text-[#C9952B] inline-flex items-center gap-2">
              <Lock className="w-6 h-6" /> ●
            </span>
          )}
        </div>
        {odendi ? (
          <p className="text-xs text-[#5A6478] mt-3">
            Tercih edilen yöntem:{" "}
            <strong>{hesap.tercihEdilenYontem === "son5" ? "Son 5 Yıl" : "Son 15 Yıl"}</strong> —
            Toplam: <strong>{tl(hesap.tercihEdilenToplam)}</strong>
          </p>
        ) : (
          <p className="text-sm text-[#5A6478] mt-3 max-w-sm mx-auto">
            <strong>{isSayisi} iş</strong> başarıyla analiz edildi. Yetki grubunuzu ve tüm
            detayları görüntülemek için raporunuzu açın.
          </p>
        )}
      </div>

      {odendi ? (
        // ── Ödeme sonrası: gerçek rapor ──
        <>
          <DetayIcerik hesap={hesap} />
          <div className="bg-[#FAF6EE] border border-[#C9952B]/25 rounded-xl p-4 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#C9952B] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#0B1D3A]">
              Ödemeniz alındı. Raporunuza panelinizden de erişebilirsiniz. Uzman incelemesi
              sonrası onaylı PDF rapor en geç 2 iş günü içinde iletilecektir.
            </p>
          </div>

          {/* Yönlendirme — kullanıcı sayfada sıkışmasın */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-4 py-3 bg-[#0B1D3A] hover:bg-[#122A54] text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Panelime Git <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-3 border border-[#E8E4DC] hover:bg-gray-50 text-[#0B1D3A] text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" /> Ana Sayfa
            </button>
          </div>
        </>
      ) : (
        // ── Ödeme öncesi: GÜVENLİ paywall (gerçek veri render edilmez) ──
        <PaywallKart
          isSayisi={isSayisi}
          onOde={odemeYap}
          yukleniyor={yukleniyor}
          hata={hata}
        />
      )}
    </div>
  );
}

// ── Paywall kartı: değer önerisi + kilitli önizleme + ödeme ──
function PaywallKart({
  isSayisi, onOde, yukleniyor, hata,
}: { isSayisi: number; onOde: () => void; yukleniyor: boolean; hata: string | null }) {
  const raporIcerigi = [
    { icon: TrendingUp, baslik: "Yöntem karşılaştırması", aciklama: "Son 5 yıl ve son 15 yıl yöntemleri ayrı ayrı hesaplanır, sizin için en avantajlısı belirlenir." },
    { icon: FileText, baslik: "İş bazlı tutar dökümü", aciklama: `${isSayisi} işinizin her biri için belge tutarı ve güncel değer ayrı ayrı listelenir.` },
    { icon: AlertCircle, baslik: "Üst gruba yükselme analizi", aciklama: "Bir üst yetki grubuna geçmek için gereken eksik tutar ve mali yeterlilik durumu." },
  ];

  return (
    <div className="grid md:grid-cols-5 gap-4">
      {/* Sol: raporda neler var */}
      <div className="md:col-span-3 bg-white border border-[#E8E4DC] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#0B1D3A] flex items-center gap-1.5 mb-4">
          <Eye className="w-4 h-4 text-[#C9952B]" /> Raporunuzda neler var?
        </h3>
        <div className="space-y-4">
          {raporIcerigi.map((r, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0B1D3A]/5 flex items-center justify-center shrink-0">
                <r.icon className="w-4 h-4 text-[#0B1D3A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0B1D3A]">{r.baslik}</p>
                <p className="text-xs text-[#5A6478] mt-0.5 leading-relaxed">{r.aciklama}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Kilitli önizleme — SAHTE/placeholder, gerçek veri değil */}
        <div className="mt-5 relative rounded-xl border border-[#E8E4DC] overflow-hidden">
          <div className="p-4 space-y-2.5 select-none" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 bg-[#E8E4DC] rounded" style={{ width: `${90 - i * 12}px` }} />
                <div className="h-3 bg-[#E8E4DC] rounded" style={{ width: `${70 - i * 8}px` }} />
                <div className="h-3 bg-[#C9952B]/30 rounded" style={{ width: "60px" }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 backdrop-blur-[3px] bg-white/30 flex items-center justify-center">
            <span className="text-xs text-[#5A6478] flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5" /> Ödeme sonrası açılır
            </span>
          </div>
        </div>
      </div>

      {/* Sağ: ödeme kartı */}
      <div className="md:col-span-2">
        <div className="bg-[#0B1D3A] text-white rounded-2xl p-6 sticky top-4">
          <p className="text-xs text-white/60">Yeterlilik Analiz Raporu</p>
          <div className="flex items-baseline gap-1.5 mt-1 mb-1">
            <span className="text-3xl font-bold text-[#C9952B]">{FIYAT}</span>
          </div>
          <p className="text-[11px] text-white/50 mb-5">{KDV_KISA} · Tek seferlik</p>

          <ul className="space-y-2.5 mb-5">
            {["Tam yeterlilik raporu", "İş bazlı tutar dökümü", "Uzman kontrollü onaylı PDF", "Panelden sınırsız erişim"].map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#C9952B] shrink-0" /> {m}
              </li>
            ))}
          </ul>

          {hata && <p className="text-[11px] text-red-300 mb-2">{hata}</p>}
          <button
            onClick={onOde}
            disabled={yukleniyor}
            className="w-full px-4 py-3 bg-[#C9952B] hover:bg-[#B8862A] disabled:opacity-50 text-[#0B1D3A] text-sm font-semibold rounded-xl transition-colors"
          >
            {yukleniyor ? "İşleniyor…" : "Ödemeyi tamamla & raporu aç"}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-white/50">
            <ShieldCheck className="w-3.5 h-3.5" /> Güvenli ödeme
          </div>
          <p className="text-[10px] text-white/30 text-center mt-2">
            * Test ödemesidir, gerçek tahsilat yapılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Gerçek rapor içeriği — yalnızca ödeme sonrası render edilir ──
function DetayIcerik({ hesap }: { hesap: TamHesaplama }) {
  return (
    <div className="space-y-4">
      {/* Yöntem karşılaştırması */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#0B1D3A] flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-[#C9952B]" /> Yöntem Karşılaştırması
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${hesap.tercihEdilenYontem === "son5" ? "border-[#0B1D3A] bg-[#0B1D3A]/5" : "border-[#E8E4DC]"}`}>
            <p className="text-xs text-[#5A6478]">Son 5 Yıl (Y1)</p>
            <p className="text-lg font-semibold text-[#0B1D3A]">{hesap.y1.grup}</p>
            <p className="text-xs text-[#5A6478] mt-1">Net: {tl(hesap.y1.toplamNet)}</p>
            <p className="text-[11px] text-gray-400">Brüt: {tl(hesap.y1.toplamBrut)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${hesap.tercihEdilenYontem === "son15" ? "border-[#0B1D3A] bg-[#0B1D3A]/5" : "border-[#E8E4DC]"}`}>
            <p className="text-xs text-[#5A6478]">Son 15 Yıl (Y2)</p>
            <p className="text-lg font-semibold text-[#0B1D3A]">{hesap.y2.grup}</p>
            <p className="text-xs text-[#5A6478] mt-1">Toplam: {tl(hesap.y2.toplam)}</p>
            <p className="text-[11px] text-gray-400">En büyük: {tl(hesap.y2.enBuyukTutar)}</p>
          </div>
        </div>
      </div>

      {/* İş bazlı detay tablosu */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[#0B1D3A] flex items-center gap-1.5 mb-3">
          <FileText className="w-4 h-4 text-[#C9952B]" /> İş Bazlı Tutarlar
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[#5A6478] border-b border-[#E8E4DC]">
                <th className="py-2 pr-2">Sözleşme</th>
                <th className="py-2 pr-2">Sınıf</th>
                <th className="py-2 pr-2">Alan m²</th>
                <th className="py-2 pr-2">Kat / Yük.</th>
                <th className="py-2 pr-2 text-right">Belge Tutarı</th>
                <th className="py-2 text-right">Güncel Değer</th>
              </tr>
            </thead>
            <tbody>
              {hesap.isler.map((is: HesaplananIs, i: number) => (
                <tr key={is.id || i} className="border-b border-[#F0EDE6]">
                  <td className="py-2 pr-2">{is.sozlesmeTarihi}</td>
                  <td className="py-2 pr-2">{is.ruhsatSinifi}</td>
                  <td className="py-2 pr-2">{is.insaatAlaniM2?.toLocaleString("tr-TR")}</td>
                  <td className="py-2 pr-2 text-[#5A6478]">
                    {is.katSayisiToplam != null ? `${is.katSayisiToplam} kat` : "—"}
                    {is.yapiYuksekligiM != null ? ` · ${is.yapiYuksekligiM} m` : ""}
                  </td>
                  <td className="py-2 pr-2 text-right">{tl(is.sonuc.belgeTutari)}</td>
                  <td className="py-2 text-right font-medium text-[#0B1D3A]">{tl(is.sonuc.guncelTutar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Üst gruba yükselme + mali yeterlilik */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#0B1D3A] flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-[#C9952B]" /> Ek Bilgiler
        </h3>
        {hesap.birUstGrup && (
          <p className="text-xs text-[#5A6478]">
            Bir üst grup (<strong>{hesap.birUstGrup.grup}</strong>) için gereken minimum:{" "}
            <strong>{tl(hesap.birUstGrup.min)}</strong>. Eksik tutar:{" "}
            <strong className="text-[#C9952B]">{tl(hesap.eksikTutar)}</strong>
          </p>
        )}
        {hesap.bankaRefTutari != null && (
          <p className="text-xs text-[#5A6478]">
            Banka referans tutarı: <strong>{tl(hesap.bankaRefTutari)}</strong>
          </p>
        )}
        <p className="text-xs text-[#5A6478]">
          Mali yeterlilik:{" "}
          <strong>{hesap.maliYeterlilikGerekli ? "Gerekli" : "Gerekli değil"}</strong>
        </p>
        {hesap.diploma && (
          <p className="text-xs text-[#5A6478]">
            Diploma katkısı: <strong>{hesap.diploma.grup}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
