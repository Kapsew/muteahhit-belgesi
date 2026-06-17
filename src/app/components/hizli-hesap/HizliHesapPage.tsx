import { useState } from "react";
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

  if (hesap && kayit) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <AdimRapor hesap={hesap} companyId={kayit.companyId} firmaUnvani={iletisim.firmaUnvani} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
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
