import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  cpf: z.string().min(1, 'CPF is required').refine(
    (value) => {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Check if has 11 digits
      if (digitsOnly.length !== 11) return false;
      
      // Check for known invalid CPFs (all same digits)
      if (/^(\d)\1{10}$/.test(digitsOnly)) return false;
      
      // Validate CPF algorithm
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(digitsOnly.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(digitsOnly.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(digitsOnly.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(digitsOnly.charAt(10))) return false;
      
      return true;
    },
    'Invalid CPF'
  ),
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