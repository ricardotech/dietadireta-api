import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF format must be 000.000.000-00'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpRequest = z.infer<typeof signUpSchema>;
export type SignInRequest = z.infer<typeof signInSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    cpf: z.string(),
  }),
  token: z.string(),
  userToken: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phoneNumber?: string;
    cpf: string;
  };
  token: string;
  userToken: string;
}