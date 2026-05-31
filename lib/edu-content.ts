export interface EduSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  content: string;
  minStage: number;
}

export const eduContent: EduSection[] = [
  {
    id: 'emergency-fund',
    title: 'Dana Darurat: Pondasi Finansial',
    icon: 'Shield',
    summary: 'Uang cadangan untuk keadaan tak terduga — wajib dimiliki sebelum investasi.',
    minStage: 0,
    content: `Dana darurat adalah uang yang disisihkan khusus untuk keadaan tak terduga: kehilangan pekerjaan, biaya medis mendadak, atau perbaikan mendesak.

**Berapa yang ideal?**
• Lajang tanpa tanggungan: 3–6× pengeluaran bulanan
• Menikah atau punya tanggungan: 6–12× pengeluaran bulanan

**Di mana menyimpannya?**
• Rekening tabungan terpisah (mudah diakses tapi tidak tercampur harian)
• Deposito jangka pendek 1–3 bulan untuk sebagian dana
• Reksa Dana Pasar Uang (RDPU) untuk imbal hasil lebih optimal

**Prinsip utama:** Dana darurat harus *liquid* (mudah dicairkan) dan *terpisah* dari rekening harian.`,
  },
  {
    id: 'protection',
    title: 'Proteksi: Lindungi Sebelum Investasi',
    icon: 'Heart',
    summary: 'Asuransi kesehatan dan jiwa adalah tameng keuangan yang sering diabaikan.',
    minStage: 2,
    content: `Sebelum investasi, pastikan kamu terlindungi dari risiko besar yang bisa menghabiskan semua tabungan sekaligus.

**BPJS Kesehatan**
Asuransi kesehatan yang wajib dimiliki. Pastikan iuran aktif dan pilih kelas sesuai kebutuhan. BPJS Kesehatan menanggung sebagian besar biaya rawat inap dan tindakan medis.

**Asuransi Jiwa (Term Life)**
Penting jika kamu memiliki tanggungan (orang tua, pasangan, anak). Memberikan perlindungan finansial bagi yang ditinggalkan jika terjadi hal yang tidak diinginkan.

**Prinsip proteksi:**
Asuransi bukan investasi — tujuannya melindungi, bukan mengembangkan aset. Prioritaskan yang paling esensial sesuai kondisi hidupmu. Bandingkan produk dari berbagai perusahaan sebelum memutuskan.`,
  },
  {
    id: 'investment-basics',
    title: 'Investasi: Uang Bekerja untuk Kamu',
    icon: 'TrendingUp',
    summary: 'Kenali dasar-dasar investasi sebelum memulai. Hanya mulai setelah dana darurat terbentuk.',
    minStage: 3,
    content: `Investasi adalah cara membuat uang berkembang melebihi inflasi. **Hanya mulai investasi setelah dana darurat terbentuk dan proteksi dasar terpasang.**

**Kenali Profil Risikomu**
Sebelum investasi, kenali toleransi risikomu:
• Konservatif: prioritas keamanan modal, return lebih rendah
• Moderat: keseimbangan antara keamanan dan pertumbuhan
• Agresif: potensi return tinggi, volatilitas tinggi

**Kategori Instrumen (untuk dipelajari)**
• **Deposito** — aman, bunga tetap, cocok konservatif
• **Emas** — lindung nilai inflasi jangka panjang
• **Reksa Dana** — diversifikasi, dikelola manajer investasi
• **Saham** — potensi tinggi, risiko tinggi, perlu edukasi lebih
• **SBN (Surat Berharga Negara)** — didukung pemerintah, relatif aman

⚠️ *Pelajari lebih lanjut atau konsultasikan dengan perencana keuangan tersertifikasi (CFP) sebelum mengambil keputusan investasi.*`,
  },
  {
    id: 'tax-basics',
    title: 'PPh 21: Pajak Penghasilanmu',
    icon: 'FileText',
    summary: 'Pahami konsep PTKP dan kapan gajimu mulai kena pajak.',
    minStage: 0,
    content: `Pajak Penghasilan Pasal 21 (PPh 21) adalah pajak yang dipotong dari penghasilan karyawan oleh perusahaan.

**PTKP (Penghasilan Tidak Kena Pajak)**
Penghasilan di bawah PTKP tidak dikenakan pajak. Per 2024–2025, PTKP untuk lajang (TK/0) adalah **Rp 54 juta/tahun** atau sekitar Rp 4,5 juta/bulan.

**Jika gajimu di atas PTKP:**
Selisih antara penghasilan bruto dan PTKP dikenakan tarif pajak progresif:
• 5% untuk penghasilan Rp 0–60 juta/tahun
• 15% untuk Rp 60–250 juta/tahun
• 25% untuk Rp 250–500 juta/tahun
• 30% untuk di atas Rp 500 juta/tahun

Gaji yang kamu masukkan di app ini adalah **gaji bersih (take-home pay)** — perusahaan biasanya sudah memotong PPh 21.

*Untuk informasi pajak yang akurat dan personal, konsultasikan dengan konsultan pajak atau kunjungi djp.go.id.*`,
  },
];
