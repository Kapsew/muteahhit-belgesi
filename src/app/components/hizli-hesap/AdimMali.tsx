import { useRef, useState, type DragEvent } from "react";
import { FileUp, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  dosya: File | null;
  setDosya: (f: File | null) => void;
  onGeri: () => void;
  onIleri: () => void;
}

export function AdimMali({ dosya, setDosya, onGeri, onIleri }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setDosya(f);
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6">
      <div className="text-[#C9952B] text-[11px] tracking-[0.1em] uppercase mb-2">Adım 2 · Opsiyonel</div>
      <h2 className="text-[#0B1D3A] text-xl mb-1.5" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>Mali yeterlilik</h2>
      <p className="text-sm text-[#5A6478] mb-4 leading-relaxed">
        <strong className="font-medium text-[#0B1D3A]">F1 ve üzeri gruplar</strong> için mali yeterlilik koşulu aranmaktadır.
        2025 yılına ait kurumlar vergisi beyannamesinin yüklenmesi halinde mali yeterlilik incelemesi analiz raporuna
        dahil edilir; söz konusu inceleme rapor ücretine dahildir.
      </p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`block border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors ${
          dragOver ? "border-[#0B1D3A] bg-[#F4F6FA]" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <FileUp className="w-8 h-8 mx-auto text-[#5A6478]" />
        <p className="mt-2.5 text-sm font-medium text-[#0B1D3A]">Kurumlar vergisi beyannamesi (PDF)</p>
        <p className="mt-1 text-xs text-[#5A6478]">
          {dosya ? `Yüklendi: ${dosya.name}` : "veya bilgisayarınızdan seçiniz"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setDosya(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-[#5A6478] leading-relaxed">
        F1 altı bir grup hedefleniyor ise bu adım atlanabilir. 2025 yılı verilerinin yetersiz görülmesi halinde önceki
        yıllara ait bilanço belgeleri için tarafınızla iletişime geçilecektir.
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onGeri}
          className="px-4 py-2.5 text-sm border border-[#E8E4DC] rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={onIleri}
            className="px-4 py-2.5 text-sm text-[#5A6478] hover:text-[#0B1D3A]"
          >
            Atla
          </button>
          <button
            onClick={onIleri}
            className="px-5 py-2.5 bg-[#C9952B] hover:bg-[#B8862A] text-[#0B1D3A] text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            Devam et <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
