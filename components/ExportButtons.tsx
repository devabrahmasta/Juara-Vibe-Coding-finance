'use client';
import { CalculationResult, AppState } from '@/lib/types';
import { formatIDR, formatPercent } from '@/lib/format';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import React from 'react';

interface Props {
  result: CalculationResult;
  profile: AppState['profile'];
}

function getDateStr() {
  return new Date().toISOString().slice(0, 10);
}
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── PDF (via @react-pdf/renderer, dynamic import) ──────────────────────────
async function exportPDF(result: CalculationResult, profile: AppState['profile']) {
  try {
    const [{ pdf }, { PdfReport }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./PdfReport'),
    ]);
    // Cast needed: react-pdf's DocumentProps doesn't align with React's generic element type
    const blob = await pdf(React.createElement(PdfReport, { result, profile }) as any).toBlob(); // eslint-disable-line
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanggupga-${slugify(result.cityName)}-${getDateStr()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: print window
    exportPDFPrint(result, profile);
  }
}

// Fallback print-to-PDF
function exportPDFPrint(result: CalculationResult, profile: AppState['profile']) {
  const printContent = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
    <title>Laporan Sanggup Ga? — ${result.cityName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:32px;max-width:800px;margin:0 auto}
      h1{font-size:20px;color:#00A86B;margin-bottom:4px}
      h2{font-size:13px;color:#333;margin:18px 0 6px;border-bottom:1.5px solid #e5e7eb;padding-bottom:4px}
      .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:#E6F7F1;color:#00A86B}
      .hero{background:#E6F7F1;border-radius:10px;padding:18px;margin-bottom:20px}
      .hero-number{font-size:32px;font-weight:800;color:#00A86B}
      table{width:100%;border-collapse:collapse;margin-top:6px}
      th{background:#F2F7F4;text-align:left;padding:6px 8px;font-size:10px;text-transform:uppercase;color:#4A5E52}
      td{padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:11px}
      td.num{text-align:right;font-weight:600}
      .footer{margin-top:28px;font-size:9px;color:#7A9382;border-top:1px solid #e5e7eb;padding-top:8px;line-height:1.5}
      @media print{@page{margin:16mm}}
    </style></head><body>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <div style="background:#00A86B;color:white;padding:4px 10px;border-radius:6px;font-weight:800;font-style:italic">SG</div>
      <h1>Laporan Sanggup Ga?</h1>
      <span style="margin-left:auto;font-size:10px;color:#6b7280">${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</span>
    </div>
    <div class="hero">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#4A5E52;margin-bottom:6px">Estimasi Sisa Dana Per Bulan</p>
      <div class="hero-number">${formatIDR(result.sisa)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <span class="badge">${result.comfortLevel}</span>
        <span style="font-size:11px;color:#374151">di <b>${result.cityName}</b> · Gaji: <b>${formatIDR(result.salary)}</b></span>
      </div>
    </div>
    <h2>Rincian Pengeluaran</h2>
    <table>
      <thead><tr><th>Kategori</th><th style="text-align:right">Jumlah</th><th style="text-align:right">% Gaji</th></tr></thead>
      <tbody>
        <tr><td>Tempat Tinggal</td><td class="num">${formatIDR(result.breakdown.housing.value)}</td><td class="num">${formatPercent(result.breakdown.housing.value/result.salary)}</td></tr>
        <tr><td>Makan & Minuman</td><td class="num">${formatIDR(result.breakdown.food.value)}</td><td class="num">${formatPercent(result.breakdown.food.value/result.salary)}</td></tr>
        <tr><td>Transportasi</td><td class="num">${formatIDR(result.breakdown.transport.value)}</td><td class="num">${formatPercent(result.breakdown.transport.value/result.salary)}</td></tr>
        <tr><td>Utilitas</td><td class="num">${formatIDR(result.breakdown.utilities.value)}</td><td class="num">${formatPercent(result.breakdown.utilities.value/result.salary)}</td></tr>
        <tr><td>Tanggungan Keluarga</td><td class="num">${formatIDR(result.breakdown.dependents.value)}</td><td class="num">${formatPercent(result.breakdown.dependents.value/result.salary)}</td></tr>
        <tr><td>Gaya Hidup & Ekstra</td><td class="num">${formatIDR(result.breakdown.lifestyle.value)}</td><td class="num">${formatPercent(result.breakdown.lifestyle.value/result.salary)}</td></tr>
        <tr><td>Cicilan Utang</td><td class="num">${formatIDR(result.breakdown.debt.value)}</td><td class="num">${formatPercent(result.breakdown.debt.value/result.salary)}</td></tr>
        <tr style="font-weight:700;background:#F2F7F4"><td>Total</td><td class="num">${formatIDR(result.totalExpense)}</td><td class="num">${formatPercent(result.totalExpense/result.salary)}</td></tr>
        <tr style="color:#00A86B;font-weight:800"><td>Sisa Dana</td><td class="num">${formatIDR(result.sisa)}</td><td class="num">${formatPercent(result.sisa/result.salary)}</td></tr>
      </tbody>
    </table>
    <h2>Tangga Finansial</h2>
    <div style="background:#E6F7F1;border-radius:8px;padding:12px">
      <b>${result.ladder.emoji} Stage ${result.ladder.stage}: ${result.ladder.title}</b>
      <p style="margin-top:6px;font-size:11px;color:#4A5E52">${result.ladder.fokusUtama}</p>
      <p style="margin-top:6px;font-size:10px;color:#6b7280"><b>Milestone:</b> ${result.ladder.milestoneBerikutnya}</p>
    </div>
    <div class="footer">
      Sumber: BPS SBH 2022, Kemnaker 2025–2026, estimasi berbasis riset publik.<br>
      Disclaimer: Laporan ini bersifat estimasi dan edukasi umum. Bukan saran finansial tersertifikasi.
    </div>
    </body></html>`;
  const win = window.open('', '_blank', 'width=850,height=700');
  if (!win) return;
  win.document.write(printContent);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────
function exportCSV(result: CalculationResult, profile: AppState['profile']) {
  const rows = [
    ['Kategori', 'Tipe', 'Jumlah', 'Catatan'],
    ['Gaji Bersih', 'Pemasukan', result.salary, 'Take-home pay per bulan'],
    ['Tempat Tinggal', 'Pengeluaran', result.breakdown.housing.value, `Tipe: ${profile.housing.type}`],
    ['Makan & Minuman', 'Pengeluaran', result.breakdown.food.value, `Masak ${profile.food.cookRatio}%`],
    ['Transportasi', 'Pengeluaran', result.breakdown.transport.value, `Kendaraan: ${profile.transport.type}`],
    ['Utilitas', 'Pengeluaran', result.breakdown.utilities.value, 'Listrik, air, internet, langganan'],
    ['Tanggungan Keluarga', 'Pengeluaran', result.breakdown.dependents.value, 'Kirim ke orang tua/keluarga'],
    ['Gaya Hidup & Ekstra', 'Pengeluaran', result.breakdown.lifestyle.value, 'Hiburan + Belanja + Extras'],
    ['Cicilan Utang', 'Pengeluaran', result.breakdown.debt.value, 'Total cicilan bulanan'],
    ['Sisa Dana', 'Saldo', result.sisa, `${result.comfortLevel} — ${formatPercent(result.sisaPercentage / 100)} dari gaji`],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sanggupga-laporan-${slugify(result.cityName)}-${getDateStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Excel ───────────────────────────────────────────────────────────────────
async function exportXLSX(result: CalculationResult, profile: AppState['profile']) {
  const XLSX = await import('xlsx');
  const data = [
    { Kategori: 'Gaji Bersih', Tipe: 'Pemasukan', Jumlah: result.salary, Catatan: 'Take-home pay per bulan' },
    { Kategori: 'Tempat Tinggal', Tipe: 'Pengeluaran', Jumlah: result.breakdown.housing.value, Catatan: `Tipe: ${profile.housing.type}` },
    { Kategori: 'Makan & Minuman', Tipe: 'Pengeluaran', Jumlah: result.breakdown.food.value, Catatan: `Masak ${profile.food.cookRatio}%` },
    { Kategori: 'Transportasi', Tipe: 'Pengeluaran', Jumlah: result.breakdown.transport.value, Catatan: `Kendaraan: ${profile.transport.type}` },
    { Kategori: 'Utilitas', Tipe: 'Pengeluaran', Jumlah: result.breakdown.utilities.value, Catatan: 'Listrik, air, internet, langganan' },
    { Kategori: 'Tanggungan Keluarga', Tipe: 'Pengeluaran', Jumlah: result.breakdown.dependents.value, Catatan: 'Kirim ke orang tua/keluarga' },
    { Kategori: 'Gaya Hidup & Ekstra', Tipe: 'Pengeluaran', Jumlah: result.breakdown.lifestyle.value, Catatan: 'Hiburan + Belanja + Extras' },
    { Kategori: 'Cicilan Utang', Tipe: 'Pengeluaran', Jumlah: result.breakdown.debt.value, Catatan: 'Total cicilan bulanan' },
    { Kategori: 'Sisa Dana', Tipe: 'Saldo', Jumlah: result.sisa, Catatan: `${result.comfortLevel} — ${Math.round(result.sisaPercentage)}% dari gaji` },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 16 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
  const summary = [
    { Label: 'Kota', Nilai: result.cityName },
    { Label: 'Gaji Bersih', Nilai: result.salary },
    { Label: 'Total Pengeluaran', Nilai: result.totalExpense },
    { Label: 'Sisa Dana', Nilai: result.sisa },
    { Label: 'Status', Nilai: result.comfortLevel },
    { Label: 'Tangga Finansial', Nilai: `Stage ${result.ladder.stage} — ${result.ladder.title}` },
    { Label: 'UMK 2026 (est)', Nilai: result.umk },
    { Label: 'Dana Darurat Target (6×)', Nilai: result.danaDarurat6Bulan },
    { Label: 'Tanggal Laporan', Nilai: new Date().toLocaleDateString('id-ID') },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summary);
  ws2['!cols'] = [{ wch: 28 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan');
  XLSX.writeFile(wb, `sanggupga-laporan-${slugify(result.cityName)}-${getDateStr()}.xlsx`);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ExportButtons({ result, profile }: Props) {
  const btnCls =
    'flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container hover:border-primary text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm';

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => exportPDF(result, profile)} className={btnCls}>
        <Printer size={14} className="text-primary" /> PDF
      </button>
      <button onClick={() => exportCSV(result, profile)} className={btnCls}>
        <Download size={14} className="text-primary" /> CSV
      </button>
      <button onClick={() => exportXLSX(result, profile)} className={btnCls}>
        <FileSpreadsheet size={14} className="text-primary" /> Excel
      </button>
    </div>
  );
}
