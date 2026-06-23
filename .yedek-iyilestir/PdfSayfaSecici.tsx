// ====================================================================
// PdfSayfaSecici.tsx
// Çok sayfalı PDF yüklendiğinde, kullanıcının iskan sayfasını
// seçmesi için sayfaları thumbnail olarak gösterir.
// Seçilen sayfa yüksek çözünürlüklü PNG File olarak döndürülür
// (tek sayfa = ucuz + hızlı + doğru OCR).
// ====================================================================

import { useEffect, useRef, useState } from "react";
import { Loader2, Check, X, FileText } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
// Vite: worker'ı modül olarak yükle
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

interface Props {
  dosya: File;
  onSec: (sayfaPng: File, sayfaNo: number) => void;
  onIptal: () => void;
}

interface SayfaOnizleme {
  no: number;
  dataUrl: string;
}

// PDF sayfasını canvas'a render edip dataURL döndürür
async function sayfaRender(
  pdf: any,
  sayfaNo: number,
  olcek: number
): Promise<{ dataUrl: string; canvas: HTMLCanvasElement }> {
  const page = await pdf.getPage(sayfaNo);
  const viewport = page.getViewport({ scale: olcek });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { dataUrl: canvas.toDataURL("image/png"), canvas };
}

export function PdfSayfaSecici({ dosya, onSec, onIptal }: Props) {
  const [onizlemeler, setOnizlemeler] = useState<SayfaOnizleme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [seciliNo, setSeciliNo] = useState<number | null>(null);
  const [hazirlaniyor, setHazirlaniyor] = useState(false);
  const pdfRef = useRef<any>(null);

  // PDF'i yükle + tüm sayfaların küçük önizlemesini üret
  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        setYukleniyor(true);
        const buf = await dosya.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        if (iptal) return;
        pdfRef.current = pdf;

        const sayfalar: SayfaOnizleme[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          if (iptal) return;
          // Küçük önizleme: düşük ölçek (hızlı)
          const { dataUrl } = await sayfaRender(pdf, i, 0.5);
          sayfalar.push({ no: i, dataUrl });
          // Aşamalı göster (kullanıcı beklemesin)
          if (!iptal) setOnizlemeler([...sayfalar]);
        }
      } catch (e: any) {
        if (!iptal) setHata("PDF okunamadı. Dosya bozuk olabilir veya şifreli olabilir.");
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    })();
    return () => { iptal = true; };
  }, [dosya]);

  // Seçilen sayfayı YÜKSEK çözünürlüklü PNG File olarak hazırla ve gönder
  const onayla = async () => {
    if (seciliNo == null || !pdfRef.current) return;
    setHazirlaniyor(true);
    try {
      // Yüksek ölçek: OCR doğruluğu için net görüntü
      const { canvas } = await sayfaRender(pdfRef.current, seciliNo, 2.0);
      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b!), "image/png", 0.95)
      );
      const ad = dosya.name.replace(/\.pdf$/i, "") + `_sayfa${seciliNo}.png`;
      const pngFile = new File([blob], ad, { type: "image/png" });
      onSec(pngFile, seciliNo);
    } catch (e) {
      setHata("Seçilen sayfa hazırlanamadı. Tekrar deneyiniz.");
      setHazirlaniyor(false);
    }
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-sm font-medium text-[#0B1D3A] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#C9952B]" /> İskan sayfasını seçiniz
          </h3>
          <p className="text-xs text-[#5A6478] mt-1 leading-relaxed max-w-lg">
            Yüklediğiniz belge birden fazla sayfa içeriyor. Lütfen{" "}
            <strong className="font-medium">yapı kullanma izin belgesinin (iskan)</strong>{" "}
            bulunduğu sayfayı seçiniz. Yalnızca seçtiğiniz sayfa işlenecektir.
          </p>
        </div>
        <button
          onClick={onIptal}
          className="text-gray-400 hover:text-[#0B1D3A] transition-colors p-1 shrink-0"
          title="Vazgeç, başka belge yükle"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {hata && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
          {hata}
        </div>
      )}

      {yukleniyor && onizlemeler.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#5A6478]">
          <Loader2 className="w-4 h-4 animate-spin" /> Sayfalar hazırlanıyor…
        </div>
      )}

      {onizlemeler.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {onizlemeler.map((s) => {
              const secili = seciliNo === s.no;
              return (
                <button
                  key={s.no}
                  onClick={() => setSeciliNo(s.no)}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                    secili
                      ? "border-[#C9952B] ring-2 ring-[#C9952B]/20"
                      : "border-[#E8E4DC] hover:border-[#C9952B]/50"
                  }`}
                >
                  <img
                    src={s.dataUrl}
                    alt={`Sayfa ${s.no}`}
                    className="w-full h-auto block bg-white"
                  />
                  <div
                    className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      secili ? "bg-[#C9952B] text-white" : "bg-black/50 text-white"
                    }`}
                  >
                    Sayfa {s.no}
                  </div>
                  {secili && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C9952B] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {yukleniyor && (
            <p className="text-[11px] text-[#5A6478] mt-3 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Kalan sayfalar yükleniyor…
            </p>
          )}

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E8E4DC]">
            <p className="text-xs text-[#5A6478]">
              {seciliNo != null ? `Sayfa ${seciliNo} seçildi` : "Bir sayfa seçiniz"}
            </p>
            <button
              onClick={onayla}
              disabled={seciliNo == null || hazirlaniyor}
              className="px-5 py-2.5 bg-[#C9952B] hover:bg-[#B8862A] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B1D3A] text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {hazirlaniyor ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Hazırlanıyor…</>
              ) : (
                <><Check className="w-4 h-4" /> Bu sayfayı kullan</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
