import { Check } from "lucide-react";

const ADIMLAR = ["Belgeler ve teyit", "İletişim ve ödeme"];

export function Stepper({ aktif, sonAdimEtiketi }: { aktif: 0 | 1; sonAdimEtiketi?: string }) {
  const adimlar = sonAdimEtiketi ? [ADIMLAR[0], sonAdimEtiketi] : ADIMLAR;
  return (
    <div className="flex items-center mb-6">
      {adimlar.map((ad, i) => {
        const done = i < aktif;
        const active = i === aktif;
        return (
          <div key={ad} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                  done || active
                    ? "bg-[#0B1D3A] text-white"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs ${active ? "font-medium text-[#0B1D3A]" : "text-[#5A6478]"}`}>{ad}</span>
            </div>
            {i < adimlar.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${done ? "bg-[#0B1D3A]" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
