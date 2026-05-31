export interface StageContent {
  stage: 0 | 1 | 2 | 3 | 4;
  emoji: string;
  title: string;
  description: string;
  fokusUtama: string;
  baseMilestone: string;
  actionItems: string[];
}

export const ladderContent: StageContent[] = [
  {
    stage: 0,
    emoji: '🆘',
    title: 'Bertahan Hidup',
    description:
      'Pengeluaranmu melebihi pemasukan. Ini situasi darurat finansial yang perlu segera diatasi — tidak ada yang perlu malu, ini tanda kamu harus bergerak.',
    fokusUtama:
      'Tutup defisit dulu: kurangi pengeluaran non-esensial atau tambah pemasukan secepatnya.',
    baseMilestone: 'Capai titik impas (sisa ≥ 0) dengan memangkas pengeluaran.',
    actionItems: [
      'Potong semua langganan dan pengeluaran non-esensial mulai bulan ini',
      'Cari pemasukan tambahan: freelance, jual barang tak terpakai, atau kerja sampingan',
      'Komunikasikan kondisimu ke orang terdekat — dukungan sosial itu kekuatan nyata',
    ],
  },
  {
    stage: 1,
    emoji: '🌱',
    title: 'Stabil',
    description:
      'Kamu sudah bisa hidup dari gaji, tapi ruang untuk menabung masih sempit. Ini titik awal yang solid untuk bergerak ke atas.',
    fokusUtama:
      'Temukan ruang minimal 15% untuk mulai menabung — satu perubahan kecil bisa mengubah segalanya.',
    baseMilestone: 'Capai sisa ≥ 15% gaji dengan mengoptimalkan pengeluaran.',
    actionItems: [
      'Audit seluruh pengeluaran bulan ini dan tandai yang bisa dikurangi',
      'Coba "bayar diri sendiri dulu": sisihkan Rp 100–200 rb langsung saat gajian',
      'Cari 1 peluang pemasukan tambahan bulan ini, meski kecil',
    ],
  },
  {
    stage: 2,
    emoji: '💰',
    title: 'Mulai Menabung',
    description:
      'Bagus! Kamu sudah punya sisa untuk ditabung. Saatnya membangun fondasi keamanan finansial yang kokoh.',
    fokusUtama:
      'Bangun dana darurat penuh — ini pondasi sebelum semua langkah berikutnya.',
    baseMilestone: 'Kumpulkan dana darurat sesuai target (lihat angka di bawah).',
    actionItems: [
      'Buka rekening terpisah khusus dana darurat — jangan dicampur rekening harian',
      'Otomasi transfer ke tabungan darurat setiap tanggal gajian',
      'Hindari utang konsumtif baru selama membangun dana darurat',
    ],
  },
  {
    stage: 3,
    emoji: '🛡️',
    title: 'Aman & Proteksi',
    description:
      'Kamu punya buffer yang cukup. Saatnya melindungi apa yang sudah dibangun sebelum mengejar pertumbuhan.',
    fokusUtama:
      'Pastikan proteksi dasar (BPJS aktif, asuransi jiwa jika ada tanggungan) sebelum mulai investasi.',
    baseMilestone: 'Lengkapi proteksi dasar dan kurangi beban utang konsumtif.',
    actionItems: [
      'Verifikasi BPJS Kesehatan aktif dan iuran lancar',
      'Jika punya tanggungan, pelajari asuransi jiwa term life',
      'Mulai belajar instrumen investasi yang sesuai profil risikomu',
    ],
  },
  {
    stage: 4,
    emoji: '🚀',
    title: 'Bertumbuh',
    description:
      'Fondasi finansialmu kuat. Uang sudah bekerja untukmu. Waktunya membangun masa depan secara aktif.',
    fokusUtama: 'Investasi rutin dan konsisten untuk tujuan jangka panjang.',
    baseMilestone: 'Tetapkan tujuan investasi spesifik dengan timeline yang jelas.',
    actionItems: [
      'Bagi sisa dana: investasi rutin + tujuan jangka menengah (liburan, properti)',
      'Diversifikasi instrumen investasi sesuai horizon waktu dan profil risiko',
      'Review rencana keuangan setiap 6 bulan dan sesuaikan dengan perubahan hidup',
    ],
  },
];
