import { ComfortLevel } from './types';

export const comfortColors: Record<ComfortLevel, {
  bg: string;
  text: string;
  border: string;
  badge: string;
  barColor: string;
  light: string;
}> = {
  TEKOR: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    barColor: 'bg-rose-500',
    light: 'bg-rose-100',
  },
  BERTAHAN: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    barColor: 'bg-orange-500',
    light: 'bg-orange-100',
  },
  NYAMAN: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    barColor: 'bg-yellow-500',
    light: 'bg-yellow-100',
  },
  LEGA: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    barColor: 'bg-emerald-500',
    light: 'bg-emerald-100',
  },
};

export const statusColors = {
  baik: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  perhatian: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  bahaya: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-500',
  },
};

export const comfortLevelLabel: Record<ComfortLevel, string> = {
  TEKOR: 'Tekor',
  BERTAHAN: 'Bertahan',
  NYAMAN: 'Nyaman',
  LEGA: 'Lega',
};
