import { z } from 'zod';
import { Objetivo, CaloriasDiarias, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

export const createBodyMeasurementsSchema = z.object({
  peso: z.number().min(1, 'Weight must be greater than 0'),
  altura: z.number().min(1, 'Height must be greater than 0'),
  idade: z.number().min(1, 'Age must be greater than 0'),
  objetivo: z.nativeEnum(Objetivo),
  caloriasDiarias: z.nativeEnum(CaloriasDiarias).default(CaloriasDiarias.DESCONHECIDO),
  horariosParaRefeicoes: z.nativeEnum(HorariosRefeicoesOption).default(HorariosRefeicoesOption.PERSONALIZADO),
  genero: z.nativeEnum(Genero),
});

export const updateBodyMeasurementsSchema = createBodyMeasurementsSchema.partial();

export const createUserActivitySchema = z.object({
  nivelAtividade: z.nativeEnum(NivelAtividade),
  planoTreino: z.nativeEnum(TipoPlanoTreino),
});

export const updateUserActivitySchema = createUserActivitySchema.partial();

export type CreateBodyMeasurementsRequest = z.infer<typeof createBodyMeasurementsSchema>;
export type UpdateBodyMeasurementsRequest = z.infer<typeof updateBodyMeasurementsSchema>;
export type CreateUserActivityRequest = z.infer<typeof createUserActivitySchema>;
export type UpdateUserActivityRequest = z.infer<typeof updateUserActivitySchema>;