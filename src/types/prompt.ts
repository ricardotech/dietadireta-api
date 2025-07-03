import { z } from 'zod';
import { Objetivo, CaloriasDiarias, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

export const generatePromptSchema = z.object({
  weight: z.string().regex(/^\d+(\.\d+)?$/, 'Weight must be a valid number'),
  height: z.string().regex(/^\d+(\.\d+)?$/, 'Height must be a valid number'),
  age: z.string().regex(/^\d+$/, 'Age must be a valid integer'),
  goal: z.nativeEnum(Objetivo).describe('User goal'),
  calories: z.nativeEnum(CaloriasDiarias).describe('Daily calorie target'),
  gender: z.nativeEnum(Genero).describe('Gender'),
  schedule: z.nativeEnum(HorariosRefeicoesOption).describe('Meal schedule'),
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
  data: z.object({
    userId: z.string().uuid(),
    weight: z.number().positive(),
    height: z.number().positive(),
    age: z.number().positive(),
    goal: z.nativeEnum(Objetivo),
    dailyCalories: z.nativeEnum(CaloriasDiarias),
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

export const promptErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type GeneratePromptRequest = z.infer<typeof generatePromptSchema>;
export type GeneratePromptResponse = z.infer<typeof generatePromptResponseSchema>;