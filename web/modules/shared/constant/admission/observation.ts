export const OBSERVATION_DIMENSIONS = [
  {
    name: "Sosial-emosional",
    indicators: [
      "Berani memasuki ruang observasi",
      "Mampu berpisah sementara dari orang tua",
      "Mau berinteraksi dengan observer",
      "Mau bermain bersama teman",
      "Mampu menunggu giliran",
      "Mampu mengelola rasa kecewa",
    ],
  },
  {
    name: "Kemandirian",
    indicators: [
      "Menyimpan barang sendiri",
      "Menggunakan perlengkapan sendiri",
      "Merapikan kembali barang",
      "Mampu menyampaikan kebutuhan",
      "Mampu mengikuti rutinitas sederhana",
    ],
  },
  {
    name: "Komunikasi & Bahasa",
    indicators: [
      "Menjawab pertanyaan sederhana",
      "Memahami instruksi",
      "Mampu menceritakan pengalaman",
      "Mampu bercerita berdasarkan gambar",
      "Mampu menyampaikan keinginan/kebutuhan",
    ],
  },
  {
    name: "Kognitif & Pemecahan Masalah",
    indicators: [
      "Mengelompokkan benda",
      "Mencocokkan pasangan",
      "Mengurutkan",
      "Mengenali pola sederhana",
      "Menyelesaikan puzzle sederhana",
      "Mencoba strategi ketika mengalami kesulitan",
    ],
  },
  {
    name: "Literasi Awal",
    indicators: [
      "Menunjukkan minat terhadap buku",
      "Memahami gambar sebagai cerita",
      "Mengenali beberapa huruf",
      "Mengenali nama sendiri",
      "Menunjukkan kesadaran bunyi bahasa",
      "Memegang alat tulis dengan cukup baik",
    ],
  },
  {
    name: "Numerasi Awal",
    indicators: [
      "Membilang benda",
      "Mengenali beberapa angka",
      "Mencocokkan angka dengan jumlah benda",
      "Membandingkan jumlah",
      "Mengurutkan bilangan sederhana",
      "Memahami konsep sederhana",
    ],
  },
  {
    name: "Motorik",
    indicators: [
      "Memegang alat tulis",
      "Meniru bentuk sederhana",
      "Menggambar objek sederhana",
      "Menggunting sederhana",
      "Berjalan dengan koordinasi baik",
      "Melompat",
      "Koordinasi gerak",
    ],
  },
  {
    name: "Adab & Karakter",
    indicators: [
      "Mengucapkan/merespons salam",
      "Menggunakan bahasa yang sopan",
      "Mengucapkan terima kasih",
      "Meminta izin",
      "Mau berbagi",
      "Menghargai teman",
      "Menunjukkan kepedulian",
    ],
  },
  {
    name: "Kesiapan Belajar",
    indicators: [
      "Mampu memperhatikan penjelasan",
      "Mengikuti instruksi 1 langkah",
      "Mengikuti instruksi 2–3 langkah",
      "Mampu menyelesaikan tugas sederhana",
      "Mau mencoba sesuatu yang baru",
      "Tidak mudah menyerah",
      "Mampu mengikuti aturan permainan",
      "Mampu berpindah aktivitas",
    ],
  },
] as const;

export const OBSERVATION_INDICATOR_COUNT = OBSERVATION_DIMENSIONS.reduce(
  (total, dimension) => total + dimension.indicators.length,
  0,
);

export const OBSERVATION_MAX_SCORE = 4;

export const READINESS_THRESHOLD = { strong: 0.75, moderate: 0.5 } as const;

export const DIMENSION_CATEGORY_LABEL = {
  strong: "Baik",
  moderate: "Perlu Penguatan",
  weak: "Perlu Pendampingan",
} as const;

export const READINESS_CONCLUSION_LABEL = {
  strong: "Kesiapan relatif kuat",
  moderate: "Kesiapan memerlukan penguatan",
  weak: "Memerlukan perhatian/pendampingan",
} as const;

export const READINESS_TONE = {
  strong: "brand",
  moderate: "amber",
  weak: "red",
} as const;
