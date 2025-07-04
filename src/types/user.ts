import { z } from 'zod';
import { Objetivo, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

export const createBodyMeasurementsSchema = z.object({
  weight: z.number().min(1, 'Weight must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
  age: z.number().min(1, 'Age must be greater than 0'),
  goal: z.nativeEnum(Objetivo),
  dailyCalories: z.number().min(1, 'Daily calories must be greater than 0').default(2000),
  mealSchedule: z.nativeEnum(HorariosRefeicoesOption).default(HorariosRefeicoesOption.PERSONALIZADO),
  gender: z.nativeEnum(Genero),
});

export const updateBodyMeasurementsSchema = createBodyMeasurementsSchema.partial();

export const createUserActivitySchema = z.object({
  activityLevel: z.nativeEnum(NivelAtividade),
  workoutPlan: z.nativeEnum(TipoPlanoTreino),
});

export const updateUserActivitySchema = createUserActivitySchema.partial();

export type CreateBodyMeasurementsRequest = z.infer<typeof createBodyMeasurementsSchema>;
export type UpdateBodyMeasurementsRequest = z.infer<typeof updateBodyMeasurementsSchema>;
export type CreateUserActivityRequest = z.infer<typeof createUserActivitySchema>;
export type UpdateUserActivityRequest = z.infer<typeof updateUserActivitySchema>;