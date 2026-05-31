import { useReducer, useEffect, Dispatch } from 'react';
import { AppState, cityData } from './types';

export const initialProfile: AppState['profile'] = {
  cityId: null,
  areaId: null,
  salary: 0,
  housing: { type: 'kos', cost: 0 },
  food: { mode: 'campur' as const, cookRatio: 50, eatOutFreq: 2, eatOutCostPerSession: 0, cost: 0 },
  transport: { type: 'motor', distance: 'sedang', distanceKm: 10, cost: 0 },
  utilities: { listrikAir: 0, internetPulsa: 0, subscriptions: 0 },
  dependents: { kirimOrtu: 0, status: 'sendiri' },
  entertainment: 350000,
  shopping: 200000,
  debt: 0,
  smokes: false,
  smokesCost: 0,
  pets: false,
  gym: false,
  gymCost: 250000,
  mudikFreq: 0,
  mudikCost: 1000000,
  insurance: 0,
};

export function estimateTransportCost(type: string, km: number, baseline?: any): number {
  const pp = km * 2; // pulang pergi
  const days = 22;   // hari kerja
  if (type === 'motor') return Math.round(pp * days * 110 + 150000); // bensin ~Rp110/km + servis
  if (type === 'mobil') return Math.round(pp * days * 180 + 350000); // lebih boros
  if (type === 'umum') return Math.min(Math.round(pp * days * 40), baseline?.transport_umum * 1.2 || 500000);
  return 0; // sepeda/jalan
}

export const initialState: AppState = {
  step: 0,
  hasCompleted: false,
  profile: initialProfile,
  result: null,
};

export type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AppState['profile']> }
  | { type: 'UPDATE_NESTED_PROFILE'; category: keyof AppState['profile']; payload: any }
  | { type: 'SET_RESULT'; payload: NonNullable<AppState['result']> }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 7) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 1) };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'UPDATE_PROFILE': {
      const newProfile = { ...state.profile, ...action.payload };
      
      // Auto-fill logic when city changes:
      if (action.payload.cityId && action.payload.cityId !== state.profile.cityId) {
        const city = cityData.cities.find(c => c.id === action.payload.cityId);
        if (city) {
          // Keep defaults if present, auto-fill baseline if user hasn't explicitly set costs or just default to baseline
          const defaultArea = city.areas?.[1] || city.areas?.[0] || null;
          newProfile.areaId = defaultArea ? defaultArea.id : null;
          
          let hMult = 1, tMult = 1;
          if (defaultArea) {
            hMult = defaultArea.housing_multiplier || 1;
            tMult = defaultArea.transport_multiplier || 1;
          }
          
          newProfile.housing.cost = (city.baseline.kos || 1500000) * hMult;
          newProfile.food.cost = (city.baseline.makan_beli || 2000000) * 0.7; // mix
          newProfile.transport.cost = (city.baseline.transport_motor || 500000) * tMult;
          newProfile.utilities.listrikAir = (city.baseline.utilitas || 600000) * 0.6;
          newProfile.utilities.internetPulsa = (city.baseline.utilitas || 600000) * 0.4;
        }
      }

      // Auto-fill area logic changes:
      if (action.payload.areaId && action.payload.areaId !== state.profile.areaId) {
         const city = cityData.cities.find(c => c.id === state.profile.cityId);
         if (city) {
           const area = city.areas?.find(a => a.id === action.payload.areaId);
           if (area) {
             const hMult = area.housing_multiplier || 1;
             const tMult = area.transport_multiplier || 1;
             // Only auto adjust if it resembles a base value, but to keep it simple, just update the cost.
             newProfile.housing.cost = (city.baseline.kos || 1500000) * hMult;
             newProfile.transport.cost = (city.baseline.transport_motor || 500000) * tMult;
           }
         }
      }
      
      return { ...state, profile: newProfile };
    }
    case 'UPDATE_NESTED_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          [action.category]: {
            ...(state.profile[action.category] as any),
            ...action.payload,
          }
        },
      };
    case 'SET_RESULT':
      return { ...state, result: action.payload, hasCompleted: true };
    case 'RESET':
      return { ...initialState };
    case 'LOAD_STATE': {
      const saved = action.payload;
      const savedProfile = saved.profile as any;
      // Backward compat: map old lifestyleLevel to entertainment+shopping
      const entertainment = savedProfile?.entertainment
        ?? (savedProfile?.lifestyleLevel === 'aktif' ? 1000000
          : savedProfile?.lifestyleLevel === 'standar' ? 350000
          : savedProfile?.lifestyleLevel === 'minim' ? 0
          : initialProfile.entertainment);
      const shopping = savedProfile?.shopping
        ?? (savedProfile?.lifestyleLevel === 'aktif' ? 500000
          : savedProfile?.lifestyleLevel === 'standar' ? 200000
          : initialProfile.shopping);
      return {
        ...initialState,
        ...saved,
        profile: {
          ...initialProfile,
          ...savedProfile,
          food: { ...initialProfile.food, ...savedProfile?.food },
          transport: { ...initialProfile.transport, ...savedProfile?.transport },
          utilities: { ...initialProfile.utilities, ...savedProfile?.utilities },
          dependents: { ...initialProfile.dependents, ...savedProfile?.dependents },
          entertainment,
          shopping,
          gymCost: savedProfile?.gymCost ?? initialProfile.gymCost,
          mudikCost: savedProfile?.mudikCost ?? initialProfile.mudikCost,
        }
      };
    }
    default:
      return state;
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanggupga_state');
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sanggupga_state', JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
