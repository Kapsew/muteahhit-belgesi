export type IsTuru = "kat-karsiligi" | "taahhut" | "kamu";
export type YapiTipi = "konut" | "ticari" | "sanayi";

export interface Is {
  id: string;
  isAdi: string;
  sozlesmeTarihi: string;
  iskanTarihi: string;
  alanM2: number;
  sinif: string;
  yapiTipi: YapiTipi;
  isTuru: IsTuru;
  muteahhit: string;
  guvenDusukAlanlar?: string[];
  sozlesmeBedeli?: number;
  ihaleIlanTarihi?: string;
  geciciKabulTarihi?: string;   // taahhüt/kamu: son 5/15 yıl filtresinin baz tarihi
  gerceklemeOrani?: number;
  sanayiGrup?: string;          // sanayi + 02.12.2019 sonrası: müteahhit yetki belge grubu
  yapiYuksekligiM?: number;     // OCR'dan gelirse: güncel sınıf tespiti için
}

export interface OturumDurumu {
  isler: Is[];
  maliBeyanname: File | null;
  iletisim: {
    firmaUnvani: string;
    yetkili: string;
    vergiNo: string;
    eposta: string;
    telefon: string;
    sifre: string;
    sifreTekrar: string;
    kvkkOnay: boolean;
  };
}
