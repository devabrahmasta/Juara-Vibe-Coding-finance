import { AppState, CalculationResult, SavingTip } from './types';

export function getSavingTips(
  profile: AppState['profile'],
  result: CalculationResult
): SavingTip[] {
  const tips: (SavingTip & { relevance: number })[] = [];
  const { salary, breakdown } = result;

  // Tip: High food / beli-heavy
  if (profile.food.cookRatio < 50 && breakdown.food.value / salary > 0.18) {
    tips.push({
      id: 'meal-prep',
      icon: 'ChefHat',
      title: 'Coba Meal Prep Akhir Pekan',
      description:
        'Masak untuk 3–4 hari sekaligus setiap Minggu. Strategis dan bisa hemat hingga 30–40% biaya makan tanpa mengorbankan kualitas gizi.',
      estimatedSaving: Math.round(breakdown.food.value * 0.3),
      relevance: 10,
    });
  }

  // Tip: High transport, not using public transport
  if (
    breakdown.transport.value / salary > 0.15 &&
    profile.transport.type !== 'umum' &&
    profile.transport.type !== 'sepeda'
  ) {
    tips.push({
      id: 'public-transport',
      icon: 'Bus',
      title: 'Beralih ke Transportasi Umum',
      description:
        'Ganti kendaraan pribadi dengan KRL / MRT / Transjakarta / BRT. Bisa hemat signifikan dari BBM, parkir, dan servis rutin.',
      estimatedSaving: Math.round(breakdown.transport.value * 0.55),
      relevance: 9,
    });
  }

  // Tip: High housing cost (> 30% salary)
  if (breakdown.housing.value / salary > 0.3) {
    tips.push({
      id: 'cheaper-housing',
      icon: 'Home',
      title: 'Cari Kos Lebih Terjangkau',
      description:
        'Coba sharing kos, atau area 3–5 km lebih jauh dari pusat kerja. Selisih Rp 300–700 rb/bulan itu setara 3–8 juta per tahun.',
      estimatedSaving: Math.round(Math.max(0, breakdown.housing.value - salary * 0.3)),
      relevance: 8,
    });
  }

  // Tip: Smoker
  if (profile.smokes && profile.smokesCost > 0) {
    const yearlyCost = profile.smokesCost * 12;
    tips.push({
      id: 'quit-smoking',
      icon: 'TrendingDown',
      title: `Rokok: Rp ${yearlyCost.toLocaleString('id-ID')}/Tahun`,
      description: `Pengeluaran rokok/vapenya ${profile.smokesCost.toLocaleString('id-ID')}/bulan. Dialihkan ke tabungan darurat, itu bisa jadi ${Math.ceil(result.danaDarurat6Bulan / (profile.smokesCost * 12 / 12))} bulan dana darurat lebih cepat.`,
      estimatedSaving: profile.smokesCost,
      relevance: 7,
    });
  }

  // Tip: High subscriptions
  if (profile.utilities.subscriptions > salary * 0.02) {
    tips.push({
      id: 'audit-subscriptions',
      icon: 'Tv',
      title: 'Audit Langganan Digital',
      description:
        'Cek semua langganan aktif (streaming, musik, cloud, dll). Batalkan yang jarang dipakai, dan share akun dengan keluarga / teman untuk yang dibutuhkan.',
      estimatedSaving: Math.round(profile.utilities.subscriptions * 0.5),
      relevance: 6,
    });
  }

  // Tip: High entertainment spend
  if (profile.entertainment > 700000) {
    tips.push({
      id: 'lifestyle-budget',
      icon: 'Calendar',
      title: 'Tetapkan Anggaran Hiburan',
      description:
        'Buat batas anggaran bulanan untuk hiburan dan tontonan — misalnya maksimal Rp 400–600 rb. Ini bukan berarti stop bersenang-senang, tapi tetap sadar batas.',
      estimatedSaving: Math.round(profile.entertainment * 0.4),
      relevance: 5,
    });
  }

  // Tip: High shopping spend
  if (profile.shopping > 500000) {
    tips.push({
      id: 'reduce-shopping',
      icon: 'TrendingDown',
      title: 'Kurangi Belanja Impulsif',
      description:
        'Coba aturan "24 jam": tunggu sehari sebelum beli barang non-esensial. Buat wishlist, beli saat ada diskon nyata, dan pisahkan antara "mau" vs "butuh".',
      estimatedSaving: Math.round(profile.shopping * 0.35),
      relevance: 4,
    });
  }

  // Tip: Eating out frequently
  if (profile.food.eatOutFreq >= 3) {
    tips.push({
      id: 'reduce-eat-out',
      icon: 'Utensils',
      title: 'Kurangi Frekuensi Nongkrong',
      description:
        'Dari nongkrong 3–5x/minggu ke 1–2x/minggu bisa hemat Rp 300–600 rb per bulan. Coba jadikan nongkrong sebagai reward, bukan rutinitas.',
      estimatedSaving: Math.round(breakdown.food.value * 0.15),
      relevance: 4,
    });
  }

  return tips
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map(({ relevance: _r, ...tip }) => tip);
}
