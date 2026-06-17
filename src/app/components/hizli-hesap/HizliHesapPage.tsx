import { useState } from "react";
import { Stepper } from "./Stepper";
import { AdimBelgeler } from "./AdimBelgeler";
import { AdimMali } from "./AdimMali";
import { AdimIletisim } from "./AdimIletisim";
import type { Is, OturumDurumu } from "./types";

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
  const [tamamlandi, setTamamlandi] = useState(false);

  const onOde = () => {
    setTamamlandi(true);
  };

  if (tamamlandi) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white border border-[#E8E4DC] rounded-2xl p-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#047857]/10 text-[#047857] flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-[#0B1D3A] mb-2">Talebiniz alınmıştır</h2>
          <p className="text-sm text-[#5A6478] leading-relaxed">
            Analiz raporu uzmanlarımızın incelemesini takiben en geç 2 iş günü içerisinde{" "}
            <strong className="text-[#0B1D3A]">{iletisim.eposta}</strong> adresine iletilecektir. Hesabınız bu e-posta ile
            oluşturulmuştur.
          </p>
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
          <AdimIletisim
            iletisim={iletisim}
            setIletisim={setIletisim}
            onGeri={() => setAdim(1)}
            onOde={onOde}
          />
        )}
      </div>
    </div>
  );
}
