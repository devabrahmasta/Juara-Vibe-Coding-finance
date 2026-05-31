'use client';
import { useState, useEffect, useMemo } from 'react';
import { AppState, CalculationResult, cityData } from '@/lib/types';
import { formatIDR, formatPercent, classNames } from '@/lib/format';
import { comfortColors, comfortLevelLabel } from '@/lib/theme';
import {
  RefreshCcw, AlertCircle, TrendingUp, Home, Utensils,
  Bus, Sparkles, MapPin, HandCoins,
} from 'lucide-react';
import DonutChart from './DonutChart';
import { motion } from 'motion/react';
import { calculateResult } from '@/lib/calc';
import FinancialLadder from './FinancialLadder';
import AdviceCards from './AdviceCards';
import AdaptiveRecommendations from './AdaptiveRecommendations';
import SavingTips from './SavingTips';
import EduContent from './EduContent';
import ExportButtons from './ExportButtons';

export default function Dashboard({
  result: initialResult,
  profile,
  onReset,
}: {
  result: CalculationResult;
  profile: AppState['profile'];
  onReset: () => void;
}) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [whatIfProfile, setWhatIfProfile] = useState<AppState['profile']>(profile);

  const activeResult = useMemo(() => calculateResult(whatIfProfile), [whatIfProfile]);
  const colors = comfortColors[activeResult.comfortLevel];

  useEffect(() => {
    async function getInsight() {
      try {
        const res = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, result: initialResult }),
        });
        const data = await res.json();
        setInsight(data.insight);
      } catch {
        setInsight('Oops, AI sedang istirahat. Analisis manual tersedia di kartu-kartu di bawah.');
      } finally {
        setLoadingInsight(false);
      }
    }
    getInsight();
  }, [profile, initialResult]);

  return (
    // F: min-h-screen flex flex-col — footer will always be at bottom
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto py-4">
          <div className="font-bold text-lg md:text-xl text-primary tracking-tight flex items-center gap-2">
            <span className="bg-primary rounded text-white px-2 py-1 italic text-sm">SG</span>
            Sanggup Ga?
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons result={activeResult} profile={whatIfProfile} />
            <button
              onClick={onReset}
              className="font-semibold text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-container-high px-3 py-2 rounded-full border border-outline-variant hover:border-primary"
            >
              <RefreshCcw size={13} /> Mulai Ulang
            </button>
          </div>
        </div>
      </nav>

      {/* F: flex-1 pushes footer down */}
      <main className="flex-1 w-full px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">

        {/* ── Hero Verdict ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={classNames(
            'rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border',
            colors.bg, colors.border
          )}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'var(--color-primary)', transform: 'translate(40%, -40%)' }}
          />

          <div className="flex-1 z-10 w-full text-center md:text-left">
            <div className={classNames('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4', colors.badge)}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {comfortLevelLabel[activeResult.comfortLevel]}
            </div>
            <h1 className={classNames('text-display font-extrabold mb-1', colors.text)}>
              {formatIDR(activeResult.sisa)}
            </h1>
            <p className="text-sm text-on-surface-variant font-semibold uppercase tracking-widest">
              Estimasi Sisa Dana / Bulan
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              di <strong className="text-on-surface">{activeResult.cityName}</strong> · gaji{' '}
              <strong className="text-on-surface">{formatIDR(activeResult.salary)}</strong>
            </p>
          </div>

          <div className="flex-1 w-full z-10 space-y-3">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1">
              <span>Pengeluaran {formatPercent(activeResult.ratio / 100)}</span>
              <span className={colors.text}>Sisa {formatPercent(Math.max(0, activeResult.sisaPercentage) / 100)}</span>
            </div>
            <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden flex">
              <div className="h-full bg-primary-container transition-all duration-700" style={{ width: `${Math.min(100, activeResult.ratio)}%` }} />
              {activeResult.sisaPercentage > 0 && (
                <div className={classNames('h-full transition-all duration-700', colors.barColor)} style={{ width: `${activeResult.sisaPercentage}%` }} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest/80 rounded-xl px-4 py-3 border border-outline-variant">
                <p className="text-xs text-on-surface-variant">UMK {activeResult.cityName}</p>
                <p className="font-bold text-sm text-on-surface">{formatIDR(activeResult.umk)}</p>
              </div>
              <div className="bg-surface-container-lowest/80 rounded-xl px-4 py-3 border border-outline-variant">
                <p className="text-xs text-on-surface-variant">Gaji vs UMK</p>
                <p className={classNames('font-bold text-sm', activeResult.salaryVsUmk >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                  {activeResult.salaryVsUmk >= 0 ? '+' : ''}{formatPercent(activeResult.salaryVsUmk / 100)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tangga Finansial ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <FinancialLadder ladder={activeResult.ladder} />
        </motion.div>

        {/* ── AI Insight ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 md:p-8 flex items-start gap-4 shadow-sm border-l-4 border-l-primary/60"
        >
          <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface mb-2">
              Insight AI — Analisis Personal
            </h3>
            {loadingInsight ? (
              <div className="flex gap-2 items-center">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{insight}</p>
            )}
          </div>
        </motion.div>

        {/* ── Advice Cards ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <AdviceCards cards={activeResult.adviceCards} />
        </motion.div>

        {/* ── Adaptive Recommendations (TEKOR/BERTAHAN only) ────── */}
        <AdaptiveRecommendations result={activeResult} />

        {/* ── B: Main Grid — Alternatif Kota left, Donut+Realitas right ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* B: KOLOM KIRI — Alternatif Kota + Simulasi */}
          <div className="md:col-span-1 space-y-6">

            {/* Alternatif Kota — moved here from right col */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 flex justify-between items-center">
                Alternatif Kota <MapPin size={14} />
              </h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Dengan gaji {formatIDR(activeResult.salary)} dan gaya hidup yang sama:
              </p>
              <div className="space-y-3">
                {activeResult.comparedCities.map((cityAlt, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-3 border-b border-outline-variant last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-on-surface">{cityAlt.cityName}</span>
                    <span className={classNames(
                      'font-bold text-sm',
                      cityAlt.sisa > 0 ? 'text-primary' : 'text-error'
                    )}>
                      {cityAlt.sisa > activeResult.sisa ? '↑' : '↓'} {formatIDR(cityAlt.sisa)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulasi What-If */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6 space-y-5">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Simulasi &quot;What If?&quot;</h3>
                <p className="text-xs text-on-surface-variant mt-1">Sesuaikan untuk melihat dampak perubahan ke sisa dana.</p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <Utensils size={16} className="text-primary" />
                    <div>
                      <div className="text-xs font-bold">Masak Semua</div>
                      <div className="text-xs text-on-surface-variant">Hemat ~50% biaya makan</div>
                    </div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-primary"
                    checked={whatIfProfile.food.mode === 'masak'}
                    onChange={(e) => setWhatIfProfile({
                      ...whatIfProfile,
                      food: { ...whatIfProfile.food, cost: e.target.checked ? profile.food.cost * 0.5 : profile.food.cost, mode: e.target.checked ? 'masak' : profile.food.mode }
                    })}
                  />
                </label>
                <label className="flex items-center justify-between p-3 border border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <Bus size={16} className="text-primary" />
                    <div>
                      <div className="text-xs font-bold">Transportasi Umum</div>
                      <div className="text-xs text-on-surface-variant">Hemat ~70% biaya transport</div>
                    </div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 accent-primary"
                    checked={whatIfProfile.transport.type === 'umum'}
                    onChange={(e) => setWhatIfProfile({
                      ...whatIfProfile,
                      transport: { ...whatIfProfile.transport, cost: e.target.checked ? profile.transport.cost * 0.3 : profile.transport.cost, type: e.target.checked ? 'umum' : profile.transport.type }
                    })}
                  />
                </label>
                <div className="p-3 border border-outline-variant rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Home size={16} className="text-primary" />
                      <div className="text-xs font-bold">Biaya Kos</div>
                    </div>
                    <div className="text-xs font-bold text-primary">{formatIDR(whatIfProfile.housing.cost)}</div>
                  </div>
                  <input type="range" min="300000" max={profile.housing.cost + 2000000} step="100000"
                    className="w-full accent-primary"
                    value={whatIfProfile.housing.cost}
                    onChange={(e) => setWhatIfProfile({ ...whatIfProfile, housing: { ...whatIfProfile.housing, cost: Number(e.target.value) } })}
                  />
                </div>
              </div>
              {whatIfProfile !== profile && (
                <div className={classNames(
                  'rounded-xl p-3 text-center text-sm font-bold',
                  activeResult.sisa > initialResult.sisa ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                )}>
                  Sisa simulasi: {formatIDR(activeResult.sisa)}
                  <span className="text-xs font-normal block mt-0.5 opacity-75">
                    {activeResult.sisa > initialResult.sisa
                      ? `+${formatIDR(activeResult.sisa - initialResult.sisa)} dari aktual`
                      : `${formatIDR(activeResult.sisa - initialResult.sisa)} dari aktual`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* B: KOLOM KANAN — DonutChart + Realitas + Cards */}
          <div className="md:col-span-2 space-y-6">

            {/* Distribusi Pengeluaran — moved here, gets 2/3 width */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6 md:p-8">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                Distribusi Pengeluaran
              </h3>
              <DonutChart breakdown={activeResult.breakdown} />
            </div>

            {/* Realitas Gaji */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6 md:p-8">
              <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-6 flex justify-between items-center">
                Realitas Gaji di {activeResult.cityName}
                <AlertCircle size={14} />
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-3 border-b border-outline-variant">
                  <span className="text-sm text-on-surface">Pemasukan Kamu</span>
                  <span className="text-lg font-extrabold">{formatIDR(activeResult.salary)}</span>
                </div>
                <div className="pb-3 border-b border-outline-variant">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm text-on-surface">Gaji &quot;Ideal Nyaman&quot;</span>
                    <span className="text-lg font-bold text-primary">{formatIDR(activeResult.idealSalary.nyaman)}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Profil pengeluaran ini butuh gaji ideal ini untuk hidup nyaman (15% sisa) di {activeResult.cityName}.
                  </p>
                </div>
                <div className="flex justify-between items-end pb-3 border-b border-outline-variant">
                  <span className="text-sm text-on-surface flex items-center gap-1.5">
                    UMK {activeResult.cityName} 2026
                    <span className="text-xs bg-surface-container px-1.5 py-0.5 rounded">
                      {cityData.cities.find((c) => c.id === profile.cityId)?.umk_verified ? '✓ resmi' : 'est'}
                    </span>
                  </span>
                  <span className="text-lg font-bold">{formatIDR(activeResult.umk)}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-center border border-outline-variant text-sm">
                  Gajimu adalah{' '}
                  <span className="font-extrabold text-primary">{formatPercent(activeResult.salary / activeResult.umk)}</span>
                  {' '}dari standar UMK kota ini.
                </div>
              </div>
            </div>

            {/* Mini cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <HandCoins size={18} className="text-emerald-500" />
                  <h4 className="font-bold text-xs uppercase tracking-wide text-on-surface-variant">Potensi Tabungan Tahunan</h4>
                </div>
                {activeResult.savingsPotential > 0 ? (
                  <>
                    <div className="text-2xl font-extrabold text-emerald-600 my-1">{formatIDR(activeResult.savingsPotential)}</div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Dengan sisa {formatIDR(activeResult.sisa)}/bln → dana darurat 6× ({formatIDR(activeResult.totalExpense * 6)}) dalam {Math.ceil((activeResult.totalExpense * 6) / activeResult.sisa)} bulan.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-rose-600 font-medium mt-2">
                    Sisa dana tidak cukup untuk menabung. Prioritaskan keamanan dasar dulu.
                  </p>
                )}
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-primary" />
                  <h4 className="font-bold text-xs uppercase tracking-wide text-on-surface-variant">Rasio Pengeluaran</h4>
                </div>
                <div className="text-2xl font-extrabold text-on-surface my-1">{formatPercent(activeResult.ratio / 100)}</div>
                <p className="text-xs text-on-surface-variant">
                  Target ≤ 80% (agar 20% bisa ditabung). Saat ini level{' '}
                  <span className={classNames('font-bold', comfortColors[activeResult.comfortLevel].text)}>
                    {comfortLevelLabel[activeResult.comfortLevel]}
                  </span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Saving Tips ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <SavingTips tips={activeResult.savingTips} />
        </motion.div>

        {/* ── Edu Content ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <EduContent ladder={activeResult.ladder} />
        </motion.div>

      </main>

      {/* F: Footer — always at bottom */}
      <footer className="bg-surface-dim border-t border-outline-variant py-6">
        <div className="px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto text-sm text-on-surface-variant gap-3">
          <p>© 2026 Sanggup Ga? · Data: BPS Statistik Indonesia 2026</p>
          <p className="text-center md:text-right text-xs">
            Aplikasi ini bersifat edukasi. Bukan saran finansial tersertifikasi.
          </p>
        </div>
      </footer>
    </div>
  );
}
