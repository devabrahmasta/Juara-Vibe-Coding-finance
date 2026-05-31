'use client';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CalculationResult, AppState, cityData } from '@/lib/types';
import { formatIDR, formatPercent } from '@/lib/format';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    fontSize: 10,
    color: '#1A1A1A',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4EEE7',
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#00A86B' },
  tagline: { fontSize: 9, color: '#4A5E52', marginTop: 3 },
  dateText: { fontSize: 9, color: '#7A9382' },
  heroBox: {
    backgroundColor: '#E6F7F1',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSisa: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: '#00A86B' },
  heroBadge: {
    backgroundColor: '#00A86B',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  heroMeta: { fontSize: 9, color: '#4A5E52', marginTop: 3 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#4A5E52',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF3EE',
    paddingBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  rowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    backgroundColor: '#F2F7F4',
    padding: 4,
    borderRadius: 4,
  },
  label: { fontSize: 9, color: '#4A5E52' },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1A1A1A' },
  valueGreen: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#00A86B' },
  valueRed: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#D32F2F' },
  barContainer: { height: 6, backgroundColor: '#DDE9E0', borderRadius: 3, marginVertical: 6 },
  barFill: { height: 6, backgroundColor: '#00A86B', borderRadius: 3 },
  ladderBox: {
    backgroundColor: '#F2F7F4',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  ladderTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#00A86B', marginBottom: 4 },
  ladderText: { fontSize: 9, color: '#4A5E52', lineHeight: 1.4 },
  disclaimer: {
    fontSize: 8,
    color: '#7A9382',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EBF3EE',
    paddingTop: 8,
    lineHeight: 1.5,
  },
  twoCol: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  col: { flex: 1 },
});

export function PdfReport({
  result,
  profile,
}: {
  result: CalculationResult;
  profile: AppState['profile'];
}) {
  const city = cityData.cities.find((c) => c.id === profile.cityId);
  const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const expenseFill = Math.min(100, result.ratio);

  const breakdownItems = [
    { label: 'Tempat Tinggal', value: result.breakdown.housing.value, pct: result.breakdown.housing.percentage ?? 0 },
    { label: 'Makan & Minuman', value: result.breakdown.food.value, pct: result.breakdown.food.percentage ?? 0 },
    { label: 'Transportasi', value: result.breakdown.transport.value, pct: result.breakdown.transport.percentage ?? 0 },
    { label: 'Utilitas & Langganan', value: result.breakdown.utilities.value, pct: result.breakdown.utilities.percentage ?? 0 },
    { label: 'Tanggungan Keluarga', value: result.breakdown.dependents.value, pct: result.breakdown.dependents.percentage ?? 0 },
    { label: 'Gaya Hidup & Extras', value: result.breakdown.lifestyle.value, pct: result.breakdown.lifestyle.percentage ?? 0 },
    { label: 'Cicilan Utang', value: result.breakdown.debt.value, pct: result.breakdown.debt.percentage ?? 0 },
  ].filter((i) => i.value > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Sanggup Ga?</Text>
            <Text style={styles.tagline}>Laporan Analisis Keuangan Pribadi</Text>
            <Text style={styles.tagline}>
              {result.cityName}{city?.umk_verified ? ' · Data UMK resmi BPS' : ' · Estimasi UMK'}
            </Text>
          </View>
          <Text style={styles.dateText}>{now}</Text>
        </View>

        {/* HERO */}
        <View style={styles.heroBox}>
          <View>
            <Text style={{ fontSize: 8, color: '#4A5E52', marginBottom: 4 }}>ESTIMASI SISA DANA PER BULAN</Text>
            <Text style={styles.heroSisa}>{formatIDR(result.sisa)}</Text>
            <Text style={styles.heroMeta}>
              Gaji {formatIDR(result.salary)} · Pengeluaran {formatPercent(result.ratio / 100)}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{result.comfortLevel}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.barContainer}>
          <View style={[styles.barFill, { width: `${expenseFill}%`, backgroundColor: '#C2D5CA' }]} />
        </View>

        {/* TWO COLUMNS: Distribusi + Realitas */}
        <View style={styles.twoCol}>

          {/* LEFT: Distribusi Pengeluaran */}
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Distribusi Pengeluaran</Text>
            {breakdownItems.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{formatIDR(item.value)} ({Math.round(item.pct)}%)</Text>
              </View>
            ))}
            <View style={[styles.rowHighlight, { marginTop: 4 }]}>
              <Text style={[styles.label, { fontFamily: 'Helvetica-Bold', color: '#1A1A1A' }]}>Total Pengeluaran</Text>
              <Text style={styles.valueRed}>{formatIDR(result.totalExpense)}</Text>
            </View>
            <View style={styles.rowHighlight}>
              <Text style={[styles.label, { fontFamily: 'Helvetica-Bold', color: '#00A86B' }]}>Sisa Dana</Text>
              <Text style={styles.valueGreen}>{formatIDR(result.sisa)}</Text>
            </View>
          </View>

          {/* RIGHT: Realitas Gaji */}
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Realitas Gaji di {result.cityName}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Pemasukan</Text>
              <Text style={styles.value}>{formatIDR(result.salary)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>UMK 2026 {city?.umk_verified ? '(resmi)' : '(est)'}</Text>
              <Text style={styles.value}>{formatIDR(result.umk)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gaji vs UMK</Text>
              <Text style={result.salaryVsUmk >= 0 ? styles.valueGreen : styles.valueRed}>
                {result.salaryVsUmk >= 0 ? '+' : ''}{formatPercent(result.salaryVsUmk / 100)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gaji Ideal Nyaman</Text>
              <Text style={styles.valueGreen}>{formatIDR(result.idealSalary.nyaman)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Gaji Ideal Lega</Text>
              <Text style={styles.value}>{formatIDR(result.idealSalary.lega)}</Text>
            </View>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Indikator Finansial</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Rasio Pengeluaran</Text>
              <Text style={styles.value}>{formatPercent(result.ratio / 100)} (target ≤ 80%)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Potensi Tabungan/Tahun</Text>
              <Text style={result.savingsPotential > 0 ? styles.valueGreen : styles.valueRed}>
                {result.savingsPotential > 0 ? formatIDR(result.savingsPotential) : 'Belum bisa'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Target Dana Darurat (6×)</Text>
              <Text style={styles.value}>{formatIDR(result.danaDarurat6Bulan)}</Text>
            </View>
            {result.bulanMenabungDarurat && (
              <View style={styles.row}>
                <Text style={styles.label}>Estimasi tercapai dalam</Text>
                <Text style={styles.value}>{Math.ceil(result.bulanMenabungDarurat)} bulan</Text>
              </View>
            )}
          </View>
        </View>

        {/* TANGGA FINANSIAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tangga Finansial</Text>
          <View style={styles.ladderBox}>
            <Text style={styles.ladderTitle}>
              {result.ladder.emoji} Stage {result.ladder.stage}: {result.ladder.title}
            </Text>
            <Text style={styles.ladderText}>{result.ladder.fokusUtama}</Text>
            <Text style={[styles.ladderText, { marginTop: 6, color: '#1A1A1A' }]}>
              Target Naik Tangga: {result.ladder.milestoneBerikutnya}
            </Text>
          </View>
        </View>

        {/* ALTERNATIF KOTA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alternatif Kota (gaji sama)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {result.comparedCities.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', width: '47%' }}>
                <Text style={styles.label}>{c.cityName}</Text>
                <Text style={c.sisa > 0 ? styles.valueGreen : styles.valueRed}>
                  {c.sisa > result.sisa ? '↑' : '↓'} {formatIDR(c.sisa)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* DISCLAIMER */}
        <Text style={styles.disclaimer}>
          Laporan ini dihasilkan oleh Sanggup Ga? pada {now}. Data UMK/UMP bersumber dari BPS Statistik
          Indonesia 2026 dan estimasi Kemnaker. Estimasi biaya hidup berbasis tier kota dan dapat berbeda
          dengan kondisi aktual. Laporan ini bersifat informatif dan bukan saran finansial profesional.
          Untuk keputusan finansial penting, konsultasikan dengan perencana keuangan tersertifikasi (CFP).
        </Text>

      </Page>
    </Document>
  );
}
