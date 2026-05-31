import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { CalculationResult } from '@/lib/types';

export const maxDuration = 60;

// ── Format helper ─────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace('.0', '')}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
}

// ── Comfort label sesuai tangga (harus function karena butuh result) ──────────
// Mapping:
//   TEKOR    → stage 0 (sisa < 0)
//   BERTAHAN → stage 1 (sisa 0–15%)
//   NYAMAN   → stage 2 (sisa 15–35%)
//   LEGA     → stage 3 (>35%, ada beban utang/sandwich berat)
//              stage 4 (>35%, sehat finansial)
function getComfortLabel(result: CalculationResult): string {
  const labels = [
    'Tangga 0 — Defisit (pengeluaran melebihi gaji)',
    'Tangga 1 — Stabil (sisa 0–15%, belum bisa menabung)',
    'Tangga 2 — Mulai menabung (sisa 15–35%)',
    'Tangga 3 — Stabil tapi ada beban (utang berat atau generasi sandwich)',
    'Tangga 4 — Sehat finansial (bisa investasi rutin)',
  ];
  return labels[result.ladder.stage] ?? `Stage ${result.ladder.stage}`;
}

// ── Retry with exponential backoff ────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseMs = 1200,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.httpError?.status;
      const isRetryable = status === 503 || status === 429 || status === 500;
      if (!isRetryable || attempt === maxAttempts - 1) throw err;
      await new Promise((r) => setTimeout(r, baseMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

// ── Model fallback chain ──────────────────────────────────────────────────────
const MODEL_CHAIN = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];

async function generateWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
  let lastError: unknown;
  for (const model of MODEL_CHAIN) {
    try {
      const response = await withRetry(() =>
        ai.models.generateContent({ model, contents: prompt })
      );
      return response.text ?? '';
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.httpError?.status;
      if (status !== 503 && status !== 429) throw err;
    }
  }
  throw lastError;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    });

    const { profile, result }: { profile: any; result: CalculationResult } =
      await req.json();

    // Top 2 pengeluaran terbesar
    const topTwo = Object.entries(result.breakdown)
      .map(([k, v]) => ({ k, val: v.value, pct: v.percentage ?? 0 }))
      .filter((e) => e.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, 2)
      .map((e) => {
        const label: Record<string, string> = {
          housing: 'tempat tinggal',
          food: 'makan & minum',
          transport: 'transportasi',
          utilities: 'utilitas',
          dependents: 'tanggungan keluarga',
          lifestyle: 'gaya hidup',
          debt: 'cicilan/utang',
        };
        return `${label[e.k] ?? e.k} ${fmt(e.val)} (${e.pct.toFixed(0)}%)`;
      })
      .join(' dan ');

    // Flag kondisi khusus
    const flags: string[] = [];
    if ((profile.dependents?.kirimOrtu ?? 0) > 0)
      flags.push(`generasi sandwich: kirim ${fmt(profile.dependents.kirimOrtu)}/bln`);
    if (result.breakdown.debt?.value > result.salary * 0.2)
      flags.push(`cicilan berat: ${fmt(result.breakdown.debt.value)}/bln`);
    if (profile.smokes)
      flags.push(`rokok/vape: ${fmt(profile.smokesCost ?? 0)}/bln`);
    if ((profile.mudikFreq ?? 0) > 0)
      flags.push(`mudik ${profile.mudikFreq}×/tahun`);

    const prompt = `
Kamu adalah Sanggup Ga? — asisten keuangan personal yang bicara jujur dan empatik.

DATA USER:
- Kota: ${result.cityName} | UMK: ${fmt(result.umk)}
- Gaji: ${fmt(result.salary)} (${result.salaryVsUmk >= 0 ? '+' : ''}${result.salaryVsUmk.toFixed(0)}% vs UMK)
- Pengeluaran: ${fmt(result.totalExpense)} | Sisa: ${fmt(result.sisa)} (${result.sisaPercentage.toFixed(1)}%)
- Status: ${getComfortLabel(result)}
- Tangga finansial: Stage ${result.ladder.stage} — ${result.ladder.title}
- Fokus sekarang: ${result.ladder.fokusUtama}
- 2 pengeluaran terbesar: ${topTwo}
${flags.length > 0 ? `- Kondisi khusus: ${flags.join('; ')}` : ''}
- Gaji ideal "nyaman": ${fmt(result.idealSalary?.nyaman ?? 0)}
- Target dana darurat: ${fmt(result.danaDarurat6Bulan ?? 0)}
${result.sisa > 0 && result.bulanMenabungDarurat ? `- Estimasi kumpul dana darurat: ${Math.ceil(result.bulanMenabungDarurat)} bulan` : ''}

INSTRUKSI:
Tulis 2–3 paragraf singkat dalam bahasa Indonesia santai-profesional.
- Paragraf 1: validasi kondisi jujur-empatik, pakai angka dari data di atas.
- Paragraf 2: soroti 1–2 pengeluaran dominan + saran konkret spesifik.
- Paragraf 3 (opsional): milestone realistis atau harapan yang bisa dicapai.
Jangan sebut produk/app spesifik. Gunakan hanya angka dari data. Output: teks polos tanpa bullet, header, atau markdown.
`.trim();

    const insight = await generateWithFallback(ai, prompt);
    return NextResponse.json({ insight });
  } catch (error: any) {
    const status = error?.status ?? error?.httpError?.status ?? 500;
    if (status === 503 || status === 429) {
      return NextResponse.json(
        {
          insight:
            'Analisis AI sedang tidak tersedia karena permintaan sedang tinggi. ' +
            'Silakan coba lagi dalam beberapa saat. ' +
            'Data dan kalkulasi di atas tetap akurat dan bisa kamu gunakan.',
          fallback: true,
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ error: error?.message ?? 'Unknown error' }, { status: 500 });
  }
}