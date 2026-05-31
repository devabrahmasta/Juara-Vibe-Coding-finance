'use client';
import { AdviceCard } from '@/lib/types';
import { statusColors } from '@/lib/theme';
import { formatIDR, formatPercent, classNames } from '@/lib/format';
import { motion } from 'motion/react';
import {
  Home,
  PiggyBank,
  Shield,
  CreditCard,
  Heart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Shield: <Shield size={20} />,
  CreditCard: <CreditCard size={20} />,
  Heart: <Heart size={20} />,
};

const cardIconMap: Record<string, React.ReactNode> = {
  'basic-needs': <Home size={20} />,
  'savings-ratio': <PiggyBank size={20} />,
  'emergency-fund': <Shield size={20} />,
  'debt-ratio': <CreditCard size={20} />,
  'sandwich-gen': <Heart size={20} />,
};

const statusIcon = {
  baik: <CheckCircle2 size={14} />,
  perhatian: <AlertTriangle size={14} />,
  bahaya: <XCircle size={14} />,
};

const statusLabel = {
  baik: 'Baik',
  perhatian: 'Perlu Perhatian',
  bahaya: 'Perlu Tindakan',
};

interface Props {
  cards: AdviceCard[];
}

export default function AdviceCards({ cards }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Diagnostik Personal
        </p>
        <h2 className="text-headline-lg-mobile font-bold text-on-surface">Kartu Rasio Keuangan</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Perhitungan deterministik dari data yang kamu masukkan — bukan estimasi AI.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const colors = statusColors[card.status];
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={classNames(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    colors.badge
                  )}
                >
                  {cardIconMap[card.id]}
                </div>
                <span
                  className={classNames(
                    'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full',
                    colors.badge
                  )}
                >
                  {statusIcon[card.status]}
                  {statusLabel[card.status]}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="font-bold text-sm text-on-surface">{card.title}</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              {/* Value */}
              <div className="mt-auto">
                <div className={classNames('text-xl font-extrabold', colors.text)}>
                  {card.unit === 'percent'
                    ? formatPercent(Math.max(0, card.actualPct) / 100)
                    : formatIDR(card.actualValue)}
                </div>
                {card.recommendedPct && card.unit === 'percent' && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Target: ≤ {card.recommendedPct}%
                  </p>
                )}
              </div>

              {/* Saran */}
              <div
                className={classNames(
                  'text-xs rounded-lg px-3 py-2.5 leading-relaxed',
                  colors.bg,
                  colors.text
                )}
              >
                {card.saran}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
