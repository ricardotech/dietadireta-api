import { z } from 'zod';
import { Objetivo, CaloriasDiarias, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

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
  goal: z.nativeEnum(Objetivo).describe('User goal'),
  calories: z.union([
    z.nativeEnum(CaloriasDiarias),
    z.string().transform((val) => {
      const numVal = parseInt(val);
      return numVal as unknown as CaloriasDiarias;
    })
  ]).describe('Daily calorie target'),
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
  aiResponse: z.string(),
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