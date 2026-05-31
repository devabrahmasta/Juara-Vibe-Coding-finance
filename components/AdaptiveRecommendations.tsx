'use client';
import { CalculationResult } from '@/lib/types';
import { formatIDR, formatPercent } from '@/lib/format';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface Props {
  result: CalculationResult;
}

export default function AdaptiveRecommendations({ result }: Props) {
  const { comfortLevel, categoryBenchmarks, sisa, totalExpense, salary } = result;

  if (comfortLevel !== 'TEKOR' && comfortLevel !== 'BERTAHAN') return null;

  const overCategories = categoryBenchmarks.filter((b) => b.isOver);
  const selisihPerlu = sisa < 0 ? Math.abs(sisa) : Math.max(0, totalExpense * 0.85 - salary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 space-y-6"
    >
      <div className="flex items-start gap-3">
        <div className="bg-rose-100 p-2 rounded-lg text-rose-700 shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h2 className="font-bold text-on-surface text-lg">
            Rekomendasi Perbaikan Keuangan
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Berdasarkan profil pengeluaranmu saat ini — analisis objektif, bukan penilaian.
          </p>
        </div>
      </div>

      {/* Selisih yang perlu ditutup */}
      {sisa < 0 && (
        <div className="bg-white border border-rose-200 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-2">
            Defisit yang Perlu Ditutup
          </p>
          <p className="text-2xl font-extrabold text-rose-700">{formatIDR(Math.abs(sisa))}</p>
          <p className="text-sm text-on-surface-variant mt-1">
            per bulan — dengan mengurangi pengeluaran atau menambah pemasukan sebesar ini, kamu mencapai titik impas.
          </p>
        </div>
      )}

      {/* Kategori yang over benchmark */}
      {overCategories.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-on-surface">
            Kategori Pengeluaran yang Melebihi Benchmark:
          </p>
          {overCategories.map((b) => (
            <div
              key={b.category}
              className="bg-white border border-rose-100 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-on-surface">{b.categoryLabel}</span>
                <span className="text-xs text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
                  {formatPercent(b.actualPct / 100)} dari gaji
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span>Aktual: {formatIDR(b.actual)}</span>
                <span className="text-outline">•</span>
                <span>Rekomendasi: ≤{b.recommendedPct}% = {formatIDR(salary * b.recommendedPct / 100)}</span>
              </div>
              {b.overByAmount > 0 && (
                <p className="text-xs text-rose-700 font-medium">
                  Lebih {formatIDR(b.overByAmount)} dari rekomendasi.
                </p>
              )}
              <p className="text-xs text-on-surface-variant border-l-2 border-rose-300 pl-3">
                Pertimbangkan untuk {b.suggestion}.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Jalur naik level */}
      <div className="bg-white border border-rose-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <p className="text-sm font-bold text-on-surface">
            Untuk Naik ke Level Bertahan
          </p>
        </div>
        <div className="space-y-2 text-sm text-on-surface-variant">
          <p>
            Pilihan A: Kurangi total pengeluaran sebesar{' '}
            <strong className="text-on-surface">{formatIDR(Math.max(0, totalExpense - salary))}</strong> per bulan.
          </p>
          <p>
            Pilihan B: Tambah pemasukan sebesar{' '}
            <strong className="text-on-surface">{formatIDR(Math.max(0, totalExpense - salary))}</strong> per bulan.
          </p>
          <p>
            Pilihan C: Kombinasi keduanya — contoh kurangi{' '}
            <strong className="text-on-surface">{formatIDR(Math.max(0, (totalExpense - salary) / 2))}</strong> pengeluaran + tambah{' '}
            <strong className="text-on-surface">{formatIDR(Math.max(0, (totalExpense - salary) / 2))}</strong> pemasukan.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
