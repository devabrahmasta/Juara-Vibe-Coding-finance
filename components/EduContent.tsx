'use client';
import { useState } from 'react';
import { LadderResult } from '@/lib/types';
import { eduContent } from '@/lib/edu-content';
import { classNames } from '@/lib/format';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Heart,
  TrendingUp,
  FileText,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield size={18} />,
  Heart: <Heart size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  FileText: <FileText size={18} />,
};

interface Props {
  ladder: LadderResult;
}

function parseContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="font-bold text-on-surface mt-3 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith('• ')) {
      return (
        <li key={i} className="ml-4 text-on-surface-variant text-sm">
          {line.slice(2)}
        </li>
      );
    }
    if (line.startsWith('⚠️')) {
      return (
        <p key={i} className="text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          {line}
        </p>
      );
    }
    if (line.startsWith('*') && line.endsWith('*')) {
      return (
        <p key={i} className="text-xs text-on-surface-variant italic mt-2">
          {line.slice(1, -1)}
        </p>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-sm text-on-surface-variant leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function EduContent({ ladder }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = eduContent.filter((s) => s.minStage <= ladder.stage);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
          Edukasi Finansial
        </p>
        <h2 className="text-headline-lg-mobile font-bold text-on-surface">Pelajari Lebih Lanjut</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Konten relevan berdasarkan tangga finansialmu saat ini.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> Informasi ini bersifat edukasi umum, bukan saran finansial. Sanggup Ga? bukan
          penasihat keuangan tersertifikasi. Untuk keputusan finansial penting, konsultasikan dengan perencana
          keuangan profesional.
        </p>
      </div>

      <div className="space-y-3">
        {visible.map((section) => {
          const isOpen = openId === section.id;
          return (
            <div
              key={section.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-container-low transition-colors"
              >
                <div className="bg-primary/10 text-primary w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                  {iconMap[section.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface">{section.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 truncate">{section.summary}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={classNames(
                    'text-on-surface-variant transition-transform shrink-0',
                    isOpen ? 'rotate-180' : ''
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-outline-variant pt-4 space-y-1">
                      {parseContent(section.content)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
