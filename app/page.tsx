'use client';
import { useState } from 'react';
import { useAppStore, estimateTransportCost } from '@/lib/store';
import { formatIDR } from '@/lib/format';
import { RefreshCcw, ChevronRight, ChevronLeft, Upload, FileSpreadsheet } from 'lucide-react';
import { cityData } from '@/lib/types';
import { calculateResult } from '@/lib/calc';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from '@/components/Dashboard';
import ImportData from '@/components/ImportData';

// ─── Shared input helper ─────────────────────────────────────────────────────
const inputCls =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 pl-16 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-body-md text-on-surface';

function NumInput({
  value,
  onChange,
  placeholder = '0',
  className = inputCls,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      min="0"
      placeholder={placeholder}
      value={value === 0 ? '' : value}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === '' ? 0 : Math.max(0, Number(raw)));
      }}
      className={className}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { state, dispatch } = useAppStore();
  const [showImport, setShowImport] = useState(false);

  const { profile, step, hasCompleted, result } = state;

  const handleNext = () => dispatch({ type: 'NEXT_STEP' });
  const handlePrev = () => dispatch({ type: 'PREV_STEP' });

  const handleCalculate = () => {
    const r = calculateResult(profile);
    dispatch({ type: 'SET_RESULT', payload: r });
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data dan mengulang?')) {
      dispatch({ type: 'RESET' });
    }
  };

  const handleImportApply = (expenses: {
    housing: number; food: number; transport: number;
    utilities: number; dependents: number; lifestyle: number; debt: number;
  }) => {
    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'housing', payload: { cost: expenses.housing } });
    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'food', payload: { cost: expenses.food } });
    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'transport', payload: { cost: expenses.transport } });
    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'utilities', payload: {
      listrikAir: Math.round(expenses.utilities * 0.5),
      internetPulsa: Math.round(expenses.utilities * 0.3),
      subscriptions: Math.round(expenses.utilities * 0.2),
    }});
    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'dependents', payload: { kirimOrtu: expenses.dependents } });
    dispatch({ type: 'UPDATE_PROFILE', payload: { debt: expenses.debt } });
    setShowImport(false);
    dispatch({ type: 'SET_STEP', payload: 7 });
  };

  if (hasCompleted && result) {
    return <Dashboard result={result} profile={profile} onReset={handleReset} />;
  }

  // ─── Step renderers ─────────────────────────────────────────────────────────
  const renderStep = () => {
    const selectCls =
      'w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-body-md text-on-surface';
    const rpPrefix = (
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-surface-variant rounded-l-lg border-r border-outline-variant text-on-surface-variant font-medium">
        Rp
      </div>
    );

    switch (step) {
      // ── Step 0: Landing ────────────────────────────────────────────────────
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
            <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl text-primary font-bold italic">SG</span>
            </div>
            <h1 className="text-display font-bold text-on-surface">Sanggup Ga?</h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Cek apakah gajimu cukup untuk hidup di kotamu — sekarang, jujur, personal.
            </p>
            <button
              onClick={handleNext}
              className="bg-primary hover:bg-primary-dark text-white py-4 px-10 rounded-xl font-bold text-body-lg shadow-xl hover:-translate-y-1 transition-all shadow-primary/20 flex items-center gap-2"
            >
              Mulai Hitung <ChevronRight size={24} />
            </button>
            <p className="text-label-sm text-on-surface-variant bg-surface-container-high py-2 px-4 rounded-full border border-outline-variant">
              🔒 Datamu tidak kami simpan. Semua perhitungan terjadi di perangkatmu.
            </p>
          </div>
        );

      // ── Step 1: Informasi Dasar ────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Informasi Dasar
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Mari mulai dengan detail dasar untuk menyesuaikan estimasi biaya hidup Anda.
            </p>

            {/* Import option (B7) */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Punya catatan keuangan?</p>
                  <p className="text-xs text-on-surface-variant">Impor file Excel/CSV untuk otomatis isi data pengeluaran.</p>
                </div>
              </div>
              <button
                onClick={() => setShowImport(true)}
                className="shrink-0 flex items-center gap-1.5 border border-primary text-primary text-xs font-bold px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <Upload size={13} /> Impor
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">
                Pilih Kota<span className="text-error">*</span>
              </label>
              <select
                value={profile.cityId || ''}
                onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { cityId: e.target.value } })}
                className={selectCls}
              >
                <option value="" disabled>Pilih domisili Anda...</option>
                {cityData.cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {profile.cityId && cityData.cities.find((c) => c.id === profile.cityId)?.has_area_selector && (
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface">Area Tinggal (opsional)</label>
                <select
                  value={profile.areaId || ''}
                  onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { areaId: e.target.value } })}
                  className={selectCls}
                >
                  <option value="" disabled>Pilih area spesifik...</option>
                  {cityData.cities.find((c) => c.id === profile.cityId)?.areas?.map((a) => (
                    <option key={a.id} value={a.id}>{a.label} (Cth: {a.examples})</option>
                  ))}
                </select>
                <p className="text-label-sm text-on-surface-variant mt-1">Berpengaruh pada estimasi harga kos & transport.</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">
                Gaji Bersih per Bulan<span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.salary}
                  onChange={(n) => dispatch({ type: 'UPDATE_PROFILE', payload: { salary: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Masukkan total pendapatan setelah pajak/potongan lain.</p>
            </div>
          </div>
        );

      // ── Step 2: Tempat Tinggal ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Tempat Tinggal
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Tipe Tempat Tinggal</label>
              <select
                value={profile.housing.type}
                onChange={(e) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'housing', payload: { type: e.target.value } })}
                className={selectCls}
              >
                <option value="kos">Kos / Sewa Kamar</option>
                <option value="kontrakan">Kontrakan Rumah / Apartemen</option>
                <option value="ikut_ortu">Ikut Orang Tua / Keluarga</option>
                <option value="kpr">Nyicil KPR</option>
                <option value="lunas">Rumah Sendiri Lunas</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Biaya Tempat Tinggal</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.housing.cost}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'housing', payload: { cost: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Per bulan. Sesuaikan dengan kondisimu.</p>
              {profile.cityId && profile.areaId && (
                <p className="text-xs text-primary">Di area ini biasanya kos/kontrakan menyesuaikan multiplier area.</p>
              )}
            </div>
          </div>
        );

      // ── Step 3: Makan ─────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Makan Harian
            </h2>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-label-md text-on-surface">Masak vs Beli</label>
                <span className="text-label-md text-primary">
                  {profile.food.cookRatio}% Masak / {100 - profile.food.cookRatio}% Beli
                </span>
              </div>
              <input
                type="range" min="0" max="100" step="10"
                value={profile.food.cookRatio}
                onChange={(e) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'food', payload: { cookRatio: Number(e.target.value) } })}
                className="w-full accent-primary mt-2"
              />
              <p className="text-xs text-on-surface-variant mt-2">
                Masak sendiri: estimasi termasuk belanja bahan mingguan. Beli: estimasi 2–3x makan per hari.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Estimasi Biaya Makan Dasar</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.food.cost}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'food', payload: { cost: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">
                Per bulan (belanja bahan / warteg / makan harian). Tidak termasuk dine-out.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Frekuensi Ngopi / Dine-Out per Minggu</label>
              <select
                value={profile.food.eatOutFreq}
                onChange={(e) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'food', payload: { eatOutFreq: Number(e.target.value) } })}
                className={selectCls}
              >
                <option value={0}>0 (Jarang banget)</option>
                <option value={1}>1–2x seminggu</option>
                <option value={3}>3–4x seminggu</option>
                <option value={5}>5+ x seminggu</option>
              </select>
            </div>

            {profile.food.eatOutFreq > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-label-md text-on-surface">Estimasi pengeluaran sekali ngopi / makan luar</label>
                <div className="relative flex items-center">
                  {rpPrefix}
                  <NumInput
                    value={profile.food.eatOutCostPerSession}
                    onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'food', payload: { eatOutCostPerSession: n } })}
                    placeholder="Contoh: 75000"
                  />
                </div>
                <p className="text-xs text-on-surface-variant">
                  Est. tambahan dari dine-out:{' '}
                  <strong>{formatIDR(profile.food.eatOutFreq * (profile.food.eatOutCostPerSession || 0) * 4.3)}/bln</strong>
                  {' '}— otomatis ditambahkan ke total akhir.
                </p>
              </div>
            )}
          </div>
        );

      // ── Step 4: Transportasi ──────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Transportasi
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Kendaraan Utama</label>
              <select
                value={profile.transport.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const city = cityData.cities.find((c) => c.id === profile.cityId);
                  const est = estimateTransportCost(newType, profile.transport.distanceKm, city?.baseline);
                  dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'transport', payload: { type: newType, cost: est } });
                }}
                className={selectCls}
              >
                <option value="motor">Motor Pribadi</option>
                <option value="mobil">Mobil Pribadi</option>
                <option value="umum">Transportasi Umum (Ojol/Bus/KRL dll)</option>
                <option value="sepeda">Jalan Kaki / Sepeda</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Jarak Tempuh Harian (sekali jalan)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 10"
                  value={profile.transport.distanceKm === 0 ? '' : profile.transport.distanceKm}
                  onChange={(e) => {
                    const km = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                    const city = cityData.cities.find((c) => c.id === profile.cityId);
                    const est = estimateTransportCost(profile.transport.type, km, city?.baseline);
                    dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'transport', payload: { distanceKm: km, cost: est } });
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 pr-14 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-body-md text-on-surface"
                />
                <span className="absolute right-4 text-on-surface-variant text-sm font-medium">km</span>
              </div>
              <p className="text-xs text-on-surface-variant">Perkiraan biaya transport otomatis dihitung, bisa disesuaikan di bawah.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Estimasi Biaya Transport</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.transport.cost}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'transport', payload: { cost: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">
                Per bulan (bensin, parkir, servis, atau tarif harian). Dihitung otomatis — silakan sesuaikan.
              </p>
            </div>
          </div>
        );

      // ── Step 5: Utilitas ──────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Utilitas & Langganan
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Listrik, Air & Iuran Sampah</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.utilities.listrikAir}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'utilities', payload: { listrikAir: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Per bulan.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Internet WiFi & Kuota HP</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.utilities.internetPulsa}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'utilities', payload: { internetPulsa: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Per bulan.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Langganan Digital (Streaming, dll)</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.utilities.subscriptions}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'utilities', payload: { subscriptions: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Per bulan.</p>
            </div>
          </div>
        );

      // ── Step 6: Tanggungan & Gaya Hidup ───────────────────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface mb-2">
              Tanggungan & Gaya Hidup
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Status Sosial</label>
              <select
                value={profile.dependents.status}
                onChange={(e) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'dependents', payload: { status: e.target.value } })}
                className={selectCls}
              >
                <option value="sendiri">Sendiri / Lajang</option>
                <option value="pasangan">Punya Pasangan (menikah)</option>
                <option value="anak">Punya Anak</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-md text-on-surface">Kirim ke Orang Tua / Tanggungan (Sandwich Gen)</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.dependents.kirimOrtu}
                  onChange={(n) => dispatch({ type: 'UPDATE_NESTED_PROFILE', category: 'dependents', payload: { kirimOrtu: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Per bulan. Kosongkan jika tidak ada.</p>
            </div>

            {/* D: Dropdown Hiburan */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-medium text-on-surface">🎬 Hiburan & Tontonan</label>
              <select
                value={profile.entertainment}
                onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { entertainment: Number(e.target.value) } })}
                className={selectCls}
              >
                <option value={0}>Tidak ada langganan / nonton (Rp 0)</option>
                <option value={200000}>Streaming saja (Netflix, Spotify, dll) — est. Rp 100–300rb</option>
                <option value={350000}>Sesekali nonton bioskop / hangout — est. Rp 200–500rb</option>
                <option value={1000000}>Aktif nonton + jalan + events — est. Rp 500rb–1,5jt</option>
                <option value={2000000}>Hobi intensif (gaming, konser, traveling) — est. Rp 1,5jt+</option>
              </select>
              <p className="text-xs text-on-surface-variant">Per bulan. Tidak termasuk makan yang sudah diisi di langkah sebelumnya.</p>
            </div>

            {/* D: Dropdown Belanja Pribadi */}
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-medium text-on-surface">🛍️ Belanja Pribadi (Non-Makanan)</label>
              <select
                value={profile.shopping}
                onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { shopping: Number(e.target.value) } })}
                className={selectCls}
              >
                <option value={50000}>Hampir tidak belanja — est. Rp 0–100rb</option>
                <option value={200000}>Belanja seperlunya (toiletries, kebutuhan dasar) — est. Rp 100–300rb</option>
                <option value={500000}>Sesekali beli baju / barang — est. Rp 300–700rb</option>
                <option value={1350000}>Rutin belanja fashion / gadget / skincare — est. Rp 700rb–2jt</option>
                <option value={2500000}>Shopaholic / belanja impulsif sering — est. Rp 2jt+</option>
              </select>
              <p className="text-xs text-on-surface-variant">Per bulan. Pakaian, skincare, gadget, aksesoris, dll.</p>
            </div>

            {/* Extras */}
            <div className="border-t border-outline-variant pt-4 mt-2">
              <p className="text-label-md font-bold text-on-surface mb-4">Ekstra Personal (Opsional)</p>
              <div className="space-y-4">

                {/* Rokok */}
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 accent-primary"
                    checked={profile.smokes}
                    onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { smokes: e.target.checked, smokesCost: e.target.checked ? 600000 : 0 } })}
                  />
                  <span className="text-sm">Perokok / Vape aktif</span>
                </label>
                {profile.smokes && (
                  <div className="relative flex items-center ml-8">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 bg-surface-variant rounded-l-lg border-r border-outline-variant text-on-surface-variant font-medium text-sm">Rp</div>
                    <NumInput
                      value={profile.smokesCost}
                      onChange={(n) => dispatch({ type: 'UPDATE_PROFILE', payload: { smokesCost: n } })}
                      placeholder="Est. per bulan"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-12 text-sm"
                    />
                  </div>
                )}

                {/* Pets */}
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 accent-primary"
                    checked={profile.pets}
                    onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { pets: e.target.checked } })}
                  />
                  <span className="text-sm">Pelihara hewan peliharaan (est. +Rp 300rb/bln)</span>
                </label>

                {/* Gym */}
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 accent-primary"
                    checked={profile.gym}
                    onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { gym: e.target.checked, gymCost: e.target.checked ? 250000 : 0 } })}
                  />
                  <span className="text-sm">Member gym berbayar</span>
                </label>
                {profile.gym && (
                  <div className="relative flex items-center ml-8">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 bg-surface-variant rounded-l-lg border-r border-outline-variant text-on-surface-variant font-medium text-sm">Rp</div>
                    <NumInput
                      value={profile.gymCost}
                      onChange={(n) => dispatch({ type: 'UPDATE_PROFILE', payload: { gymCost: n } })}
                      placeholder="Biaya member per bulan"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-12 text-sm"
                    />
                  </div>
                )}
                {profile.gym && (
                  <p className="text-xs text-on-surface-variant ml-8">Per bulan (membership/iuran).</p>
                )}

                {/* Asuransi */}
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-5 h-5 accent-primary"
                    checked={profile.insurance > 0}
                    onChange={(e) => dispatch({ type: 'UPDATE_PROFILE', payload: { insurance: e.target.checked ? 100000 : 0 } })}
                  />
                  <span className="text-sm">Asuransi Mandiri (Cth: BPJS kelas 2 Rp 100rb)</span>
                </label>

                {/* Mudik */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-on-surface">Frekuensi Mudik per Tahun</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profile.mudikFreq === 0 ? '' : profile.mudikFreq}
                    onChange={(e) => {
                      const v = e.target.value;
                      dispatch({ type: 'UPDATE_PROFILE', payload: { mudikFreq: v === '' ? 0 : Math.max(0, Number(v)) } });
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm"
                  />
                </div>
                {profile.mudikFreq > 0 && (
                  <div className="flex flex-col gap-2 ml-4">
                    <label className="text-xs font-semibold text-on-surface">Estimasi biaya sekali perjalanan (PP)</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 bg-surface-variant rounded-l-lg border-r border-outline-variant text-on-surface-variant font-medium text-sm">Rp</div>
                      <NumInput
                        value={profile.mudikCost}
                        onChange={(n) => dispatch({ type: 'UPDATE_PROFILE', payload: { mudikCost: n } })}
                        placeholder="Contoh: 1000000"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-12 text-sm"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Dikonversi ke bulanan:{' '}
                      <strong>{formatIDR((profile.mudikFreq * (profile.mudikCost || 0)) / 12)}/bln</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cicilan */}
            <div className="flex flex-col gap-2 pt-4 border-t border-outline-variant">
              <label className="text-label-md text-on-surface">Total Cicilan Bulanan (Kredit, Pinjol, dll)</label>
              <div className="relative flex items-center">
                {rpPrefix}
                <NumInput
                  value={profile.debt}
                  onChange={(n) => dispatch({ type: 'UPDATE_PROFILE', payload: { debt: n } })}
                />
              </div>
              <p className="text-xs text-on-surface-variant">Per bulan (total semua cicilan aktif).</p>
            </div>
          </div>
        );

      // ── Step 7: Review ────────────────────────────────────────────────────
      case 7: {
        const eatOutMonthly = profile.food.eatOutFreq * (profile.food.eatOutCostPerSession || 0) * 4.3;
        const extrasCost =
          profile.dependents.kirimOrtu +
          profile.debt +
          (profile.smokes ? profile.smokesCost : 0) +
          profile.insurance +
          (profile.pets ? 300000 : 0) +
          (profile.gym ? (profile.gymCost || 250000) : 0) +
          (profile.mudikFreq > 0 ? (profile.mudikFreq * (profile.mudikCost || 1000000)) / 12 : 0);

        return (
          <div className="space-y-6">
            <h2 className="text-headline-lg-mobile font-bold text-on-surface mb-2">Review & Hasil</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              Udah yakin dengan data di atas? Mari cek kesehatan finansialmu.
            </p>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 md:p-6 space-y-4 text-sm mb-8">
              {[
                { label: 'Kota', value: `${cityData.cities.find((c) => c.id === profile.cityId)?.name ?? '—'}${profile.areaId ? ` · ${profile.areaId}` : ''}`, step: null },
                { label: 'Gaji Bersih', value: <span className="font-bold text-primary">{formatIDR(profile.salary)}</span>, step: 1 },
                { label: 'Tempat Tinggal', value: formatIDR(profile.housing.cost), step: 2 },
                { label: 'Makanan (termasuk dine-out)', value: formatIDR(profile.food.cost + eatOutMonthly), step: 3 },
                { label: 'Transportasi', value: formatIDR(profile.transport.cost), step: 4 },
                { label: 'Utilitas & Langganan', value: formatIDR(profile.utilities.listrikAir + profile.utilities.internetPulsa + profile.utilities.subscriptions), step: 5 },
                { label: 'Hiburan + Belanja + Extras', value: `${formatIDR(profile.entertainment + profile.shopping + extrasCost)}`, step: 6 },
              ].map(({ label, value, step: s }, i) => (
                <div key={i} className={`flex justify-between ${i < 6 ? 'border-b border-outline-variant pb-2' : ''}`}>
                  <span className="text-on-surface-variant">{label}</span>
                  <div className="text-right">
                    <span className="font-bold">{value}</span>
                    {s && (
                      <button
                        onClick={() => dispatch({ type: 'SET_STEP', payload: s })}
                        className="block text-primary text-xs ml-auto mt-1 hover:underline"
                      >
                        Ubah
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 px-10 rounded-xl font-bold text-body-lg shadow-xl hover:-translate-y-1 transition-all shadow-primary/20 flex items-center gap-2 justify-center"
            >
              Hitung Sekarang <ChevronRight size={24} />
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const progress = (step / 7) * 100;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {showImport && (
        <ImportData onApply={handleImportApply} onClose={() => setShowImport(false)} />
      )}

      {/* Nav */}
      <nav className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 md:px-10 max-w-7xl mx-auto py-4">
          <div className="font-bold text-xl md:text-2xl text-primary tracking-tight flex items-center gap-2">
            <span className="bg-primary rounded text-white px-2 py-1 italic text-sm">SG</span>
            Sanggup Ga?
          </div>
          <button
            onClick={handleReset}
            className="font-semibold text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant"
          >
            <RefreshCcw size={15} /> Mulai Ulang
          </button>
        </div>
      </nav>

      {/* Main — flex-1 pushes footer down */}
      <main className="flex-1 w-full px-4 md:px-10 py-10 max-w-4xl mx-auto flex flex-col justify-start">
        <div className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-lg p-6 md:p-10">

          {step > 0 && step < 7 && (
            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                  Langkah {step} dari 7
                </span>
                <span className="text-label-sm text-primary font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {step > 0 && step < 7 && (
            <div className="pt-8 flex justify-between border-t border-outline-variant mt-8">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className="text-on-surface-variant hover:text-primary font-semibold text-label-md py-3 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-0"
              >
                <ChevronLeft size={20} /> Kembali
              </button>
              <button
                onClick={handleNext}
                disabled={step === 1 && (!profile.cityId || !profile.salary)}
                className="bg-primary hover:bg-primary-dark disabled:bg-surface-variant text-white disabled:text-on-surface-variant font-semibold text-label-md py-3 px-8 rounded-lg flex items-center gap-2 transition-transform active:scale-95 disabled:scale-100"
              >
                Lanjut <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer — always at bottom */}
      <footer className="bg-surface-dim border-t border-outline-variant py-6">
        <div className="px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto text-sm text-on-surface-variant gap-3">
          <p className="font-semibold">© 2026 Sanggup Ga? · Data: BPS Statistik Indonesia 2026</p>
          <div className="flex gap-4">
            <button className="hover:text-primary">Privacy</button>
            <button className="hover:text-primary">Metodologi</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
