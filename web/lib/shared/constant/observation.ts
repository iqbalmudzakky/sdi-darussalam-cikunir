export const SCORE_GUIDE = [
  { score: 4, label: "Mandiri, konsisten, tanpa bantuan." },
  { score: 3, label: "Mampu dengan sedikit arahan." },
  { score: 2, label: "Mencoba tetapi masih membutuhkan bantuan cukup banyak." },
  {
    score: 1,
    label: "Belum mampu/ belum menunjukkan respons meskipun sudah distimulasi.",
  },
] as const;

export const RANGE_GUIDE = [
  {
    title: "Kategori (per dimensi)",
    rows: [
      {
        label: "Baik",
        tone: "brand",
        range: "≥ 75%",
      },
      {
        label: "Perlu Penguatan",
        tone: "amber",
        range: "50% – 74%",
      },
      {
        label: "Perlu Pendampingan",
        tone: "red",
        range: "< 50%",
      },
    ],
  },
  {
    title: "Kesimpulan umum (total)",
    rows: [
      {
        label: "Kesiapan relatif kuat",
        tone: "brand",
        range: "≥ 75%",
      },
      {
        label: "Kesiapan memerlukan penguatan",
        tone: "amber",
        range: "50% – 74%",
      },
      {
        label: "Memerlukan perhatian/pendampingan",
        tone: "red",
        range: "< 50%",
      },
    ],
  },
] as const;

export const NOTE_GUIDE = [
  {
    label: "Penting:",
    text: "Hasil bukan diagnosis dan bukan satu-satunya dasar penerimaan. Gunakan bersama wawancara orang tua dan informasi relevan lainnya.",
  },
  {
    label: "Catatan:",
    text: "Untuk anak usia masuk SD, kemampuan membaca/berhitung tidak menjadi satu-satunya ukuran kesiapan.",
  },
] as const;
