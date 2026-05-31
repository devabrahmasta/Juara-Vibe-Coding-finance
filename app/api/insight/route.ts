import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { CalculationResult } from '@/lib/types';

export const maxDuration = 30; // Seconds

export async function POST(req: NextRequest) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
    const { profile, result }: { profile: any, result: CalculationResult } = await req.json();

    const prompt = `
Anda adalah konsultan keuangan yang penuh empati. 
User telah memberikan data keuangannya dan bertanya "Sanggup Ga?" hidup di kota ${result.cityName}.
Hasil perhitungan:
- Gaji: Rp ${result.salary}
- Total Pengeluaran: Rp ${result.totalExpense}
- Sisa Uang: Rp ${result.sisa} (${result.comfortLevel})
- Kategori terbesar pengeluaran adalah ${Object.keys(result.breakdown).reduce((a, b) => (result.breakdown[a as keyof typeof result.breakdown].value > result.breakdown[b as keyof typeof result.breakdown].value ? a : b))}

Berikan 2-3 paragraf analisis singkat dan sugesti ramah untuk mereka dalam bahasa Indonesia.
1. Jelaskan terang-terangan apakah gaji mereka cukup di kota tersebut.
2. Identifikasi pengeluaran yang besar dan beri saran 1-2 ide hemat konkret (misalnya "In this economy, coba...").
3. Nada bicara: empatik, santai tapi profesional, suportif.
Jangan merekomendasikan investasi/produk spesifik. Jangan pakai angka palsu, gunakan angka hasil hitungan jika dibutuhkan.
`;
    // We strictly use gemini-3.5-flash as specified in guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ insight: response.text });
  } catch (error: any) {
    console.error('Error generating insight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
