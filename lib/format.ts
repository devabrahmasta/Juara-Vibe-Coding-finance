export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

export function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
