export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSection {
  main: FoodItem[];
  alternatives: FoodItem[];
  mealTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserParameters {
  weight: number;
  objective: string;
  trainingFrequency: string;
  activityType: string;
  wheyProtein: boolean;
  hypercaloric: boolean;
  proteinTarget: number;
  proteinPerMeal: number;
  tmb: number;
  targetCalories: number;
}

export interface MacroDistribution {
  carbs: { percentage: number; grams: number; calories: number };
  protein: { percentage: number; grams: number; calories: number };
  fat: { percentage: number; grams: number; calories: number };
}

export interface SupplementOption {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  usage: string;
}

export interface SupplementationSection {
  wheyProtein: {
    available: boolean;
    options: SupplementOption[];
  };
  hipercalorico: {
    available: boolean;
    options: SupplementOption[];
  };
  instructions: string;
}

export interface ScientificValidation {
  proteinPerKg: number;
  proteinPerMealOk: boolean;
  macroDistributionOk: boolean;
  caloricBalanceOk: boolean;
  trainingFrequencySupported: boolean;
  carbsAdequateForFrequency: boolean;
  supplementationSectionComplete: boolean;
}

export interface StructuredDietResponse {
  userParams: UserParameters;
  macroDistribution: MacroDistribution;
  cafeDaManha: MealSection;
  lancheDaManha?: MealSection | null;
  almoco: MealSection;
  lancheDaTarde?: MealSection | null;
  jantar: MealSection;
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  suplementacao?: SupplementationSection;
  scientificValidation: ScientificValidation;
  notes: string;
}

export interface DietGenerationParams {
  weight: number;
  height?: number;
  age?: number;
  gender?: string;
  objective: string;
  trainingFrequency: '2-3' | '3-5' | '5-7';
  activityType: 'musculacao' | 'cardio' | 'misto';
  wheyProtein: boolean;
  hypercaloric: boolean;
  preferences: string[];
  restrictions: string[];
  healthConditions?: string[];
  morningSnackActive: boolean;
  afternoonSnackActive: boolean;
}