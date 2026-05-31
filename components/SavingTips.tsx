'use client';
import { SavingTip } from '@/lib/types';
import { formatIDR, classNames } from '@/lib/format';
import { motion } from 'motion/react';
import {
  ChefHat,
  Bus,
  Home,
  TrendingDown,
  Tv,
  Calendar,
  Utensils,
  Lightbulb,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  ChefHat: <ChefHat size={18} />,
  Bus: <Bus size={18} />,
  Home: <Home size={18} />,
  TrendingDown: <TrendingDown size={18} />,
  Tv: <Tv size={18} />,
  Calendar: <Calendar size={18} />,
  Utensils: <Utensils size={18} />,
};

interface Props {
  tips: SavingTip[];
}

export default function SavingTips({ tips }: Props) {
  if (tips.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Untuk Profilmu
        </p>
        <h2 className="text-headline-lg-mobile font-bold text-on-surface">Tips Penghematan</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Dipilih berdasarkan pola pengeluaran dan kebiasaanmu — bukan tips generik.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((tip, idx) => (
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.07 }}
            className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5 flex gap-4"
          >
            <div className="bg-primary/10 text-primary w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              {iconMap[tip.icon] ?? <Lightbulb size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-on-surface leading-snug">{tip.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                {tip.description}
              </p>
              {tip.estimatedSaving > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <TrendingDown size={11} />
                  Est. hemat {formatIDR(tip.estimatedSaving)}/bln
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
