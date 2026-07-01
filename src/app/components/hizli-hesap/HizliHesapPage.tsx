import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { supabase } from "../supabase-client";
import { CheckCircle2, Building2, FileText } from "lucide-react";
import { Award, LayoutDashboard } from "lucide-react";
import { Stepper } from "./Stepper";
import { AdimBelgeler } from "./AdimBelgeler";
import { AdimIletisim } from "./AdimIletisim";
import { AdimRapor } from "./AdimRapor";
import { hesaplaIsler } from "./hesapla-adapter";
import { kayitYap, type KayitSonucu } from "./kayit";
import type { Is, OturumDurumu } from "./types";
import type { TamHesaplama } from "../hesaplama-motor";

const BOS_ILETISIM: OturumDurumu["iletisim"] = {
  firmaUnvani: "",
  yetkili: "",
  vergiNo: "",
  eposta: "",
  telefon: "",
  sifre: "",
  sifreTekrar: "",
  kvkkOnay: false,
};

export function HizliHesapPage() {
  const navigate = useNavigate();
  const loc = useLocation();
  const isUpgrade = (loc.state as any)?.isUpgrade === true;
  const upgradeId = (loc.state as any)?.companyId as string | undefined;
  const [adim, setAdim] = useState<0 | 1>(0);
  const [isler, setIsler] = useState<Is[]>([]);
  const [iletisim, setIletisim] = useState(BOS_ILETISIM);

  const [hesap, setHesap] = useState<TamHesaplama | null>(null);
  const [kayit, setKayit] = useState<KayitSonucu | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Upgrade modu: mevcut firma bilgilerini çek (prefill + onay ekranı için)
  useEffect(() => {
    if (upgradeId) {
      supabase.from("companies").select("company_name, tax_id, phone, email").eq("id", upgradeId).single()
        .then(({ data: c }) => {
          if (c) {
            setIletisim((prev) => ({
              ...prev,
              firmaUnvani: c.company_name || "",
              vergiNo: c.tax_id || "",
              telefon: c.phone || "",
              eposta: c.email || "",
            }));
          }
        });
    }
  }, [upgradeId]);

  const onOde = async () => {
    setHata(null);
    setGonderiliyor(true);
    try {
      const sonuc = hesaplaIsler(isler);
      const kayitSonucu = await kayitYap(iletisim, isler, sonuc, null, upgradeId);
      setHesap(sonuc);
      setKayit(kayitSonucu);
    } catch (e: any) {
      setHata(e.message || "İşlem sırasında bir hata oluştu");
    } finally {
      setGonderiliyor(false);
    }
  };

  const UstBar = () => (
    <div className="border-b border-[#E8E4DC] bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-[#0B1D3A] hover:opacity-80 transition-opacity">
          <Award className="w-5 h-5 text-[#C9952B]" />
          <span className="font-medium text-sm">müteahhitlikbelgesi<span className="text-[#C9952B]">.com</span></span>
        </button>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-[#5A6478] hover:text-[#0B1D3A] transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Panelim
        </button>
      </div>
    </div>
  );

  if (hesap && kayit) {
    return (
      <div className="min-h-screen">
        <UstBar />
        <div className="py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <AdimRapor hesap={hesap} companyId={kayit.companyId} firmaUnvani={iletisim.firmaUnvani} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <UstBar />
      <div className={`${adim === 0 ? "max-w-5xl" : "max-w-3xl"} mx-auto py-8 px-4 transition-[max-width] duration-200`}>
        <header className="mb-6">
          <div className="text-[#C9952B] text-[11px] tracking-[0.1em] uppercase mb-2.5">
            {isUpgrade ? "Belge güncelleme" : "Yeterlilik analizi"}
          </div>
          <h1 className="text-[#0B1D3A] text-2xl md:text-3xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            {isUpgrade ? "Yeni iş deneyimi ekle" : "Müteahhitlik yeterlilik analizi"}
          </h1>
          <p className="text-sm text-[#5A6478] mt-2 max-w-2xl leading-relaxed">
            {isUpgrade
              ? "Yeni iş deneyiminizi ekleyin; belgeniz güncel verilerle yeniden hesaplansın."
              : "İskan belgelerinizi yükleyin, doğru grup tespitini uzmanlarımız hazırlasın."}
          </p>
        </header>

        <Stepper aktif={adim} sonAdimEtiketi={isUpgrade ? "Onay ve ödeme" : undefined} />

        {adim === 0 && <AdimBelgeler isler={isler} setIsler={setIsler} onIleri={() => setAdim(1)} mevcutCompanyId={upgradeId} />}
        {adim === 1 && (
          <>
            {hata && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {hata}
              </div>
            )}
            {isUpgrade ? (
              <OnayEkrani
                firmaUnvani={iletisim.firmaUnvani}
                isSayisi={isler.length}
                onGeri={() => setAdim(0)}
                onOde={onOde}
                gonderiliyor={gonderiliyor}
              />
            ) : (
              <AdimIletisim
                iletisim={iletisim}
                setIletisim={setIletisim}
                onGeri={() => setAdim(0)}
                onOde={onOde}
                gonderiliyor={gonderiliyor}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Upgrade onay ekranı: firma prefill + iş özeti + ödemeye geç ──
function OnayEkrani({
  firmaUnvani, isSayisi, onGeri, onOde, gonderiliyor,
}: {
  firmaUnvani: string; isSayisi: number;
  onGeri: () => void; onOde: () => void; gonderiliyor: boolean;
}) {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6">
      <div className="text-[#C9952B] text-[11px] tracking-[0.1em] uppercase mb-2">Son adım</div>
      <h2 className="text-[#0B1D3A] text-xl mb-1.5" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>Bilgileri onaylayın</h2>
      <p className="text-sm text-[#5A6478] mb-5">
        Yeni iş deneyiminiz mevcut firmanıza eklenecek ve belgeniz yeniden hesaplanacaktır.
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F0EDE8]">
          <div className="w-9 h-9 rounded-lg bg-[#0B1D3A]/5 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-[#0B1D3A]" />
          </div>
          <div>
            <p className="text-xs text-[#5A6478]">Firma</p>
            <p className="text-sm font-medium text-[#0B1D3A]">{firmaUnvani || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F0EDE8]">
          <div className="w-9 h-9 rounded-lg bg-[#0B1D3A]/5 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#0B1D3A]" />
          </div>
          <div>
            <p className="text-xs text-[#5A6478]">Eklenecek iş deneyimi</p>
            <p className="text-sm font-medium text-[#0B1D3A]">{isSayisi} iş</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onGeri}
          className="px-5 py-3 border border-[#E8E4DC] hover:bg-gray-50 text-[#0B1D3A] text-sm font-medium rounded-xl transition-colors"
        >
          Geri
        </button>
        <button
          onClick={onOde}
          disabled={gonderiliyor}
          className="flex-1 px-5 py-3 bg-[#C9952B] hover:bg-[#B8862A] disabled:opacity-50 text-[#0B1D3A] text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {gonderiliyor ? "İşleniyor…" : (<><CheckCircle2 className="w-4 h-4" /> Onayla ve ödemeye geç</>)}
        </button>
      </div>
    </div>
  );
}