'use client';
import { LadderResult } from '@/lib/types';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { classNames } from '@/lib/format';

interface Props {
  ladder: LadderResult;
}

const stageLabels = ['Bertahan Hidup', 'Stabil', 'Mulai Menabung', 'Aman & Proteksi', 'Bertumbuh'];
const stageEmojis = ['🆘', '🌱', '💰', '🛡️', '🚀'];

export default function FinancialLadder({ ladder }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 md:p-8 space-y-6"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Posisi Finansialmu
        </p>
        <h2 className="text-headline-lg-mobile font-bold text-on-surface">Tangga Finansial</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Kamu ada di anak tangga mana — dan apa langkah berikutnya.
        </p>
      </div>

      {/* Ladder Visual */}
      <div className="flex flex-col gap-2">
        {[...stageLabels].reverse().map((label, reversedIdx) => {
          const stageIdx = 4 - reversedIdx;
          const isActive = stageIdx === ladder.stage;
          const isPast = stageIdx < ladder.stage;

          return (
            <div
              key={stageIdx}
              className={classNames(
                'flex items-center gap-4 rounded-xl px-4 py-3 transition-all',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                  : isPast
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/50'
              )}
            >
              <span className="text-xl w-8 text-center">{stageEmojis[stageIdx]}</span>
              <div className="flex-1">
                <span
                  className={classNames(
                    'font-semibold text-sm',
                    isActive ? 'text-white' : ''
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <span className="ml-2 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                    Posisimu
                  </span>
                )}
              </div>
              {isPast && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
              {isActive && (
                <span className="text-xs text-white/80 shrink-0">Tangga {stageIdx}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Stage Detail */}
      <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant space-y-4">
        <div>
          <h3 className="font-bold text-on-surface text-sm mb-1">
            {ladder.emoji} {ladder.title}
          </h3>
          <p className="text-body-md text-on-surface-variant">{ladder.description}</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Fokus Utama
          </p>
          <p className="text-sm font-medium text-on-surface">{ladder.fokusUtama}</p>
        </div>

        {/* Milestone */}
        <div className="bg-surface-container rounded-lg p-4 border border-outline-variant">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 flex items-center gap-1.5">
            <ArrowRight size={12} />
            Target Naik Tangga
          </p>
          <p className="text-sm text-on-surface">{ladder.milestoneBerikutnya}</p>
        </div>

        {/* Action Items */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Langkah Konkret
          </p>
          <ul className="space-y-2">
            {ladder.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sandwich Note */}
        {ladder.sandwichNote && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <span className="font-bold">💛 Catatan Sandwich Gen: </span>
            {ladder.sandwichNote}
          </div>
        )}

        {/* Debt Note */}
        {ladder.debtNote && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-sm text-rose-800">
            <span className="font-bold">⚠️ Catatan Utang: </span>
            {ladder.debtNote}
          </div>
        )}
      </div>
    </motion.div>
  );
}
