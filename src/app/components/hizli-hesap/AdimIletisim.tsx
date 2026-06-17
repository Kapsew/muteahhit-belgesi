import { ArrowLeft, ArrowRight, Clock, Info } from "lucide-react";
import type { OturumDurumu } from "./types";

interface Props {
  iletisim: OturumDurumu["iletisim"];
  setIletisim: (i: OturumDurumu["iletisim"]) => void;
  onGeri: () => void;
  onOde: () => void;
  gonderiliyor?: boolean;
}

export function AdimIletisim({ iletisim, setIletisim, onGeri, onOde, gonderiliyor = false }: Props) {
  const upd = (patch: Partial<OturumDurumu["iletisim"]>) => setIletisim({ ...iletisim, ...patch });

  const valid =
    iletisim.firmaUnvani.trim().length > 3 &&
    iletisim.yetkili.trim().length > 2 &&
    iletisim.vergiNo.trim().length === 10 &&
    /\S+@\S+\.\S+/.test(iletisim.eposta) &&
    iletisim.telefon.trim().length >= 10 &&
    iletisim.sifre.length >= 8 &&
    iletisim.sifre === iletisim.sifreTekrar &&
    iletisim.kvkkOnay;

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6">
      <h2 className="text-lg font-medium text-[#0B1D3A] mb-1">İletişim bilgileri ve hesap</h2>
      <p className="text-sm text-[#5A6478] mb-4 leading-relaxed">
        Analiz raporunun iletilmesi ve hesabınızın oluşturulması için aşağıdaki bilgileri eksiksiz doldurunuz.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label hint="(ticaret sicilindeki tam unvan)">Firma unvanı</Label>
          <Input
            value={iletisim.firmaUnvani}
            onChange={(v) => upd({ firmaUnvani: v })}
            placeholder="Örn. Egekor Grup Yapı İnşaat Sanayi ve Ticaret A.Ş."
            maxLength={200}
          />
        </div>
        <div>
          <Label>Yetkili ad soyad</Label>
          <Input value={iletisim.yetkili} onChange={(v) => upd({ yetkili: v })} maxLength={80} />
        </div>
        <div>
          <Label>Vergi numarası</Label>
          <Input
            value={iletisim.vergiNo}
            onChange={(v) => upd({ vergiNo: v.replace(/\D/g, "").slice(0, 10) })}
            placeholder="10 haneli"
          />
        </div>
        <div>
          <Label>E-posta</Label>
          <Input value={iletisim.eposta} onChange={(v) => upd({ eposta: v })} type="email" maxLength={120} />
        </div>
        <div>
          <Label>Telefon</Label>
          <Input
            value={iletisim.telefon}
            onChange={(v) => upd({ telefon: v.replace(/[^\d\s]/g, "").slice(0, 14) })}
            placeholder="0532..."
          />
        </div>
        <div>
          <Label>Şifre belirleyiniz</Label>
          <Input
            value={iletisim.sifre}
            onChange={(v) => upd({ sifre: v })}
            type="password"
            placeholder="en az 8 karakter"
          />
        </div>
        <div>
          <Label>Şifre tekrar</Label>
          <Input value={iletisim.sifreTekrar} onChange={(v) => upd({ sifreTekrar: v })} type="password" />
          {iletisim.sifreTekrar && iletisim.sifre !== iletisim.sifreTekrar && (
            <p className="text-[11px] text-red-600 mt-1">Şifreler eşleşmiyor</p>
          )}
        </div>
      </div>

      <label className="flex items-start gap-2 mt-4 text-xs text-[#5A6478] cursor-pointer">
        <input
          type="checkbox"
          checked={iletisim.kvkkOnay}
          onChange={(e) => upd({ kvkkOnay: e.target.checked })}
          className="mt-0.5"
        />
        <span>KVKK aydınlatma metnini ve hizmet şartlarını okudum, kabul ediyorum.</span>
      </label>

      <div className="mt-5 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center pb-3 border-b border-[#E8E4DC]">
          <div>
            <p className="text-xs text-[#5A6478]">Yeterlilik analiz raporu</p>
            <p className="text-xl font-medium text-[#0B1D3A]">1.499 ₺</p>
            <p className="text-[11px] text-gray-400 mt-0.5">belirtilen fiyata KDV dahildir</p>
          </div>
          <button
            onClick={onOde}
            disabled={!valid || gonderiliyor}
            className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center gap-1.5"
          >
            {gonderiliyor ? "İşleniyor…" : <>Hesapla ve devam et <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2.5 text-[11px] text-[#5A6478] leading-relaxed">
            <Clock className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>
              Analiz raporu, uzmanlarımız tarafından gerçekleştirilen inceleme sonrasında{" "}
              <strong className="font-medium text-[#0B1D3A]">en geç 2 iş günü</strong> içerisinde tarafınıza PDF formatında
              iletilecektir.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-[11px] text-[#5A6478] leading-relaxed">
            <Info className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>
              İşbu hizmet bir başvuru hizmeti niteliği taşımamakta olup;{" "}
              <strong className="font-medium text-[#0B1D3A]">
                müteahhitlik yetki belge grubunun doğru tespitine yönelik analiz çalışması
              </strong>{" "}
              kapsamındadır. Bakanlık başvuru harçları ve benzeri resmi ödemeler hizmet bedeline dahil değildir.
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-4">
        <button
          onClick={onGeri}
          className="px-4 py-2.5 text-sm border border-[#E8E4DC] rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
      </div>
    </div>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-xs text-[#5A6478] mb-1">
      {children} {hint && <span className="text-gray-400">{hint}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full h-9 px-3 text-sm border border-[#E8E4DC] rounded-lg outline-none focus:border-[#047857]"
    />
  );
}
