import { z } from 'zod';
import { Objetivo, CaloriasDiarias, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

export const generatePromptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  Peso: z.string().regex(/^\d+(\.\d+)?$/, 'Weight must be a valid number'),
  Altura: z.string().regex(/^\d+(\.\d+)?$/, 'Height must be a valid number'),
  Idade: z.string().regex(/^\d+$/, 'Age must be a valid integer'),
  Objetivo: z.nativeEnum(Objetivo).describe('User goal'),
  Calorias: z.nativeEnum(CaloriasDiarias).describe('Daily calorie target'),
  Genero: z.nativeEnum(Genero).describe('Gender'),
  Horarios: z.nativeEnum(HorariosRefeicoesOption).describe('Meal schedule'),
  nivelAtividade: z.nativeEnum(NivelAtividade).describe('Activity level'),
  treino: z.nativeEnum(TipoPlanoTreino).describe('Training plan type'),
  cafeDaManha: z.string().min(1, 'Breakfast preferences are required'),
  lancheDaManha: z.string().min(1, 'Morning snack preferences are required'),
  almoco: z.string().min(1, 'Lunch preferences are required'),
  lancheDaTarde: z.string().min(1, 'Afternoon snack preferences are required'),
  janta: z.string().min(1, 'Dinner preferences are required'),
});

export const generatePromptResponseSchema = z.object({
  success: z.boolean(),
  prompt: z.string(),
  data: z.object({
    userId: z.string().uuid(),
    peso: z.number().positive(),
    altura: z.number().positive(),
    idade: z.number().positive(),
    objetivo: z.nativeEnum(Objetivo),
    caloriasDiarias: z.nativeEnum(CaloriasDiarias),
    genero: z.nativeEnum(Genero),
    horariosParaRefeicoes: z.nativeEnum(HorariosRefeicoesOption),
    nivelAtividade: z.nativeEnum(NivelAtividade),
    planoTreino: z.nativeEnum(TipoPlanoTreino),
    cafeDaManha: z.array(z.string()),
    lancheDaManha: z.array(z.string()),
    almoco: z.array(z.string()),
    lancheDaTarde: z.array(z.string()),
    janta: z.array(z.string()),
  }),
});

export const promptErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type GeneratePromptRequest = z.infer<typeof generatePromptSchema>;
export type GeneratePromptResponse = z.infer<typeof generatePromptResponseSchema>;