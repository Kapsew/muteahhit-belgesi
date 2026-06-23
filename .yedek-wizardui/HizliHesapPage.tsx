import { useState } from "react";
import { useNavigate } from "react-router";
import { Award, LayoutDashboard } from "lucide-react";
import { Stepper } from "./Stepper";
import { AdimBelgeler } from "./AdimBelgeler";
import { AdimMali } from "./AdimMali";
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
  const [adim, setAdim] = useState<0 | 1 | 2>(0);
  const [isler, setIsler] = useState<Is[]>([]);
  const [maliBeyanname, setMaliBeyanname] = useState<File | null>(null);
  const [iletisim, setIletisim] = useState(BOS_ILETISIM);

  const [hesap, setHesap] = useState<TamHesaplama | null>(null);
  const [kayit, setKayit] = useState<KayitSonucu | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const onOde = async () => {
    setHata(null);
    setGonderiliyor(true);
    try {
      const sonuc = hesaplaIsler(isler);
      const kayitSonucu = await kayitYap(iletisim, isler, sonuc, maliBeyanname);
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
      <div className="max-w-3xl mx-auto py-8 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-medium text-[#0B1D3A]">Müteahhitlik yeterlilik analizi</h1>
          <p className="text-sm text-[#5A6478] mt-1">
            İskan belgelerinizi yükleyin, doğru grup tespitini uzmanlarımız hazırlasın.
          </p>
        </header>

        <Stepper aktif={adim} />

        {adim === 0 && <AdimBelgeler isler={isler} setIsler={setIsler} onIleri={() => setAdim(1)} />}
        {adim === 1 && (
          <AdimMali
            dosya={maliBeyanname}
            setDosya={setMaliBeyanname}
            onGeri={() => setAdim(0)}
            onIleri={() => setAdim(2)}
          />
        )}
        {adim === 2 && (
          <>
            {hata && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {hata}
              </div>
            )}
            <AdimIletisim
              iletisim={iletisim}
              setIletisim={setIletisim}
              onGeri={() => setAdim(1)}
              onOde={onOde}
              gonderiliyor={gonderiliyor}
            />
          </>
        )}
      </div>
    </div>
  );
}
