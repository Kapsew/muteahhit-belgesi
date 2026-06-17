import type { Is, IsTuru } from "./types";
import type { OcrSonucu } from "./claudeOcr";

const DEMO_ISLER: Omit<Is, "id">[] = [
  { isAdi: "REZA ARBABİ ve hiss. — ŞENLİK APT", sozlesmeTarihi: "02.12.2021", iskanTarihi: "04.09.2024",
    alanM2: 1178.5, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 7344000, gerceklemeOrani: 100 },
  { isAdi: "SENİHA BELGİN KANDEMİR ve hiss. — TOPRAK SİT", sozlesmeTarihi: "11.02.2021", iskanTarihi: "06.07.2023",
    alanM2: 2324.1, sinif: "III.B", yapiTipi: "konut", isTuru: "kat-karsiligi" as IsTuru, muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş." },
  { isAdi: "CAN ALP ve hiss. — ALP", sozlesmeTarihi: "18.10.2023", iskanTarihi: "10.04.2026",
    alanM2: 3241.9, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 43416655, gerceklemeOrani: 100, guvenDusukAlanlar: ["sinif"] },
  { isAdi: "HALUK AÇAR ve hiss. — ORKİDE SİT", sozlesmeTarihi: "26.10.2022", iskanTarihi: "19.06.2025",
    alanM2: 2851.4, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 20550000, gerceklemeOrani: 100 },
  { isAdi: "MUZAFFER LALE DOLU ve hiss. — AÇELYA APT", sozlesmeTarihi: "28.03.2017", iskanTarihi: "20.11.2018",
    alanM2: 2064.86, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 20550000, gerceklemeOrani: 100 },
  { isAdi: "BORA HELVACIOĞLU ve hiss. — GÖNÜL APT", sozlesmeTarihi: "26.11.2020", iskanTarihi: "05.01.2023",
    alanM2: 1733.8, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 6020144, gerceklemeOrani: 100 },
  { isAdi: "PINAR ÖZKAN ve hiss. — ULUCAN", sozlesmeTarihi: "10.02.2023", iskanTarihi: "15.12.2025",
    alanM2: 2321.76, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 19392045, gerceklemeOrani: 100 },
  { isAdi: "HASAN NURİ KIĞILI ve hiss. — ÜÇAS", sozlesmeTarihi: "21.12.2021", iskanTarihi: "14.07.2025",
    alanM2: 1958.5, sinif: "III.B", yapiTipi: "konut", isTuru: "kat-karsiligi" as IsTuru, muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş." },
  { isAdi: "ENO TOPLAYICI ve hiss. — İÇİN APT", sozlesmeTarihi: "20.12.2017", iskanTarihi: "11.05.2019",
    alanM2: 1196.98, sinif: "III.B", yapiTipi: "konut", isTuru: "taahhut", muteahhit: "Egekor Grup Yapı İnşaat San. ve Tic. A.Ş.",
    sozlesmeBedeli: 2344790, gerceklemeOrani: 100 },
];

let counter = 0;

export function mockOcr(files: File[]): Promise<OcrSonucu> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isler: Is[] = files.map((_, i) => {
        const t = DEMO_ISLER[(counter + i) % DEMO_ISLER.length];
        return { ...t, id: `is-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` };
      });
      counter += files.length;
      resolve({ isler, reddedilen: [] });
    }, 800);
  });
}
