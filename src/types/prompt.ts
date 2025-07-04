import { z } from 'zod';
import { Objetivo, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

// Goal mapping to normalize client values to API enum values
const goalMapping: Record<string, Objetivo> = {
  'ganhar_peso': Objetivo.GANHAR_MASSA_MUSCULAR,
  'ganhar peso': Objetivo.GANHAR_MASSA_MUSCULAR,
  'emagrecer': Objetivo.EMAGRECER,
  'emagrecer+massa': Objetivo.EMAGRECER_MASSA,
  'ganhar massa muscular': Objetivo.GANHAR_MASSA_MUSCULAR,
  'definicao muscular + ganhar massa': Objetivo.DEFINICAO_MUSCULAR_GANHAR,
};

// Schedule mapping to normalize client values to API enum values
const scheduleMapping: Record<string, HorariosRefeicoesOption> = {
  'padrao': HorariosRefeicoesOption.H0700, // Default to 07:00-10:00-12:30-15:30-19:30
  'padrão': HorariosRefeicoesOption.H0700,
  'personalizado': HorariosRefeicoesOption.PERSONALIZADO,
  '05:30-08:30-12:00-15:00-19:00': HorariosRefeicoesOption.H0530,
  '06:00-09:00-12:00-15:00-19:00': HorariosRefeicoesOption.H0600,
  '06:30-09:30-13:00-16:00-20:00': HorariosRefeicoesOption.H0630,
  '07:00-10:00-12:30-15:30-19:30': HorariosRefeicoesOption.H0700,
  '07:30-10:30-12:00-15:00-19:00': HorariosRefeicoesOption.H0730,
  '08:00-11:00-13:30-16:30-20:30': HorariosRefeicoesOption.H0800,
  '09:00-11:00-13:00-16:00-21:00': HorariosRefeicoesOption.H0900,
};

export const generatePromptSchema = z.object({
  weight: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Weight must be a valid number')
    .refine((val) => {
      const num = parseFloat(val);
      return num > 0 && num <= 999.99;
    }, 'Weight must be between 0.01 and 999.99 kg'),
  height: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Height must be a valid number')
    .refine((val) => {
      const num = parseFloat(val);
      return num > 0 && num <= 999.99;
    }, 'Height must be between 0.01 and 999.99 cm'),
  age: z.string()
    .regex(/^\d+$/, 'Age must be a valid integer')
    .refine((val) => {
      const num = parseInt(val);
      return num > 0 && num <= 150;
    }, 'Age must be between 1 and 150 years'),
  goal: z.string()
    .transform((val) => {
      const lowerVal = val.toLowerCase().trim();
      const mappedGoal = goalMapping[lowerVal];
      if (!mappedGoal) {
        throw new Error(`Invalid goal value: ${val}. Expected one of: ${Object.keys(goalMapping).join(', ')}`);
      }
      return mappedGoal;
    })
    .describe('User goal'),
  calories: z.string()
    .regex(/^\d+$/, 'Calories must be a valid number')
    .refine((val) => {
      const num = parseInt(val);
      return num > 0 && num <= 10000;
    }, 'Calories must be between 1 and 10000')
    .describe('Daily calorie target'),
  gender: z.nativeEnum(Genero).describe('Gender'),
  schedule: z.string()
    .transform((val) => {
      const lowerVal = val.toLowerCase().trim();
      const mappedSchedule = scheduleMapping[lowerVal] || scheduleMapping[val]; // Try exact match too
      if (!mappedSchedule) {
        throw new Error(`Invalid schedule value: ${val}. Expected one of: ${Object.keys(scheduleMapping).join(', ')}`);
      }
      return mappedSchedule;
    })
    .describe('Meal schedule'),
  activityLevel: z.nativeEnum(NivelAtividade).describe('Activity level'),
  workoutPlan: z.nativeEnum(TipoPlanoTreino).describe('Training plan type'),
  breakfast: z.string().min(1, 'Breakfast preferences are required'),
  morningSnack: z.string().min(1, 'Morning snack preferences are required'),
  lunch: z.string().min(1, 'Lunch preferences are required'),
  afternoonSnack: z.string().min(1, 'Afternoon snack preferences are required'),
  dinner: z.string().min(1, 'Dinner preferences are required'),
});

export const generatePromptResponseSchema = z.object({
  success: z.boolean(),
  prompt: z.string(),
  aiResponse: z.string(),
  data: z.object({
    userId: z.string().uuid(),
    weight: z.number().positive(),
    height: z.number().positive(),
    age: z.number().positive(),
    goal: z.nativeEnum(Objetivo),
    dailyCalories: z.number().positive(),
    gender: z.nativeEnum(Genero),
    mealSchedule: z.nativeEnum(HorariosRefeicoesOption),
    activityLevel: z.nativeEnum(NivelAtividade),
    workoutPlan: z.nativeEnum(TipoPlanoTreino),
    breakfast: z.array(z.string()),
    morningSnack: z.array(z.string()),
    lunch: z.array(z.string()),
    afternoonSnack: z.array(z.string()),
    dinner: z.array(z.string()),
  }),
});

export const getGeneratedPromptResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    prompt: z.string(),
    aiResponse: z.string(),
    userData: z.any(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const promptErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type GeneratePromptRequest = z.infer<typeof generatePromptSchema>;
export type GeneratePromptResponse = z.infer<typeof generatePromptResponseSchema>;
export type GetGeneratedPromptResponse = z.infer<typeof getGeneratedPromptResponseSchema>;