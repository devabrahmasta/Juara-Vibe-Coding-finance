'use client';
import { useState, useRef } from 'react';
import { AppState } from '@/lib/types';
import { formatIDR } from '@/lib/format';
import { Upload, X, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

type CategoryKey = keyof AppState['profile']['housing' | 'food' | 'transport' | 'utilities'];

interface ParsedRow {
  kategori?: string;
  nominal?: number;
  [key: string]: string | number | undefined;
}

interface AggregatedExpenses {
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  dependents: number;
  lifestyle: number;
  debt: number;
}

interface Props {
  onApply: (expenses: AggregatedExpenses) => void;
  onClose: () => void;
}

const CATEGORY_KEYWORDS: Record<keyof AggregatedExpenses, string[]> = {
  housing: ['kos', 'sewa', 'kontrakan', 'kpr', 'rumah', 'apartment', 'boarding'],
  food: ['makan', 'food', 'kuliner', 'restoran', 'warteg', 'groceries', 'belanja dapur', 'minum'],
  transport: ['transport', 'bensin', 'bbm', 'ojol', 'parkir', 'gojek', 'grab', 'bus', 'krl', 'kereta'],
  utilities: ['listrik', 'air', 'pln', 'pdam', 'internet', 'wifi', 'pulsa', 'telpon', 'netflix', 'spotify', 'subscription', 'langganan'],
  dependents: ['keluarga', 'ortu', 'orang tua', 'transfer keluarga', 'kirim', 'tanggungan'],
  lifestyle: ['hiburan', 'entertainment', 'belanja', 'shopping', 'gym', 'hobby', 'kopi', 'cafe', 'nongkrong', 'hangout'],
  debt: ['cicilan', 'kredit', 'hutang', 'pinjaman', 'loan', 'angsuran', 'kta', 'credit card'],
};

function guessCategory(text: string): keyof AggregatedExpenses | null {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat as keyof AggregatedExpenses;
    }
  }
  return null;
}

export default function ImportData({ onApply, onClose }: Props) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colKategori, setColKategori] = useState<string>('');
  const [colNominal, setColNominal] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [aggregated, setAggregated] = useState<AggregatedExpenses | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    try {
      const XLSX = await import('xlsx');
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: Record<string, string | number>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!json.length) {
        setError('File kosong atau format tidak terbaca. Pastikan ada baris data.');
        return;
      }

      const hdrs = Object.keys(json[0]);
      setHeaders(hdrs);
      setRows(json as ParsedRow[]);

      // Auto-detect columns
      const katCol = hdrs.find((h) =>
        /kategori|keterangan|deskripsi|nama|description|note/i.test(h)
      ) || '';
      const nomCol = hdrs.find((h) =>
        /nominal|jumlah|amount|harga|nilai|total/i.test(h)
      ) || '';
      setColKategori(katCol);
      setColNominal(nomCol);

      setStep('mapping');
    } catch {
      setError('Gagal membaca file. Pastikan format Excel (.xlsx) atau CSV yang valid.');
    }
  }

  function processMapping() {
    if (!colKategori || !colNominal) {
      setError('Pilih kolom kategori dan kolom nominal terlebih dahulu.');
      return;
    }

    const agg: AggregatedExpenses = {
      housing: 0, food: 0, transport: 0,
      utilities: 0, dependents: 0, lifestyle: 0, debt: 0,
    };

    let mapped = 0;
    for (const row of rows) {
      const kat = String(row[colKategori] || '');
      const nom = parseFloat(String(row[colNominal] || '0').replace(/[^0-9.-]/g, ''));
      if (isNaN(nom) || nom <= 0) continue;

      const cat = guessCategory(kat);
      if (cat) {
        agg[cat] += nom;
        mapped++;
      } else {
        agg.lifestyle += nom;
      }
    }

    if (mapped === 0 && rows.length > 0) {
      setError('Tidak ada baris yang berhasil dikategorikan. Pastikan kolom kategori berisi nama kategori yang dikenali.');
      return;
    }

    setAggregated(agg);
    setStep('preview');
    setError('');
  }

  const categoryLabels: Record<keyof AggregatedExpenses, string> = {
    housing: 'Tempat Tinggal',
    food: 'Makan & Minuman',
    transport: 'Transportasi',
    utilities: 'Utilitas & Langganan',
    dependents: 'Tanggungan Keluarga',
    lifestyle: 'Gaya Hidup & Lainnya',
    debt: 'Cicilan Utang',
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h2 className="font-bold text-on-surface">Impor Catatan Keuangan</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Excel / CSV — diproses di perangkatmu</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Privacy notice */}
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
            <Lock size={14} className="shrink-0 mt-0.5" />
            <p>File diproses sepenuhnya di perangkatmu. Tidak ada data yang dikirim ke server.</p>
          </div>

          {step === 'upload' && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-8 text-center flex flex-col items-center gap-3 transition-colors"
              >
                <Upload size={28} className="text-primary" />
                <div>
                  <p className="font-semibold text-on-surface">Klik untuk pilih file</p>
                  <p className="text-xs text-on-surface-variant mt-1">Excel (.xlsx) atau CSV</p>
                </div>
              </button>
              {error && (
                <p className="mt-3 text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                Terdeteksi <strong>{rows.length} baris</strong> data. Pilih kolom yang sesuai:
              </p>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                    Kolom Kategori / Keterangan
                  </label>
                  <select
                    value={colKategori}
                    onChange={(e) => setColKategori(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
                  >
                    <option value="">— Pilih kolom —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
                    Kolom Nominal / Jumlah (Rupiah)
                  </label>
                  <select
                    value={colNominal}
                    onChange={(e) => setColNominal(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm"
                  >
                    <option value="">— Pilih kolom —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              {error && (
                <p className="text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle size={12} /> {error}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 border border-outline-variant text-on-surface-variant rounded-xl py-2.5 text-sm font-semibold hover:bg-surface-container"
                >
                  Kembali
                </button>
                <button
                  onClick={processMapping}
                  className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary-container"
                >
                  Proses
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && aggregated && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={16} />
                <p className="text-sm font-semibold">Berhasil diproses! Review hasil agregasi:</p>
              </div>

              <div className="space-y-2">
                {(Object.keys(aggregated) as (keyof AggregatedExpenses)[]).map((cat) => (
                  aggregated[cat] > 0 ? (
                    <div key={cat} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-0">
                      <span className="text-sm text-on-surface">{categoryLabels[cat]}</span>
                      <span className="font-bold text-sm text-on-surface">{formatIDR(aggregated[cat])}</span>
                    </div>
                  ) : null
                ))}
              </div>

              <p className="text-xs text-on-surface-variant bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ Ini adalah agregasi otomatis. Setelah diterapkan, kamu bisa review dan sesuaikan manual sebelum hitung.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('mapping')}
                  className="flex-1 border border-outline-variant text-on-surface-variant rounded-xl py-2.5 text-sm font-semibold hover:bg-surface-container"
                >
                  Kembali
                </button>
                <button
                  onClick={() => onApply(aggregated)}
                  className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary-container"
                >
                  Terapkan ke Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
