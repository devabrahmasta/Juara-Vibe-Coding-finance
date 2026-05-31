import {
  AppState,
  CalculationResult,
  LadderResult,
  AdviceCard,
  CategoryBenchmark,
  cityData,
} from './types';
import { ladderContent } from './ladder-content';
import { getSavingTips } from './saving-tips';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(n);
}

// ─── Financial Ladder ─────────────────────────────────────────────────────────

export function getFinancialLadder(
  profile: AppState['profile'],
  result: CalculationResult
): LadderResult {
  const { sisaPercentage, sisa, totalExpense, salary } = result;

  const hasSandwich = profile.dependents.kirimOrtu > 0;
  const hasSandwichHeavy = profile.dependents.kirimOrtu > salary * 0.15;
  const hasHeavyDebt = profile.debt > salary * 0.2;

  let stage: 0 | 1 | 2 | 3 | 4;
  if (sisaPercentage < 0) {
    stage = 0;
  } else if (sisaPercentage < 15) {
    stage = 1;
  } else if (sisaPercentage < 35) {
    stage = 2;
  } else {
    stage = hasHeavyDebt || hasSandwichHeavy ? 3 : 4;
  }

  const content = ladderContent[stage];

  // Dynamic milestone with concrete numbers
  const daruratMultiplier = profile.dependents.status === 'sendiri' ? 6 : 12;
  const danaDarurat = totalExpense * daruratMultiplier;
  const bulanMenabung = sisa > 0 ? Math.ceil(danaDarurat / sisa) : null;

  let milestoneBerikutnya = content.baseMilestone;
  let milestoneTargetAmount: number | undefined;
  let milestoneTargetMonths: number | undefined;

  if (stage === 0) {
    const defisit = Math.abs(sisa);
    milestoneBerikutnya = `Kurangi pengeluaran atau tambah pemasukan sebesar ${fmtIDR(defisit)}/bulan untuk capai titik impas.`;
    milestoneTargetAmount = defisit;
  } else if (stage === 1) {
    const targetSisa = salary * 0.15;
    milestoneBerikutnya = `Sisihkan minimal ${fmtIDR(targetSisa)}/bulan (15% gaji) — sekarang selisih ${fmtIDR(Math.max(0, targetSisa - sisa))}.`;
    milestoneTargetAmount = targetSisa;
  } else if (stage === 2) {
    milestoneBerikutnya = `Kumpulkan dana darurat ${daruratMultiplier}× pengeluaran = ${fmtIDR(danaDarurat)}${bulanMenabung ? ` (~${bulanMenabung} bulan menabung)` : ''}.`;
    milestoneTargetAmount = danaDarurat;
    milestoneTargetMonths = bulanMenabung ?? undefined;
  } else if (stage === 3) {
    milestoneBerikutnya = `Lengkapi BPJS dan proteksi dasar, lalu kurangi utang hingga di bawah ${fmtPct(0.2)} gaji.`;
  } else {
    milestoneBerikutnya = `Tetapkan alokasi investasi rutin — mulai dari ${fmtPct(0.1)} gaji (${fmtIDR(salary * 0.1)}/bulan) sebagai target awal.`;
    milestoneTargetAmount = salary * 0.1;
  }

  const sandwichNote =
    hasSandwich
      ? 'Kontribusimu ke keluarga adalah kebaikan nyata. Sambil membantu, pastikan kamu juga menyisihkan dana darurat untuk dirimu sendiri — ini bukan egois, ini keamanan bersama.'
      : undefined;

  const debtNote =
    hasHeavyDebt
      ? `Cicilan utangmu ${fmtPct(profile.debt / salary)} dari gaji — di atas batas 20%. Prioritaskan pelunasan utang berbunga tinggi sebelum naik tangga berikutnya.`
      : undefined;

  return {
    stage,
    emoji: content.emoji,
    title: content.title,
    description: content.description,
    fokusUtama: content.fokusUtama,
    milestoneBerikutnya,
    milestoneTargetAmount,
    milestoneTargetMonths,
    actionItems: content.actionItems,
    sandwichNote,
    debtNote,
  };
}

// ─── Advice Cards ─────────────────────────────────────────────────────────────

export function generateAdviceCards(
  profile: AppState['profile'],
  result: CalculationResult
): AdviceCard[] {
  const cards: AdviceCard[] = [];
  const { salary, breakdown, totalExpense, sisa, sisaPercentage } = result;

  // Card 1: Rasio Kebutuhan Pokok (50/30/20)
  const basicNeeds =
    breakdown.housing.value +
    breakdown.food.value +
    breakdown.transport.value +
    breakdown.utilities.value;
  const basicNeedsPct = salary > 0 ? (basicNeeds / salary) * 100 : 0;
  cards.push({
    id: 'basic-needs',
    title: 'Rasio Kebutuhan Pokok',
    subtitle:
      'Pakar menyarankan kebutuhan pokok (kos, makan, transport, utilitas) tidak melebihi 50% pemasukan.',
    actualValue: basicNeeds,
    actualPct: basicNeedsPct,
    recommendedPct: 50,
    status: basicNeedsPct <= 50 ? 'baik' : basicNeedsPct <= 65 ? 'perhatian' : 'bahaya',
    saran:
      basicNeedsPct <= 50
        ? 'Komposisi kebutuhan pokokmu sudah sehat. Pertahankan!'
        : basicNeedsPct <= 65
        ? 'Kebutuhan pokokmu sedikit tinggi. Cari peluang optimasi di salah satu kategori.'
        : 'Kebutuhan pokokmu sangat tinggi. Pertimbangkan kos lebih terjangkau atau kurangi biaya makan.',
    unit: 'percent',
  });

  // Card 2: Rasio Tabungan
  cards.push({
    id: 'savings-ratio',
    title: 'Rasio Tabungan',
    subtitle: 'Idealnya minimal 20% pemasukan disisihkan untuk tabungan dan investasi.',
    actualValue: Math.max(0, sisa),
    actualPct: sisaPercentage,
    recommendedPct: 20,
    status: sisaPercentage >= 20 ? 'baik' : sisaPercentage >= 0 ? 'perhatian' : 'bahaya',
    saran:
      sisaPercentage >= 20
        ? 'Rasio tabunganmu sudah di atas target 20%. Pertahankan konsistensi.'
        : sisaPercentage >= 0
        ? `Kamu menyisihkan ${fmtPct(sisaPercentage / 100)}, di bawah target 20%. Coba kurangi satu kategori non-esensial.`
        : 'Kamu belum bisa menabung. Fokus dulu stabilisasi pengeluaran atau cari pemasukan tambahan.',
    unit: 'percent',
  });

  // Card 3: Dana Darurat
  const daruratMultiplier = profile.dependents.status === 'sendiri' ? 6 : 12;
  const danaDaruratTarget = totalExpense * daruratMultiplier;
  const bulanMenabung = sisa > 0 ? Math.ceil(danaDaruratTarget / sisa) : null;
  cards.push({
    id: 'emergency-fund',
    title: 'Dana Darurat',
    subtitle: `Target ideal: ${daruratMultiplier}× pengeluaran bulanan${profile.dependents.status !== 'sendiri' ? ' (ada tanggungan)' : ' (lajang)'}.`,
    actualValue: danaDaruratTarget,
    actualPct: 0,
    status: sisa > 0 ? 'perhatian' : 'bahaya',
    saran:
      sisa > 0
        ? `Target dana darurat: ${fmtIDR(danaDaruratTarget)}. Estimasi ${bulanMenabung} bulan menabung dengan sisa ${fmtIDR(sisa)}/bulan.`
        : 'Belum bisa membangun dana darurat. Prioritaskan dulu stabilisasi pengeluaran.',
    unit: 'rupiah',
  });

  // Card 4: Beban Utang (hanya jika ada)
  if (profile.debt > 0) {
    const debtPct = salary > 0 ? (profile.debt / salary) * 100 : 0;
    cards.push({
      id: 'debt-ratio',
      title: 'Beban Utang (DSR)',
      subtitle: 'Total cicilan utang sebaiknya tidak melebihi 30% pemasukan (Debt Service Ratio).',
      actualValue: profile.debt,
      actualPct: debtPct,
      recommendedPct: 30,
      status: debtPct <= 30 ? 'baik' : 'bahaya',
      saran:
        debtPct <= 30
          ? 'Beban utangmu masih dalam batas sehat (≤ 30% gaji).'
          : `Utangmu ${fmtPct(debtPct / 100)} dari gaji, melebihi 30%. Prioritaskan pelunasan utang berbunga tertinggi dulu.`,
      unit: 'percent',
    });
  }

  // Card 5: Kontribusi Keluarga / Sandwich Gen (hanya jika ada)
  if (profile.dependents.kirimOrtu > 0) {
    const depPct = salary > 0 ? (profile.dependents.kirimOrtu / salary) * 100 : 0;
    cards.push({
      id: 'sandwich-gen',
      title: 'Kontribusi Keluarga',
      subtitle: 'Kamu termasuk generasi sandwich. Kontribusimu ke keluarga sangat berarti.',
      actualValue: profile.dependents.kirimOrtu,
      actualPct: depPct,
      recommendedPct: 20,
      status: depPct <= 20 ? 'perhatian' : 'bahaya',
      saran: `${fmtPct(depPct / 100)} gajimu untuk keluarga. Sambil tetap membantu, pastikan kamu juga punya dana darurat minimal 3 bulan untuk dirimu sendiri.`,
      unit: 'percent',
    });
  }

  return cards;
}

// ─── Category Benchmarks ─────────────────────────────────────────────────────

export function getCategoryBenchmarks(
  profile: AppState['profile'],
  result: CalculationResult
): CategoryBenchmark[] {
  const { salary, breakdown } = result;

  const benchmarkDefs = [
    {
      key: 'housing' as const,
      label: 'Tempat Tinggal',
      recommended: 30,
      suggestion:
        'cari kos lebih terjangkau, pertimbangkan sharing room, atau pindah ke area yang lebih jauh dari pusat kota',
    },
    {
      key: 'food' as const,
      label: 'Makan & Minuman',
      recommended: 20,
      suggestion:
        'mulai masak sendiri minimal 50%, kurangi frekuensi nongkrong, dan manfaatkan meal prep akhir pekan',
    },
    {
      key: 'transport' as const,
      label: 'Transportasi',
      recommended: 15,
      suggestion:
        'pertimbangkan beralih ke transportasi umum, nebeng rekan, atau pindah kos yang lebih dekat tempat kerja',
    },
  ];

  return benchmarkDefs.map(({ key, label, recommended, suggestion }) => {
    const actual = breakdown[key].value;
    const actualPct = salary > 0 ? (actual / salary) * 100 : 0;
    const isOver = actualPct > recommended;
    return {
      category: key,
      categoryLabel: label,
      actual,
      actualPct,
      recommendedPct: recommended,
      isOver,
      overByAmount: isOver ? Math.round(actual - salary * (recommended / 100)) : 0,
      suggestion,
    };
  });
}

// ─── Main Calculator ───────────────────────────────────────────────────────────

export function calculateResult(profile: AppState['profile']): CalculationResult {
  const city = cityData.cities.find((c) => c.id === profile.cityId) || cityData.cities[0];

  const housing = profile.housing.cost;
  const eatOutMonthly = profile.food.eatOutFreq * (profile.food.eatOutCostPerSession || 0) * 4.3;
  const food = profile.food.cost + eatOutMonthly;
  const transport = profile.transport.cost;
  const utilities =
    profile.utilities.listrikAir +
    profile.utilities.internetPulsa +
    profile.utilities.subscriptions;
  const dependents = profile.dependents.kirimOrtu;

  const extraSmokes = profile.smokes ? profile.smokesCost : 0;
  const extraPets = profile.pets ? 300000 : 0;
  const extraGym = profile.gym ? (profile.gymCost || 250000) : 0;
  const extraMudik = profile.mudikFreq > 0
    ? (profile.mudikFreq * (profile.mudikCost || 1000000)) / 12
    : 0;

  const lifestyleExtras = profile.insurance + extraSmokes + extraPets + extraGym + extraMudik;
  const lifestyle = profile.entertainment + profile.shopping + lifestyleExtras;
  const debt = profile.debt;

  const totalExpense = housing + food + transport + utilities + dependents + lifestyle + debt;
  const sisa = profile.salary - totalExpense;
  const sisaPercentage = profile.salary > 0 ? (sisa / profile.salary) * 100 : 0;

  let comfortLevel: CalculationResult['comfortLevel'] = 'TEKOR';
  if (sisaPercentage > 35) comfortLevel = 'LEGA';
  else if (sisaPercentage >= 15) comfortLevel = 'NYAMAN';
  else if (sisaPercentage >= 0) comfortLevel = 'BERTAHAN';

  let verdict: CalculationResult['verdict'] = 'TEKOR';
  if (sisaPercentage > 20) verdict = 'SANGGUP';
  else if (sisaPercentage >= 0) verdict = 'PAS-PASAN';

  // A3: Spread comparison cities across tiers
  const tiers = ['metropolitan', 'besar', 'sedang'] as const;
  const comparedSource = tiers
    .flatMap((tier) =>
      cityData.cities.filter((c) => c.id !== profile.cityId && c.tier === tier).slice(0, 2)
    )
    .slice(0, 5);

  const comparedCities = comparedSource.map((c) => {
    const hMult = c.baseline.kos / (city.baseline.kos || 1);
    const fMult = c.baseline.makan_beli / (city.baseline.makan_beli || 1);
    const tMult =
      c.baseline.transport_motor / (city.baseline.transport_motor || 1);
    const uMult = c.baseline.utilitas / (city.baseline.utilitas || 1);

    const altTotal =
      housing * hMult +
      food * fMult +
      transport * tMult +
      utilities * uMult +
      dependents +
      lifestyle +
      debt;

    return { cityName: c.name, sisa: profile.salary - altTotal };
  });

  const danaDarurat6Bulan = totalExpense * 6;
  const bulanMenabungDarurat = sisa > 0 ? danaDarurat6Bulan / sisa : null;

  const baseResult: Omit<CalculationResult, 'ladder' | 'adviceCards' | 'savingTips' | 'categoryBenchmarks'> = {
    salary: profile.salary,
    totalExpense,
    sisa,
    sisaPercentage,
    verdict,
    comfortLevel,
    ratio: profile.salary > 0 ? (totalExpense / profile.salary) * 100 : 0,
    salaryVsUmk:
      profile.salary > 0 && city.umk > 0
        ? ((profile.salary - city.umk) / city.umk) * 100
        : 0,
    savingsPotential: Math.max(0, sisa * 12),
    umk: city.umk,
    cityTier: city.tier,
    cityName: city.name,
    comparedCities: comparedCities.sort((a, b) => b.sisa - a.sisa),
    idealSalary: {
      bertahan: totalExpense,
      nyaman: totalExpense / 0.85,
      lega: totalExpense / 0.65,
    },
    rasioTabungan: profile.salary > 0 ? (sisa / profile.salary) * 100 : 0,
    rasioPengeluaran:
      profile.salary > 0 ? (totalExpense / profile.salary) * 100 : 0,
    danaDarurat6Bulan,
    bulanMenabungDarurat,
    breakdown: {
      housing: { value: housing, percentage: totalExpense > 0 ? (housing / totalExpense) * 100 : 0 },
      food: { value: food, percentage: totalExpense > 0 ? (food / totalExpense) * 100 : 0 },
      transport: { value: transport, percentage: totalExpense > 0 ? (transport / totalExpense) * 100 : 0 },
      utilities: { value: utilities, percentage: totalExpense > 0 ? (utilities / totalExpense) * 100 : 0 },
      dependents: { value: dependents, percentage: totalExpense > 0 ? (dependents / totalExpense) * 100 : 0 },
      lifestyle: { value: lifestyle, percentage: totalExpense > 0 ? (lifestyle / totalExpense) * 100 : 0 },
      debt: { value: debt, percentage: totalExpense > 0 ? (debt / totalExpense) * 100 : 0 },
    },
  };

  const ladder = getFinancialLadder(profile, baseResult as CalculationResult);
  const adviceCards = generateAdviceCards(profile, baseResult as CalculationResult);
  const savingTips = getSavingTips(profile, baseResult as CalculationResult);
  const categoryBenchmarks = getCategoryBenchmarks(profile, baseResult as CalculationResult);

  return { ...baseResult, ladder, adviceCards, savingTips, categoryBenchmarks };
}
