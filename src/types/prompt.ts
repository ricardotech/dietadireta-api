import { z } from 'zod';
import { Objetivo, HorariosRefeicoesOption, Genero, NivelAtividade, TipoPlanoTreino } from './enums';

// Goal mapping to normalize client values to API enum values
const goalMapping: Record<string, Objetivo> = {
  'ganhar_peso': Objetivo.GANHAR_MASSA_MUSCULAR,
  'ganhar peso': Objetivo.GANHAR_MASSA_MUSCULAR,
  'emagrecer': Objetivo.EMAGRECER,
  'emagrecer_massa': Objetivo.EMAGRECER_MASSA,
  'emagrecer+massa': Objetivo.EMAGRECER_MASSA,
  'ganhar_massa': Objetivo.GANHAR_MASSA_MUSCULAR,
  'ganhar massa muscular': Objetivo.GANHAR_MASSA_MUSCULAR,
  'definicao_ganho': Objetivo.DEFINICAO_MUSCULAR_GANHAR,
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
  usesSupplements: z.boolean().optional().default(false),
  supplements: z.string().optional().default(''),
});

export const generatePromptResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    dietId: z.string().uuid(),
    message: z.string().optional(),
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

export const createCheckoutSchema = z.object({
  dietId: z.string().uuid('DietId must be a valid UUID').optional(),
  userInfo: z.object({
    email: z.string().email(),
    phoneNumber: z.string(),
    cpf: z.string(),
  }).optional(),
  userData: z.object({
    weight: z.string(),
    height: z.string(),
    age: z.string(),
    goal: z.string(),
    calories: z.string(),
    gender: z.string(),
    schedule: z.string(),
    activityLevel: z.string(),
    workoutPlan: z.string(),
    breakfast: z.string(),
    morningSnack: z.string(),
    lunch: z.string(),
    afternoonSnack: z.string(),
    dinner: z.string(),
  }).optional(),
}).refine(data => data.dietId || (data.userInfo && data.userData), {
  message: "Either dietId or both userInfo and userData must be provided"
});

export const createCheckoutResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    dietId: z.string().uuid(),
    orderId: z.string(),
    qrCodeUrl: z.string().optional(),
    qrCode: z.string().optional(),
    status: z.string(),
    amount: z.number(),
    expiresAt: z.string().optional(),
    message: z.string(),
    last_transaction: z.object({
      id: z.string(),
      transaction_type: z.string(),
      gateway_id: z.string(),
      amount: z.number(),
      status: z.string(),
      success: z.boolean(),
      gateway_response: z.object({}).passthrough(),
      antifraud_response: z.object({}).passthrough(),
      metadata: z.object({}).passthrough(),
      pix_provider_tid: z.string().optional(),
      qr_code: z.string(),
      qr_code_url: z.string(),
      expires_at: z.string(),
    }).optional(),
  }),
});

export const checkPaymentStatusParamsSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const checkPaymentStatusResponseSchema = z.object({
  success: z.boolean(),
  paid: z.boolean().optional(),
  processing: z.boolean().optional(),
  status: z.string().optional(),
  message: z.string(),
  data: z.object({
    dietId: z.string().uuid(),
    aiResponse: z.string().optional(),
    orderStatus: z.string(),
    createdAt: z.string(),
  }).optional(),
});

export const promptErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type GeneratePromptRequest = z.infer<typeof generatePromptSchema>;
export type GeneratePromptResponse = z.infer<typeof generatePromptResponseSchema>;
export type GetGeneratedPromptResponse = z.infer<typeof getGeneratedPromptResponseSchema>;
export type CreateCheckoutRequest = z.infer<typeof createCheckoutSchema>;
export type CreateCheckoutResponse = z.infer<typeof createCheckoutResponseSchema>;
export type CheckPaymentStatusParams = z.infer<typeof checkPaymentStatusParamsSchema>;
export type CheckPaymentStatusResponse = z.infer<typeof checkPaymentStatusResponseSchema>;