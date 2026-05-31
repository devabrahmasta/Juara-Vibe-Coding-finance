export type UMKData = typeof import('./city_data.json');
export type CityRaw = UMKData['cities'][0];
export type Area = CityRaw['areas'][0];

export const cityData = require('./city_data.json') as UMKData;

export interface CategoryData {
  value: number;
  percentage?: number;
}

export interface ExpenseBreakdown {
  housing: CategoryData;
  food: CategoryData;
  transport: CategoryData;
  utilities: CategoryData;
  dependents: CategoryData;
  lifestyle: CategoryData;
  debt: CategoryData;
}

export type Verdict = 'SANGGUP' | 'PAS-PASAN' | 'TEKOR';
export type ComfortLevel = 'TEKOR' | 'BERTAHAN' | 'NYAMAN' | 'LEGA';

// Financial Ladder types
export interface LadderResult {
  stage: 0 | 1 | 2 | 3 | 4;
  title: string;
  emoji: string;
  description: string;
  fokusUtama: string;
  milestoneBerikutnya: string;
  milestoneTargetAmount?: number;
  milestoneTargetMonths?: number;
  actionItems: string[];
  sandwichNote?: string;
  debtNote?: string;
}

// Advice Card types
export interface AdviceCard {
  id: string;
  title: string;
  subtitle: string;
  actualValue: number;
  actualPct: number;
  recommendedPct?: number;
  status: 'baik' | 'perhatian' | 'bahaya';
  saran: string;
  unit: 'rupiah' | 'percent';
}

// Saving Tips types
export interface SavingTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  estimatedSaving: number;
}

// Category Benchmark types
export interface CategoryBenchmark {
  category: string;
  categoryLabel: string;
  actual: number;
  actualPct: number;
  recommendedPct: number;
  isOver: boolean;
  overByAmount: number;
  suggestion: string;
}

export interface CalculationResult {
  salary: number;
  totalExpense: number;
  sisa: number;
  sisaPercentage: number;
  verdict: Verdict;
  comfortLevel: ComfortLevel;
  breakdown: ExpenseBreakdown;
  ratio: number;
  salaryVsUmk: number;
  savingsPotential: number;
  cityTier: string;
  cityName: string;
  umk: number;
  comparedCities: { cityName: string; sisa: number }[];
  idealSalary: {
    bertahan: number;
    nyaman: number;
    lega: number;
  };
  rasioTabungan: number;
  rasioPengeluaran: number;
  danaDarurat6Bulan: number;
  bulanMenabungDarurat: number | null;
  // New fields from PRD
  ladder: LadderResult;
  adviceCards: AdviceCard[];
  savingTips: SavingTip[];
  categoryBenchmarks: CategoryBenchmark[];
}

export interface AppState {
  step: number;
  hasCompleted: boolean;
  profile: {
    cityId: string | null;
    areaId: string | null;
    salary: number;
    housing: {
      type: string;
      cost: number;
    };
    food: {
      mode: 'masak' | 'campur' | 'beli';
      cookRatio: number;
      eatOutFreq: number;
      eatOutCostPerSession: number;
      cost: number;
    };
    transport: {
      type: string;
      distance: string;
      distanceKm: number;
      cost: number;
    };
    utilities: {
      listrikAir: number;
      internetPulsa: number;
      subscriptions: number;
    };
    dependents: {
      kirimOrtu: number;
      status: string;
    };
    entertainment: number;
    shopping: number;
    debt: number;
    smokes: boolean;
    smokesCost: number;
    pets: boolean;
    gym: boolean;
    gymCost: number;
    mudikFreq: number;
    mudikCost: number;
    insurance: number;
  };
  result: CalculationResult | null;
}
